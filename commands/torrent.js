const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const parseTorrent = require('parse-torrent');
const WebTorrent = require('webtorrent');
const archiver = require('archiver');
const { API_URL } = require("../config");
const { setAwaitingTorrent } = require("../common/memory");

const activeUploads = new Set();

module.exports = async function upload(chatId, userMessage, sendMessage, file = null) {
    setAwaitingTorrent(chatId);
    if (!file) {
        await sendMessage(chatId, "📤 Please send a `.torrent` file to upload.");
        activeUploads.add(chatId);
        return;
    }

    if (!activeUploads.has(chatId)) return;
    activeUploads.delete(chatId);

    try {
        const fileName = file.file_name || "unknown.torrent";
        const filePath = path.join(__dirname, `../downloads/${chatId}-${Date.now()}.torrent`);

        const fileUrl = `${API_URL}/getFile?file_id=${file.file_id}`;
        const { data: fileMeta } = await axios.get(fileUrl);
        const downloadUrl = `https://api.telegram.org/file/bot${process.env.TOKEN}/${fileMeta.result.file_path}`;
        const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(filePath, response.data);

        let parsed;
        try {
            parsed = parseTorrent(fs.readFileSync(filePath));
        } catch (err) {
            await sendMessage(chatId, "❌ Invalid torrent file. Upload cancelled.");
            fs.unlinkSync(filePath);
            return;
        }

        const totalSize = parsed.files.reduce((sum, file) => sum + file.length, 0);
        if (totalSize > 1.9 * 1024 * 1024 * 1024) {
            await sendMessage(chatId, "⚠️ Torrent too large to send via Telegram. Please download it manually.");
            fs.unlinkSync(filePath);
            return;
        }

        await sendMessage(chatId, `📥 Downloading torrent: <b>${parsed.name}</b>`, 'HTML');

        const client = new WebTorrent();
        const torrent = await new Promise((resolve, reject) => {
            client.add(filePath, { path: path.join(__dirname, `../downloads/${chatId}`) }, t => {
                t.on('done', () => resolve(t));
                t.on('error', reject);
            });
        });

        const zipPath = path.join(__dirname, `../downloads/${chatId}-${Date.now()}.zip`);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.pipe(output);
        torrent.files.forEach(f => {
            const source = path.join(torrent.path, f.path);
            archive.file(source, { name: f.path });
        });

        await archive.finalize();

        const form = new FormData();
        form.append('chat_id', chatId);
        form.append('document', fs.createReadStream(zipPath), {
            filename: `${parsed.name}.zip`
        });

        await axios.post(`${API_URL}/sendDocument`, form, {
            headers: form.getHeaders()
        });

        fs.unlinkSync(filePath);
        fs.unlinkSync(zipPath);
        fs.rmSync(path.join(__dirname, `../downloads/${chatId}`), { recursive: true, force: true });
        client.destroy();

    } catch (err) {
        console.error("❌ Upload error:", err.message);
        await sendMessage(chatId, "❌ Failed to process the torrent file.");
    }
};

module.exports.syntax = "/torrent - Upload a .torrent file and receive content as zip.";
module.exports.file = true;
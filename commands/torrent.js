import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import WebTorrent from 'webtorrent';
import archiver from 'archiver';
import parseTorrent from 'parse-torrent';
import { API_URL } from '../config.js';
import { setAwaitingTorrent } from '../common/memory.js';

const activeUploads = new Set();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function torrent(chatId, userMessage, sendMessage, callback_data, file = null) {
    if (!file) {
        setAwaitingTorrent(chatId);
        await sendMessage(chatId, "📤 Please send a `.torrent` file to upload.");
        activeUploads.add(chatId);
        return;
    }

    if (!activeUploads.has(chatId)) return;
    activeUploads.delete(chatId);

    const downloadsDir = path.join(__dirname, '../downloads');
    const torrentFilePath = path.join(downloadsDir, `${chatId}-${Date.now()}.torrent`);
    const extractDir = path.join(downloadsDir, `${chatId}`);
    const zipPath = path.join(downloadsDir, `${chatId}-${Date.now()}.zip`);

    let client;

    try {
        const fileUrl = `${API_URL}/getFile?file_id=${file.file_id}`;
        const { data: fileMeta } = await axios.get(fileUrl);
        console.log("fileMeta:", fileMeta);
        const downloadUrl = `https://api.telegram.org/file/bot${process.env.TOKEN}/${fileMeta.result.file_path}`;
        console.log("Download URL:", downloadUrl);
        const { data } = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(torrentFilePath, data);

        let parsed;
        try {
            parsed = parseTorrent(fs.readFileSync(torrentFilePath));
        } catch {
            await sendMessage(chatId, "⚠️ Invalid or corrupted `.torrent` file.");
            return;
        }

        const totalSize = parsed.files?.reduce((sum, f) => sum + f.length, 0) || 0;
        if (totalSize > 1.9 * 1024 * 1024 * 1024) {
            await sendMessage(chatId, "⚠️ Torrent contents exceed 1.9 GB and cannot be sent via Telegram.");
            return;
        }

        client = new WebTorrent();
        const torrent = await new Promise((resolve, reject) => {
            client.add(torrentFilePath, { path: extractDir }, torrent => {
                let lastSent = 0;
                const interval = setInterval(() => {
                    const percent = Math.floor(torrent.progress * 100);
                    if (percent >= 100 || percent === lastSent) return;
                    lastSent = percent;
                    sendMessage(chatId, `⬇️ Downloading... ${percent}%`);
                }, 5000);

                torrent.on('done', () => {
                    clearInterval(interval);
                    resolve(torrent);
                });

                torrent.on('error', err => {
                    clearInterval(interval);
                    reject(err);
                });
            });
        });

        await sendMessage(chatId, `📦 Zipping files: <b>${torrent.name}</b>`, 'HTML');

        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.pipe(output);
        torrent.files.forEach(({ path: filePath }) => {
            const source = path.join(torrent.path, filePath);
            archive.file(source, { name: filePath });
        });

        await archive.finalize();

        const form = new FormData();
        form.append('chat_id', chatId);
        form.append('document', fs.createReadStream(zipPath), {
            filename: `${torrent.name}.zip`
        });

        await axios.post(`${API_URL}/sendDocument`, form, {
            headers: form.getHeaders()
        });

    } catch (err) {
        console.error("❌ Upload error:", err.message);
        await sendMessage(chatId, "❌ Failed to process the torrent file.");
    } finally {
        try { fs.existsSync(torrentFilePath) && fs.unlinkSync(torrentFilePath); } catch {}
        try { fs.existsSync(zipPath) && fs.unlinkSync(zipPath); } catch {}
        try { fs.existsSync(extractDir) && fs.rmSync(extractDir, { recursive: true, force: true }); } catch {}
        client?.destroy();
    }
};

torrent.syntax = "/torrent - Upload a .torrent file and receive content as zip.";
torrent.file = true;
export default torrent;
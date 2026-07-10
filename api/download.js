const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/download', async (req, res) => {
    const { videoUrl } = req.body;

    if (!videoUrl) {
        return res.status(400).json({ error: 'URL video tidak boleh kosong' });
    }

    const options = {
        method: 'GET',
        url: 'https://tiktok-video-downloader-api.p.rapidapi.com/media',
        params: { videoUrl: videoUrl },
        headers: {
            // Kita menggunakan Environment Variable agar API Key tidak bocor di GitHub
            'x-rapidapi-key': process.env.RAPIDAPI_KEY, 
            'x-rapidapi-host': 'tiktok-video-downloader-api.p.rapidapi.com',
        },
    };

    try {
        const response = await axios.request(options);
        const downloadUrl = response.data.downloadUrl || response.data.url || response.data.result?.download_url; 
        
        if (!downloadUrl) {
            throw new Error('Gagal mendapatkan URL unduhan dari API');
        }

        res.json({ success: true, downloadUrl });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Gagal memproses video. Pastikan URL benar.' });
    }
});

// Export app agar bisa dibaca oleh Vercel Serverless
module.exports = app;

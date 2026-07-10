const axios = require('axios');

module.exports = async (req, res) => {
    // Mengatasi CORS agar bisa diakses oleh frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL TikTok wajib diisi!' });
    }

    try {
        // Menggunakan API tikwm untuk mengambil data video
        const response = await axios.post('https://www.tikwm.com/api/', {
            url: url
        });

        const data = response.data;

        if (data.code === 0) {
            // Mengembalikan data bersih ke frontend
            return res.status(200).json({
                success: true,
                title: data.data.title,
                author: data.data.author.nickname,
                cover: 'https://www.tikwm.com' + data.data.cover,
                wm_video: 'https://www.tikwm.com' + data.data.wmplay, // dengan watermark
                nowm_video: 'https://www.tikwm.com' + data.data.play, // TANPA watermark
                music: 'https://www.tikwm.com' + data.data.music
            });
        } else {
            return res.status(400).json({ error: data.msg || 'Gagal mengambil video. Pastikan URL valid.' });
        }

    } catch (error) {
        return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
};

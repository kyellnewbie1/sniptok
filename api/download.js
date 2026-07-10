const axios = require('axios');

module.exports = async (req, res) => {
    // Vercel Serverless menggunakan method POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method tidak diizinkan' });
    }

    const { tiktokUrl } = req.body;

    try {
        const response = await axios.post('https://api.geekflare.com/webscraping', {
            device: "desktop",
            format: ["json"],
            renderJS: true, // Ingat: ini membuat request jadi agak lama
            blockAds: true,
            stealth: true,
            url: `https://snaptik.app/ID2` 
        }, {
            headers: {
                'x-api-key': process.env.GEEKFLARE_API_KEY, // Menggunakan Environment Variable agar aman
                'Content-Type': 'application/json'
            }
        });

        // Contoh link video hasil parsing (sesuaikan dengan output asli Geekflare)
        const videoDownloadUrl = "https://server-snaptik.com/video.mp4"; 

        res.status(200).json({ success: true, downloadUrl: videoDownloadUrl });
    } catch (error) {
        res.status(500).json({ error: 'Gagal memproses video atau waktu habis.' });
    }
};

const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method tidak diizinkan' });
    }

    const { tiktokUrl } = req.body;

    try {
        // 1. Tembak API Scraper (Geekflare) ke halaman Snaptik
        const response = await axios.post('https://api.geekflare.com/webscraping', {
            device: "desktop",
            format: ["html"],
            renderJS: true, // WAJIB true agar skrip pembawa link video sempat berjalan
            blockAds: true,
            stealth: true,
            url: `https://snaptik.app/ID2` // NOTE: Idealnya ini diarahkan ke endpoint hasil generate dari link TikTok user
        }, {
            headers: {
                'x-api-key': process.env.GEEKFLARE_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        const htmlContent = response.data.data || response.data;
        const $ = cheerio.load(htmlContent);

        // 2. Pembongkar Aliansi Tombol Download
        let realVideoUrl = '';

        // Strategi A: Mencari tombol dengan class spesifik dari Snaptik (.snaptik-dl atau .btn-download)
        realVideoUrl = $('.snaptik-dl').attr('href') || $('.btn-download').attr('href') || $('.download-box a').attr('href');

        // Strategi B: Jika class dibungkus acak, cari link (<a>) yang mengandung file video / server unduhan
        if (!realVideoUrl) {
            $('a').each((index, element) => {
                const href = $(element).attr('href');
                if (href && (href.includes('.mp4') || href.includes('render.php') || href.includes('snapcdn'))) {
                    realVideoUrl = href;
                    return false; // Hentikan loop jika ketemu
                }
            });
        }

        // 3. Validasi hasil pembersihan
        if (!realVideoUrl) {
            return res.status(404).json({ 
                success: false, 
                error: 'Gagal mengekstrak video. Pastikan link video TikTok valid dan tidak dikunci privat.' 
            });
        }

        // 4. Kirim URL bersih ke frontend website kamu
        res.status(200).json({ success: true, downloadUrl: realVideoUrl });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Terjadi eror internal server: ' + error.message });
    }
};

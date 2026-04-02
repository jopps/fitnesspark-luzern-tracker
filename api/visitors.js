/**
 * Vercel Serverless Function — /api/visitors
 *
 * Proxied die fitnesspark.ch WordPress-AJAX-API und gibt die
 * Besucherzahlen beider Parks als JSON zurück.
 */

const https = require('https');

const PARK_ENDPOINTS = {
  national: 'https://www.fitnesspark.ch/wp/wp-admin/admin-ajax.php?action=single_park_update_visitors&park_id=690&location_id=54&location_name=FP_National_Luzern',
  allmend:   'https://www.fitnesspark.ch/wp/wp-admin/admin-ajax.php?action=single_park_update_visitors&park_id=6778&location_id=56&location_name=FP_Allmend_Luzern',
};

function fetchCount(url) {
  return new Promise(function (resolve, reject) {
    https.get(url, function (res) {
      let data = '';
      res.on('data', function (chunk) { data += chunk; });
      res.on('end', function () { resolve(parseInt(data.trim(), 10) || 0); });
    }).on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  try {
    const [national, allmend] = await Promise.all([
      fetchCount(PARK_ENDPOINTS.national),
      fetchCount(PARK_ENDPOINTS.allmend),
    ]);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.status(200).json({
      national: national,
      allmend: allmend,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};

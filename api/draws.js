// api/draws.js
// Live MegaDice results from LotteryInformation.us

const SOURCE_URL =
  'https://www.lotteryinformation.us/apps/past-results.php?game=ONMD&state=ON';

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = async (req, res) => {
  try {
    const response = await fetch(SOURCE_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Source returned ${response.status}`);
    }

    const html = await response.text();
    const text = stripHtml(html);

    const draws = [];
    const seen = new Set();

    // Matches e.g. "Sat Aug 01, 2026 03-11-16-32-35-38 BB:27"
    // The [^\d]{0,20} gap tolerates leftover punctuation/markup between the
    // date and number cells rather than assuming a single space.
    const regex =
      /((?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+[A-Za-z]{3}\s+\d{1,2},\s+\d{4})[^\d]{0,20}((?:\d{2}-){5}\d{2})\s*BB:\s*(\d{2})/g;

    let match;
    while ((match = regex.exec(text)) !== null && draws.length < 30) {
      const date = match[1];
      if (seen.has(date)) continue;
      seen.add(date);

      const numbers = match[2].split('-').map((n) => parseInt(n, 10));
      const bonus = parseInt(match[3], 10);

      draws.push({ date, numbers, bonus });
    }

    if (draws.length === 0) {
      return res.status(500).json({
        error: 'Could not parse live MegaDice results',
      });
    }

    res.setHeader(
      'Cache-Control',
      's-maxage=3600, stale-while-revalidate=600'
    );

    res.status(200).json({
      source: SOURCE_URL,
      fetchedAt: new Date().toISOString(),
      count: draws.length,
      draws,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message || String(err),
    });
  }
};

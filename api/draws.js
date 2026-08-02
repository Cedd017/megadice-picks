// api/draws.js
// Fetches the latest 30 MegaDice draws from CA.LottoNumbers.com
// Source: https://ca.lottonumbers.com/ontario/megadice-lotto/past-numbers

const SOURCE_URL =
'https://ca.lottonumbers.com/ontario/megadice-lotto/past-numbers';

module.exports = async (req, res) => {
try {
const response = await fetch(SOURCE_URL, {
headers: {
'User-Agent':
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138 Safari/537.36',
},
});

```
if (!response.ok) {
  throw new Error(`Source returned ${response.status}`);
}

const html = await response.text();

// Parse dates and numbers from the page.
// The page contains entries such as:
// Friday Jul 24 2026
// 8 10 15 25 37 39 1
const draws = [];
const regex =
  /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\\s+[A-Za-z]{3,9}\\s+\\d{1,2}\\s+\\d{4}[\\s\\S]{0,120}?((?:\\b\\d{1,2}\\b\\s*){7})/g;

let match;
while ((match = regex.exec(html)) !== null && draws.length < 30) {
  const date = match[0]
    .match(
      /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\\s+[A-Za-z]{3,9}\\s+\\d{1,2}\\s+\\d{4}/
    )[0];

  const nums = match[2]
    .trim()
    .split(/\\s+/)
    .map(Number);

  if (nums.length >= 6) {
    draws.push({
      date,
      numbers: nums.slice(0, 6),
      bonus: nums[6] ?? null,
    });
  }
}

if (draws.length === 0) {
  return res.status(502).json({
    error: 'Could not parse MegaDice results from CA.LottoNumbers.com',
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
```

} catch (err) {
res.status(500).json({
error: err.message || String(err),
});
}
};

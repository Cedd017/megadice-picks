// api/draws.js
// Live MegaDice results from LotteryInformation.us

const SOURCE_URL =
'https://www.lotteryinformation.us/apps/past-results.php?game=ONMD&state=ON';

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

const draws = [];
const regex =
  /(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\\s+[A-Za-z]{3}\\s+\\d{1,2},\\s+\\d{4}\\s+((?:\\d{2}-){5}\\d{2})\\s+BB:(\\d{2})/g;

let match;
while ((match = regex.exec(html)) !== null && draws.length < 30) {
  const date = match[0].match(
    /(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\\s+[A-Za-z]{3}\\s+\\d{1,2},\\s+\\d{4}/
  )[0];

  const numbers = match[2].split('-').map((n) => parseInt(n, 10));
  const bonus = parseInt(match[3], 10);

  draws.push({
    date,
    numbers,
    bonus,
  });
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
```

} catch (err) {
res.status(500).json({
error: err.message || String(err),
});
}
};

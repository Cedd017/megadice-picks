// api/draws.js
// Scrapes the latest 30 Ontario MegaDice Lotto draws from Lottery Post

const SOURCE_URL =
'https://www.lotterypost.com/results/on/megadicelotto/past';

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
  /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\\s+[A-Za-z]+\\s+\\d{1,2},?\\s+\\d{4}[\\s\\S]{0,200}?((?:\\b\\d{1,2}\\b\\s*){6})[\\s\\S]{0,80}?Bonus:?\\s*((?:\\b\\d{1,2}\\b)?)/g;

let match;
while ((match = regex.exec(html)) !== null && draws.length < 30) {
  const dateMatch = match[0].match(
    /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\\s+[A-Za-z]+\\s+\\d{1,2},?\\s+\\d{4}/
  );

  const numbers = match[2]
    .trim()
    .split(/\\s+/)
    .map(Number)
    .filter((n) => n >= 1 && n <= 39);

  const bonus = match[3] ? Number(match[3]) : null;

  if (dateMatch && numbers.length === 6) {
    draws.push({
      date: dateMatch[0],
      numbers,
      bonus,
    });
  }
}

if (draws.length === 0) {
  return res.status(502).json({
    error: 'Could not parse MegaDice results from Lottery Post',
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

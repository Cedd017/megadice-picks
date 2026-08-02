async function loadDraws() {
const res = await fetch('/api/draws');
const data = await res.json();

if (!res.ok) {
throw new Error(data.error || 'Failed to load MegaDice draws');
}

return data.draws;
}

function scoreNumbers(draws) {
const scores = {};
for (let i = 1; i <= 39; i++) scores[i] = 0;

// Recency weighting:
// newest draw gets highest weight
draws.forEach((draw, index) => {
const weight = draws.length - index;
draw.numbers.forEach((n) => {
scores[n] += weight;
});
});

return scores;
}

function topNumbers(scores, count) {
return Object.entries(scores)
.sort((a, b) => b[1] - a[1])
.slice(0, count)
.map(([n, w]) => ({ n: Number(n), w }));
}

// Weighted random sample of `count` distinct numbers from `pool`,
// biased toward higher-weighted numbers but not identical every time.
function weightedSample(pool, count) {
const remaining = pool.map((p) => ({ ...p }));
const picked = [];

while (picked.length < count && remaining.length) {
const total = remaining.reduce((sum, p) => sum + p.w, 0);
let r = Math.random() * total;
let idx = 0;
for (; idx < remaining.length; idx++) {
r -= remaining[idx].w;
if (r <= 0) break;
}
picked.push(remaining.splice(Math.min(idx, remaining.length - 1), 1)[0].n);
}

return picked.sort((a, b) => a - b);
}

function buildPicks(top) {
// Candidate pool: top-weighted numbers, used for the randomized alternates.
const pool = top.slice(0, 12);
const best = top.map((p) => p.n);

return {
triples: [
best.slice(0, 3).sort((a, b) => a - b),
weightedSample(pool, 3),
weightedSample(pool, 3)
],
sixes: [
best.slice(0, 6).sort((a, b) => a - b),
weightedSample(pool, 6),
weightedSample(pool, 6)
]
};
}

async function render() {
const btn = document.getElementById('generateBtn');
btn.disabled = true;
btn.textContent = 'Generating...';

try {
const draws = await loadDraws();

const scores = scoreNumbers(draws);
const top = topNumbers(scores, 10);
const { triples, sixes } = buildPicks(top);

document.getElementById('best3').textContent = triples[0].join(' • ');
document.getElementById('best6').textContent = sixes[0].join(' • ');

const tripleEl = document.getElementById('triples');
const sixEl = document.getElementById('sixes');
const table = document.getElementById('drawTable');

tripleEl.innerHTML = '';
sixEl.innerHTML = '';
table.innerHTML = '';

triples.forEach((set, i) => {
  tripleEl.innerHTML += `
    <div class="pick">#${i + 1}: ${set.join(' • ')}</div>
  `;
});

sixes.forEach((set, i) => {
  sixEl.innerHTML += `
    <div class="pick">#${i + 1}: ${set.join(' • ')}</div>
  `;
});

draws.forEach((draw, i) => {
  table.innerHTML += `
    <tr>
      <td class="col-index">${i + 1}</td>
      <td class="col-date">${draw.date}</td>
      <td>${draw.numbers.join(' - ')}</td>
    </tr>
  `;
});

} catch (err) {
console.error(err);
alert(err.message);
} finally {
btn.disabled = false;
btn.textContent = 'Generate Picks';
}
}

document.getElementById('generateBtn').addEventListener('click', render);
render();

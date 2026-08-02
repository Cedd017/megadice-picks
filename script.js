async function loadDraws() {
const res = await fetch('/api/draws');
const data = await res.json();
if (!res.ok) throw new Error(data.error || 'Failed to load draws');
return data.draws;
}

function scoreNumbers(draws) {
const scores = {};
for (let i = 1; i <= 39; i++) scores[i] = 0;

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
.map(([n]) => Number(n));
}

function buildPicks(top) {
const triples = [
top.slice(0, 3),
[top[1], top[3], top[5]].sort((a, b) => a - b),
[top[2], top[4], top[6]].sort((a, b) => a - b),
];

const sixes = [
top.slice(0, 6).sort((a, b) => a - b),
[top[1], top[2], top[4], top[5], top[6], top[7]].sort((a, b) => a - b),
[top[0], top[2], top[3], top[5], top[7], top[8]].sort((a, b) => a - b),
];

return { triples, sixes };
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

```
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
    <div class="pick">
      #${i + 1}: ${set.join(' • ')}
    </div>`;
});

sixes.forEach((set, i) => {
  sixEl.innerHTML += `
    <div class="pick">
      #${i + 1}: ${set.join(' • ')}
    </div>`;
});

draws.forEach((draw, i) => {
  table.innerHTML += `
    <tr>
      <td>${i + 1}</td>
      <td>${draw.numbers.join(' - ')}</td>
    </tr>`;
});
```

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

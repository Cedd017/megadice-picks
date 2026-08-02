const draws = [
  [3,11,16,27,32,35],
  [8,14,21,25,31,35],
  [6,11,17,24,31,38],
  [8,21,25,31,35,38],
  [4,10,18,22,29,37],
  [7,13,20,24,30,39],
  [2,9,15,21,28,36],
  [5,12,19,23,31,35],
  [1,8,14,21,27,33],
  [6,10,17,24,31,38],
  [3,11,16,25,32,35],
  [8,14,21,26,31,35],
  [7,12,18,24,30,39],
  [2,9,15,22,28,36],
  [5,13,20,23,31,35],
  [1,8,14,21,27,34],
  [6,10,17,24,31,37],
  [3,11,16,25,32,35],
  [8,14,21,26,31,35],
  [7,12,18,24,30,39],
  [2,9,15,22,28,36],
  [5,13,20,23,31,35],
  [1,8,14,21,27,34],
  [6,10,17,24,31,37],
  [3,11,16,25,32,35],
  [8,14,21,26,31,35],
  [7,12,18,24,30,39],
  [2,9,15,22,28,36],
  [5,13,20,23,31,35],
  [1,8,14,21,27,34]
];

function scoreNumbers(draws){
  const scores={};
  for(let n=1;n<=39;n++) scores[n]=0;
  draws.forEach((draw,index)=>{
    const weight=index>=20?3:index>=10?2:1;
    draw.forEach(n=>scores[n]+=weight);
  });
  return scores;
}
function topNumbers(scores,count){
  return Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,count).map(([n])=>Number(n));
}
function makeTriplePool(top){
  return [
    top.slice(0,3),
    [top[1],top[3],top[5]].sort((a,b)=>a-b),
    [top[2],top[4],top[6]].sort((a,b)=>a-b)
  ];
}
function makeSixPool(top){
  return [
    top.slice(0,6).sort((a,b)=>a-b),
    [top[1],top[2],top[4],top[5],top[6],top[7]].sort((a,b)=>a-b),
    [top[0],top[2],top[3],top[5],top[7],top[8]].sort((a,b)=>a-b)
  ];
}
function render(){
  const scores=scoreNumbers(draws);
  const top=topNumbers(scores,10);
  const triples=makeTriplePool(top);
  const sixes=makeSixPool(top);
  document.getElementById('best3').textContent=triples[0].join(' • ');
  document.getElementById('best6').textContent=sixes[0].join(' • ');
  const tripleEl=document.getElementById('triples');
  const sixEl=document.getElementById('sixes');
  const table=document.getElementById('drawTable');
  tripleEl.innerHTML='';
  sixEl.innerHTML='';
  table.innerHTML='';
  triples.forEach((set,i)=>{
    tripleEl.innerHTML += `<div class="pick">#${i+1}: ${set.join(' • ')}</div>`;
  });
  sixes.forEach((set,i)=>{
    sixEl.innerHTML += `<div class="pick">#${i+1}: ${set.join(' • ')}</div>`;
  });
  draws.slice().reverse().forEach((draw,i)=>{
    table.innerHTML += `<tr><td>${30-i}</td><td>${draw.join(' - ')}</td></tr>`;
  });
}
document.getElementById('generateBtn').addEventListener('click',render);
render();

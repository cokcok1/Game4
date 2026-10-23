(()=>{
const water=(r,c)=>r>=3&&r<=5&&(c===1||c===2||c===4||c===5);
const den=(r,c)=>c===3?(r===0?1:r===8?0:-1):-1;
const trap=(r,c)=>((r===0||r===8)&&(c===2||c===4))||((r===1||r===7)&&c===3)?(r<3?1:0):-1;
function initial(){let a=Array.from({length:9},()=>Array(7).fill(null));[[0,0,7],[0,6,6],[1,1,3],[1,5,2],[2,0,1],[2,2,5],[2,4,4],[2,6,8]].forEach(([r,c,n])=>{a[r][c]={n,s:1};a[8-r][6-c]={n,s:0}});return a}
function moves(a,r,c){let p=a[r][c];if(!p)return[];let out=[];for(let [dr,dc]of[[1,0],[-1,0],[0,1],[0,-1]]){let y=r+dr,x=c+dc;if(y<0||y>8||x<0||x>6)continue;if(water(y,x)&&p.n!==1){if(p.n!==6&&p.n!==7)continue;let blocked=false;while(water(y,x)){if(a[y][x])blocked=true;y+=dr;x+=dc}if(blocked)continue}if(den(y,x)===p.s)continue;let q=a[y][x];if(q){if(q.s===p.s)continue;if(water(r,c)!==water(y,x))continue;let weak=trap(y,x)===p.s;if(!weak){if(trap(r,c)===1-p.s)continue;if(p.n===8&&q.n===1)continue;if(!(p.n===1&&q.n===8)&&p.n<q.n)continue}}out.push([y,x])}return out}
function all(a,s){let m=[];a.forEach((row,r)=>row.forEach((p,c)=>{if(p?.s===s)moves(a,r,c).forEach(([y,x])=>m.push({r,c,y,x}))}));return m}

// Shared by the UI and worker: search always uses the same legal moves.
const values=[0,140,170,210,270,360,520,570,620];
function key(a,s){return s+':'+a.flat().map(p=>p?String.fromCharCode(65+p.n+p.s*9):'.').join('')}
function apply(a,m){const q=a[m.y][m.x];a[m.y][m.x]=a[m.r][m.c];a[m.r][m.c]=null;return q}
function revert(a,m,q){a[m.r][m.c]=a[m.y][m.x];a[m.y][m.x]=q}
function evaluate(a,s){let totals=[0,0],nearest=[99,99];const attacks=[new Set(),new Set()];
 for(let side=0;side<2;side++)for(const m of all(a,side)){attacks[side].add(m.y*7+m.x);totals[side]+=1.6}
 for(let r=0;r<9;r++)for(let c=0;c<7;c++){const p=a[r][c];if(!p)continue;const enemy=1-p.s,target=p.s===1?8:0,d=Math.abs(target-r)+Math.abs(3-c);nearest[p.s]=Math.min(nearest[p.s],d);totals[p.s]+=values[p.n]+(11-d)*4;
 if(trap(r,c)===enemy)totals[p.s]-=values[p.n]*.55;
 if(attacks[enemy].has(r*7+c))totals[p.s]-=values[p.n]*(attacks[p.s].has(r*7+c)?.16:.42);
 // Home guards matter most when an enemy approaches the den.
 const home=p.s===1?0:8;if(Math.abs(home-r)+Math.abs(c-3)<=2)totals[p.s]+=12;
 }
 for(let side=0;side<2;side++){totals[side]+=(12-nearest[side])*12;if(nearest[side]<=2)totals[side]+=90/(nearest[side]+1)}
 return totals[s]-totals[1-s]
}
function choose(position,side,{ms=900,maxDepth=6,positions=[]}={}){
 const a=position.map(row=>row.map(p=>p&&({...p}))),start=performance.now(),deadline=start+ms,seen=new Map(),tt=new Map();let nodes=0,completed=0;
 positions.forEach(k=>seen.set(k,(seen.get(k)||0)+1));const rootKey=key(a,side);seen.set(rootKey,(seen.get(rootKey)||0)+1);
 const timeout={};
 function ordered(list,s,best){return list.map(m=>{let q=a[m.y][m.x],p=a[m.r][m.c];return {m,v:(best&&same(m,best)?100000:0)+(den(m.y,m.x)===1-s?90000:0)+(q?values[q.n]*10-values[p.n]:0)+((s===1?1:-1)*(m.y-m.r))*3}}).sort((x,y)=>y.v-x.v).map(x=>x.m)}
 function same(x,y){return x.r===y.r&&x.c===y.c&&x.y===y.y&&x.x===y.x}
 function search(s,depth,alpha,beta,ply,extension=0){nodes++;if(a[0][3]?.s===0)return (s===0?1:-1)*(100000-ply);if(a[8][3]?.s===1)return (s===1?1:-1)*(100000-ply);if((nodes&127)===0&&performance.now()>deadline)throw timeout;
 const k=key(a,s);if((seen.get(k)||0)>=3)return 0;const list=all(a,s);if(!list.length)return -100000+ply;
 if(list.some(m=>den(m.y,m.x)===1-s))return 100000-ply;
 let candidates=list,entry=tt.get(k),original=alpha;
 if(depth<=0){const base=evaluate(a,s);if(extension>=2)return base;const danger=all(a,1-s).some(m=>den(m.y,m.x)===s);if(!danger){if(base>=beta)return base;alpha=Math.max(alpha,base);candidates=list.filter(m=>a[m.y][m.x]);if(!candidates.length)return base}}
 if(entry&&entry.depth>=depth&&depth>0){if(entry.flag==='exact')return entry.score;if(entry.flag==='lower')alpha=Math.max(alpha,entry.score);else beta=Math.min(beta,entry.score);if(alpha>=beta)return entry.score}
 let bestScore=depth<=0?evaluate(a,s):-Infinity,bestMove=null;
 // When threatened by immediate den entry, a quiet defence must also be searched.
 if(depth<=0&&all(a,1-s).some(m=>den(m.y,m.x)===s))bestScore=-Infinity;
 for(const m of ordered(candidates,s,entry?.move)){const q=apply(a,m),child=key(a,1-s);seen.set(child,(seen.get(child)||0)+1);let score;
 try{score=-search(1-s,depth-1,-beta,-alpha,ply+1,depth<=0?extension+1:extension)}finally{seen.set(child,seen.get(child)-1);revert(a,m,q)}
 if(score>bestScore){bestScore=score;bestMove=m}alpha=Math.max(alpha,score);if(alpha>=beta)break;
 }
 if(depth>0)tt.set(k,{depth,score:bestScore,move:bestMove,flag:bestScore<=original?'upper':bestScore>=beta?'lower':'exact'});return bestScore;
 }
 let list=ordered(all(a,side),side,null),best=list[0]||null,bestScore=-Infinity;
 for(let depth=1;depth<=maxDepth;depth++){let current=null,score=-Infinity;try{
 for(const m of ordered(list,side,best)){if(performance.now()>deadline)throw timeout;const q=apply(a,m);let v;const child=key(a,1-side);seen.set(child,(seen.get(child)||0)+1);
 try{v=den(m.y,m.x)===1-side?100000:-search(1-side,depth-1,-Infinity,-score,1)}finally{seen.set(child,seen.get(child)-1);revert(a,m,q)}
 // Prefer a fresh continuation when otherwise equal.
 v-=Math.min(2,positions.filter(k=>k===child).length)*14;
 if(v>score){score=v;current=m}}
 best=current;bestScore=score;completed=depth;if(score>99000)break;
 }catch(e){if(e!==timeout)throw e;break}}
 return {move:best,depth:completed,nodes,score:bestScore,elapsed:performance.now()-start};
}
const Jungle={water,den,trap,initial,moves,all,key,choose,evaluate};
if(typeof module!=='undefined')module.exports=Jungle;

globalThis.Jungle=Jungle;
})();

importScripts('engine.js');
onmessage=({data})=>{const settings={easy:{ms:180,maxDepth:2},normal:{ms:800,maxDepth:5},hard:{ms:2200,maxDepth:8}};postMessage(Jungle.choose(data.b,1,{...settings[data.level],positions:data.positions}))};

'use strict';
// These images are the same locally bundled artwork used by both the live game and preview renders.
const art={city:new Image(),platform:new Image(),cab:new Image(),people:new Image()};let artReady=false,artFailed=false;
const artURLs={city:'assets/city.png',platform:'assets/platform.png',cab:'assets/cab.png',people:'assets/people.png'};
Promise.all(Object.entries(art).map(([key,img])=>new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error(key));img.src=artURLs[key];}))).then(()=>{artReady=true;document.querySelectorAll('[data-route]').forEach(b=>b.disabled=false);updateRecords();drawCover();drawScene();}).catch(()=>{artFailed=true;$('records').textContent='素材未能載入，請確認 assets 資料夾一同上載。';});
function poly(c,pts,fill,stroke=null,lw=1){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function line(c,a,b,color,width=1){c.beginPath();c.moveTo(...a);c.lineTo(...b);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function text(c,t,x,y,size=14,color='#f5dfb4',align='left'){c.font='600 '+size+'px sans-serif';c.fillStyle=color;c.textAlign=align;c.fillText(t,x,y);c.textAlign='left';}
function rect(c,x,y,w,h,fill){c.fillStyle=fill;c.fillRect(x,y,w,h);}
// Affine texture triangles: artwork follows a world-space plane, rather than enlarging a full screenshot.
function triangle(c,img,src,dst){const [s0,s1,s2]=src,[d0,d1,d2]=dst,den=(s1[0]-s0[0])*(s2[1]-s0[1])-(s2[0]-s0[0])*(s1[1]-s0[1]);if(Math.abs(den)<.001)return;const ux=s1[0]-s0[0],uy=s1[1]-s0[1],vx=s2[0]-s0[0],vy=s2[1]-s0[1],dx1=d1[0]-d0[0],dx2=d2[0]-d0[0],dy1=d1[1]-d0[1],dy2=d2[1]-d0[1],a=(dx1*vy-dx2*uy)/den,b=(dy1*vy-dy2*uy)/den,cc=(dx2*ux-dx1*vx)/den,d=(dy2*ux-dy1*vx)/den,e=d0[0]-a*s0[0]-cc*s0[1],f=d0[1]-b*s0[0]-d*s0[1];c.save();c.beginPath();c.moveTo(...d0);c.lineTo(...d1);c.lineTo(...d2);c.closePath();c.clip();c.transform(a,b,cc,d,e,f);c.drawImage(img,0,0);c.restore();}
function quad(c,img,sx,sy,sw,sh,q){const src=[[sx,sy],[sx+sw,sy],[sx+sw,sy+sh],[sx,sy+sh]];triangle(c,img,[src[0],src[1],src[2]],[q[0],q[1],q[2]]);triangle(c,img,[src[0],src[2],src[3]],[q[0],q[2],q[3]]);}
function drawCover(){const c=$('cover').getContext('2d'),w=900,h=540;c.clearRect(0,0,w,h);if(!artReady){rect(c,0,0,w,h,'#142d3b');text(c,artFailed?'Artwork missing':'Loading comic artwork…',w/2,h/2,24,'#fbd46b','center');return;}c.drawImage(art.city,0,0,w,h);c.drawImage(art.platform,0,240,w,300);const shade=c.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#0a202bcc');shade.addColorStop(.45,'#0a202b00');shade.addColorStop(1,'#0a202b44');rect(c,0,0,w,h,shade);text(c,'HARBOUR RAIL',35,55,28);text(c,'PLAYABLE COMIC DEMO / 1.2',37,83,12);}
// Eight independent full-body sprites cropped from a transparent illustrated sheet.
function commuter(c,index,dx,feet,height){const img=art.people,sw=img.width/8,sh=img.height,width=height*sw/sh;c.drawImage(img,(index%8)*sw,0,sw,sh,dx-width/2,feet-height,width,height);}
function drawScene(){if(!g)return;const c=ctx,aw=canvas.clientWidth,ah=canvas.clientHeight;if(!aw||!ah)return;c.save();c.scale(aw/1280,ah/720);const w=1280,h=720,vy=255,vx=640,distance=routes[g.route].lengths[g.leg]-g.x;rect(c,0,0,w,h,'#17333f');if(!artReady){text(c,artFailed?'Artwork missing — check assets folder':'Loading comic artwork…',640,280,22,'#fbd46b','center');c.restore();return;}
 const cam=(wx,z,y=0)=>{const scale=125/(Math.max(0,z)+125);return [vx+wx*165*scale,vy+360*scale-y*105*scale];};
 const face=(coords,color,stroke=null,lw=1)=>poly(c,coords.map(p=>cam(...p)),color,stroke,lw);
 c.drawImage(art.city,-36-g.x*.035,-10,1360,600);
 // Stone ballast and rails move independently from the skyline.
 face([[-1.9,0,0],[-1.9,1600,0],[6.0,1600,0],[6.0,0,0]],'#504d47','#373d3f',2);
 for(let i=650;i>=0;i--){const z=(i*.75-g.x%.75+488)%488+1,s=125/(z+125);const px=cam(-1.8+(i*1.43)%7.7,z)[0],py=cam(0,z)[1];poly(c,[[px-3*s,py],[px,py-2*s],[px+4*s,py+1*s],[px+1*s,py+3*s]],i%3?'#6c675c':'#8c806a',null);}
 for(let i=85;i>=0;i--){const z=(i*5-g.x%5+425)%425+1;for(const track of [0,3.3]){face([[track-1.15,z,.03],[track+1.15,z,.03],[track+1.15,z+1.2,.03],[track-1.15,z+1.2,.03]],'#3e3834','#2a3235',.6);const a=cam(track-1.1,z,.04),b=cam(track+1.1,z,.04);line(c,[a[0],a[1]+1],[b[0],b[1]+1],'#877461',1);}}
 for(let z=430;z<1600;z+=18){for(const track of [0,3.3])line(c,cam(track-1,z,.04),cam(track+1,z,.04),'#4b453c',1);}for(const track of [0,3.3])for(const side of [-1,1]){const rail=track+side*.73;face([[rail-.035,0,.12],[rail-.035,1600,.12],[rail+.035,1600,.12],[rail+.035,0,.12]],'#adb5b2','#363f43',1);line(c,cam(rail,0,.16),cam(rail,1600,.16),'#e0d5bd',2);}
 face([[6.0,0,.3],[6,700,.3],[6,700,1],[6,0,1]],'#666c68','#34454c');face([[6.0,0,1],[6,700,1],[6.4,700,1],[6.4,0,1]],'#969183','#394f55');for(let i=0;i<20;i++){const z=(i*20-g.x%20+400)%400+1;line(c,cam(6,z,.3),cam(6,z,1),'#414a4d',1);}
 // The platform is a world-space mesh. Floor, canopy, wall and character sprites have separate layers.
 const stationStart=distance-72,stationEnd=distance+66,near=Math.max(2,stationStart),far=stationEnd;
 if(far>near&&near<500){
  face([[-1.65,near,.7],[-1.65,far,.7],[-6.6,far,.7],[-6.6,near,.7]],'#b5a58a','#584f44',2);face([[-1.65,near,0],[-1.65,far,0],[-1.65,far,.7],[-1.65,near,.7]],'#6d726b','#444f50');face([[-1.65,near,.73],[-1.65,far,.73],[-1.92,far,.73],[-1.92,near,.73]],'#e2bd52');
  // Use the artwork's original tiles for the retaining wall; no placeholder buildings or stick figures.
  for(let z=far;z>near;z-=12){const a=Math.max(near,z-12),b=z;quad(c,art.platform,art.platform.width*.390,art.platform.height*.590,art.platform.width*.015,art.platform.height*.030,[cam(-5.9,a,3.75),cam(-5.9,b,3.75),cam(-5.9,b,.7),cam(-5.9,a,.7)]);}
  // Illustrated roof beams and lights are mapped strip by strip.
  for(let z=far;z>near;z-=14){const a=Math.max(near,z-14);quad(c,art.platform,0,0,art.platform.width,art.platform.height*.27,[cam(-1.6,a,3.85),cam(-1.6,z,3.85),cam(-6.6,z,3.85),cam(-6.6,a,3.85)]);}
  // Original main station-name artwork, in perspective on the station wall.
  const nameNear=distance-4,nameFar=distance+22;if(nameFar>2){quad(c,art.platform,art.platform.width*.405,art.platform.height*.355,art.platform.width*.205,art.platform.height*.20,[cam(-5.87,Math.max(2,nameNear),3.12),cam(-5.87,nameFar,3.12),cam(-5.87,nameFar,2.12),cam(-5.87,Math.max(2,nameNear),2.12)]);}
  for(let z=far;z>near;z-=22){const s=125/(z+125),foot=cam(-4.6,z,.72),top=cam(-4.6,z,3.83);line(c,foot,top,'#29494f',10*s);line(c,[foot[0]+2*s,foot[1]],[top[0]+2*s,top[1]],'#a99b7a',2*s);}
  // Individual illustrated characters stay upright, with slight breathing motion at the platform.
  for(let i=15;i>=0;i--){const z=distance-45+i*6;if(z<2||z>far)continue;const s=125/(z+125),pt=cam(-2.7-(i%3)*.6,z,.72),breath=Math.sin(visualTime*1.9+i)*.8*s;commuter(c,i,pt[0],pt[1]+breath,171*s);}
  // Glass screen doors slide apart when the driver opens the doors.
  for(let z=far;z>near;z-=10){const a=Math.max(near,z-9),mid=(a+z)/2,s=125/(z+125),opening=g.v<.05&&z<45?g.doorProgress:0;for(const [za,zb] of [[a,a+(mid-a)*(1-opening)],[mid+(z-mid)*opening,z]]){if(zb-za>.02){face([[-1.96,za,.74],[-1.96,zb,.74],[-1.96,zb,2.15],[-1.96,za,2.15]],'#a9d4cd22','#6b8e8c',Math.max(.5,s));line(c,cam(-1.96,za,2.1),cam(-1.96,zb,2.1),'#c6cbb3',2*s);}}line(c,cam(-1.96,a,.74),cam(-1.96,a,2.23),'#3a525b',3*s);}
 }
 // Animated approach restriction signs.
 for(const [offset,lim] of [[220,45],[65,25]]){const z=distance-offset;if(z>2&&z<500){const s=125/(z+125),p=cam(5.6,z),top=cam(5.6,z,2.1);line(c,p,top,'#263e49',4*s);c.beginPath();c.arc(top[0],top[1],17*s,0,Math.PI*2);c.fillStyle='#efdfbb';c.fill();c.strokeStyle='#c65c49';c.lineWidth=3*s;c.stroke();text(c,String(lim),top[0],top[1]+5*s,15*s,'#253b46','center');}}
 if(distance<100&&distance>-8){const mark=cam(0,Math.max(distance,0),.16),s=125/(Math.max(distance,0)+125);c.setLineDash([12,8]);line(c,[vx-145*s,mark[1]],[vx+145*s,mark[1]],'#fbd46b',4);c.setLineDash([]);}
 c.drawImage(art.cab,0,0,w,h);
 // These instruments are drawn by the game, not baked into the artwork. Values react to real controls.
 const y=556;rect(c,414,509,451,126,'#112531');text(c,'SPEED',438,533,11,'#93b8b6');text(c,'TO STOP',583,533,11,'#93b8b6');text(c,'LIMIT',727,533,11,'#93b8b6');text(c,(g.v*3.6).toFixed(0),438,y+40,35,'#c5ede1');text(c,Math.round(distance)+' m',583,y+40,30,'#f4d58a');text(c,String(sectionLimit()),727,y+40,35,'#e6ddd0');text(c,g.notch>0?'POWER P'+g.notch:g.notch<0?'BRAKE B'+-g.notch:'COAST',439,618,12,'#9fc5bc');text(c,g.doors?'DOORS OPEN':'DOORS LOCKED',837,618,10,g.doors?'#fbd46b':'#a6d8bc','right');
 c.restore();}
requestAnimationFrame(frame);drawCover();

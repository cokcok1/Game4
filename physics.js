(function(root){'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function acceleration(speed,notch,wet=false){if(notch<0)return notch*.29*(wet?.78:1)-.018;if(notch>0)return notch*.23*Math.max(.35,1-speed/40)-.018-speed*.0015;return -.018-speed*.0015;}
// Smooth force changes rather than changing acceleration instantaneously.
function step(s,notch,dt,wet=false){const target=acceleration(s.v,notch,wet),old=Number.isFinite(s.a)?s.a:0,a=old+clamp(target-old,-.8*dt,.8*dt);const v=clamp(s.v+(old+a)*.5*dt,0,29);return {v,x:s.x+(s.v+v)*.5*dt,a:v===0&&notch<=0?0:a,jerk:dt?(a-old)/dt:0};}
function stoppingDistance(v,brake=3,wet=false,currentA=0){if(v<=0)return 0;const decel=-acceleration(v,-Math.abs(brake),wet),j=.8,t=Math.max(0,(currentA+decel)/j),stopT=(currentA+Math.sqrt(currentA*currentA+2*j*v))/j,rt=Math.min(t,stopT),ramp=v*rt+currentA*rt*rt/2-j*rt*rt*rt/6,after=Math.max(0,v+currentA*rt-j*rt*rt/2);return Math.max(0,ramp+(rt<stopT?after*after/(2*decel):0));}
function stationScore(error,timeDelta,overspeed,harsh){return {accuracy:Math.round(clamp(100-Math.abs(error)*8,0,100)),punctuality:Math.round(clamp(100-Math.abs(timeDelta)*1.3,0,100)),safety:Math.round(clamp(100-overspeed*1.5,0,100)),comfort:Math.round(clamp(100-harsh*1.5,0,100))};}
const api={clamp,acceleration,step,stoppingDistance,stationScore};root.RailPhysics=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

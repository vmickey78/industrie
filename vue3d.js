// Vue 3D d'Industrie — chargée à la demande par index.html (onglet 🧊 3D).
// Lit l'état du jeu en direct via window.JEU et se met à jour toute seule.
import * as THREE from 'three';
import {OrbitControls} from './lib/OrbitControls.js';

export function start(J){
const box=document.getElementById('v3d');
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
box.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const DAY=new THREE.Color(0x9cc6e8),DUSK=new THREE.Color(0xf0a070),NIGHT=new THREE.Color(0x0a1430);
scene.background=DAY.clone();scene.fog=new THREE.Fog(0x9cc6e8,95,190);
const cam=new THREE.PerspectiveCamera(50,1,.1,400);
const ctl=new OrbitControls(cam,renderer.domElement);
ctl.enableDamping=true;ctl.maxPolarAngle=Math.PI*.46;ctl.minDistance=12;ctl.maxDistance=140;ctl.autoRotate=true;ctl.autoRotateSpeed=.3;
ctl.addEventListener('start',()=>ctl.autoRotate=false);
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix()}
resize();addEventListener('resize',resize);
cam.position.set(40,38,48).multiplyScalar(Math.max(1,.85/cam.aspect));

/* ---------- lumières ---------- */
const hemi=new THREE.HemisphereLight(0xdfefff,0x5a7a3a,1.1);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1d6,2.2);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-75,right:75,top:75,bottom:-75,far:260});scene.add(sun);scene.add(sun.target);
const moon=new THREE.DirectionalLight(0x8fa8ff,0);moon.position.set(-40,60,-30);scene.add(moon);
const glow=[[0,8,3],[-30,8,-24],[42,8,-5]].map(([x,y,z])=>{const l=new THREE.PointLight(0xffb060,0,60,1.4);l.position.set(x,y,z);scene.add(l);return l});
// étoiles
const sg=new THREE.BufferGeometry(),sp=[];for(let i=0;i<500;i++){const a=Math.random()*Math.PI*2,e=Math.random()*Math.PI*.45+.05,r=180;sp.push(Math.cos(a)*Math.cos(e)*r,Math.sin(e)*r,Math.sin(a)*Math.cos(e)*r)}
sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
const stars=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:1.1,transparent:true,opacity:0,fog:false}));scene.add(stars);

/* ---------- outils ---------- */
const mats={};
const M=c=>mats[c]||(mats[c]=new THREE.MeshStandardMaterial({color:c,roughness:.85,flatShading:true}));
function mesh(geo,mat,x,y,z,parent){const m=new THREE.Mesh(geo,typeof mat==='number'?M(mat):mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m}
const winMat=new THREE.MeshStandardMaterial({color:0x8fb8d8,emissive:0xffb050,emissiveIntensity:0});
const winOn=new THREE.MeshStandardMaterial({color:0xffd27a,emissive:0xffa030,emissiveIntensity:.6});
const lampMat=new THREE.MeshStandardMaterial({color:0xfff2c0,emissive:0xffd070,emissiveIntensity:0});
const rnd=(a,b)=>a+Math.random()*(b-a);
let seed=1;const srnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
// toit à deux pans (faîtage dans l'axe z) : w = largeur, d = profondeur, h = hauteur
function gable(w,d,h,mat,x,y,z,p){const sh=new THREE.Shape();sh.moveTo(-w/2,0);sh.lineTo(w/2,0);sh.lineTo(0,h);sh.closePath();
 const g=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false});g.translate(0,0,-d/2);return mesh(g,mat,x,y,z,p)}
// toit en dents de scie (sheds d'usine) avec verrières orientées au nord
const glassMat=new THREE.MeshStandardMaterial({color:0x9cc4e0,roughness:.2,metalness:.3,emissive:0xffb050,emissiveIntensity:0});
function sawtooth(w,d,h,y,p,n=3){const g=new THREE.Group();g.position.y=y;p.add(g);const s=d/n;
 for(let i=0;i<n;i++){const z0=-d/2+i*s,sh=new THREE.Shape();sh.moveTo(z0,0);sh.lineTo(z0+s,0);sh.lineTo(z0+s,h);sh.closePath();
  const geo=new THREE.ExtrudeGeometry(sh,{depth:w,bevelEnabled:false});geo.translate(0,0,-w/2);const m=mesh(geo,0x3c4048,0,0,0,g);m.rotation.y=Math.PI/2;
  const gl=mesh(new THREE.BoxGeometry(w*.92,h*.8,.06),glassMat,0,h*.45,-(z0+s)+.04,g);gl.castShadow=false}
 return g}
function tree(x,z,s,p){mesh(new THREE.CylinderGeometry(.15*s,.2*s,1*s,6),0x6b4a2b,x,.5*s,z,p);mesh(new THREE.ConeGeometry(.9*s,2.2*s,7),0x2f7d3a,x,2*s,z,p)}
function label(parent,y){
 const c=document.createElement('canvas');c.width=512;c.height=160;
 const tex=new THREE.CanvasTexture(c);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:false}));
 s.scale.set(5,1.56,1);s.position.y=y;s.renderOrder=10;parent.add(s);
 s.userData.set=(txt,sub,dim)=>{const k=txt+'|'+sub+'|'+dim;if(s.userData.k===k)return;s.userData.k=k;const g=c.getContext('2d');g.clearRect(0,0,512,160);
  g.fillStyle=dim?'#101722aa':'#101722dd';g.beginPath();g.roundRect(6,6,500,148,40);g.fill();g.textAlign='center';
  g.font='bold 54px -apple-system,Segoe UI,sans-serif';g.fillStyle=dim?'#9aa4b5':'#fff';g.fillText(txt,256,72);
  g.font='40px -apple-system,Segoe UI,sans-serif';g.fillStyle=dim?'#7b8597':'#f6c445';g.fillText(sub,256,128);tex.needsUpdate=true};
 return s}
function clear(g){for(let i=g.children.length-1;i>=0;i--){const o=g.children[i];g.remove(o);o.traverse(x=>{if(x.geometry)x.geometry.dispose();if(x.material&&x.material.map)x.material.map.dispose()})}}
const dur=s=>{s=Math.max(0,Math.ceil(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?h+' h '+m+' min':m?m+' min':s+' s'};

/* ---------- décor fixe ---------- */
const world=new THREE.Group();scene.add(world);
mesh(new THREE.CylinderGeometry(78,80,2,64),0x6fa34a,0,-1,0,world);
const R={x0:-24,x1:24,z0:-17,z1:19};
const road=M(0x3b3f45);
mesh(new THREE.BoxGeometry(51,.1,3),road,0,.05,R.z0,world);
mesh(new THREE.BoxGeometry(103,.1,3),road,26,.05,R.z1,world); // vers la sortie est
mesh(new THREE.BoxGeometry(3,.1,36),road,R.x0,.05,1,world);mesh(new THREE.BoxGeometry(3,.1,36),road,R.x1,.05,1,world);
for(let x=-20;x<=72;x+=4)mesh(new THREE.BoxGeometry(1.4,.02,.18),0xe8e8e8,x,.11,R.z1,world);
// lampadaires
for(const[x,z]of[[-26,-12],[-26,0],[-26,12],[26,-12],[26,0],[26,12],[-17.5,-19],[-3.5,-19],[10.5,-19],[-16,21],[0,21],[16,21],[34,21],[50,21]]){
 mesh(new THREE.CylinderGeometry(.08,.1,3.4,6),0x30343a,x,1.7,z,world);mesh(new THREE.SphereGeometry(.28,8,6),lampMat,x,3.5,z,world).castShadow=false}
for(let i=0;i<110;i++){const a=rnd(0,Math.PI*2),r=rnd(62,76),x=Math.cos(a)*r,z=Math.sin(a)*r;
 if(x<-44&&Math.abs(z)<45)continue;tree(x,z,rnd(.8,1.7),world)}
for(let i=0;i<14;i++)tree(rnd(-34,-28),rnd(-12,14),rnd(.8,1.3),world);

/* ---------- bâtiments vivants ---------- */
const pick=[],B={};
const MINEC={bois:0x6b8e3a,pierre:0x9a9a9a,sable:0xe2c68a,charbon:0x2b2b2b,fer:0x9c5a3c,cuivre:0xc87533,or:0xf2c230};
const FACTC={scierie:0xb07a45,briqueterie:0xb5533c,verrerie:0x7fb7c9,fonderie:0x6d7480,fondcu:0xc0773f,forge:0x5b5f66,acierie:0x4f6273,menuiserie:0xc29a6b,cablerie:0xd0843a,orfevrerie:0x9b7ad1,electro:0x3e8fb0,chantier:0xe0b040};
function slot(kind,k,x,z){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);g.userData.sel={kind,k};pick.push(g);
 const inner=new THREE.Group();g.add(inner);const lab=label(g,6);B[kind+':'+k]={g,inner,lab,sig:null,anim:{},grow:1};return B[kind+':'+k]}
Object.keys(J.MINES).forEach((k,i)=>slot('mine',k,-21+i*7,-27));
Object.keys(J.FACT).forEach((k,i)=>slot('fact',k,-15+(i%4)*10,-7+Math.floor(i/4)*10));
const PARCPOS={ville:[44,-6],gare:[0,34],port:[-50,6]};
for(const k in J.PARC)slot('parc',k,...PARCPOS[k]);

function buildMine(b,k,lv){const g=b.inner,col=MINEC[k];b.anim={};
 if(k==='bois'){for(let t=0;t<5;t++)tree(rnd(-2,2),rnd(-2,1),1.2,g);mesh(new THREE.BoxGeometry(2,1.4,1.6),0x8a5a33,0,.7,1.6,g);gable(2.4,1.9,.9,0x5a3a20,0,1.4,1.6,g)}
 else{const h=1.5+Math.min(lv,40)*.08;const hill=mesh(new THREE.DodecahedronGeometry(2.6,0),col,0,h*.5,-.5,g);hill.scale.set(1,h/2.6,1);
  mesh(new THREE.BoxGeometry(1.2,1.3,.4),0x1a1a1a,0,.65,1.9,g);mesh(new THREE.BoxGeometry(1.6,.25,.6),0x6b4a2b,0,1.35,1.9,g);
  for(let r=0;r<3;r++)mesh(new THREE.DodecahedronGeometry(.35,0),col,rnd(-1.5,1.5),.3,rnd(2.4,3.2),g)}
 if(!lv)g.traverse(o=>{if(o.material){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.35}});
 else{mesh(new THREE.BoxGeometry(.9,.15,6),0x2a2d33,0,.25,6,g);b.anim.boxes=[];b.anim.speed=.6+Math.min(lv,30)*.05;
  for(let i=0;i<4;i++)b.anim.boxes.push(mesh(new THREE.BoxGeometry(.5,.4,.5),col,0,.55,3+i*1.5,g))}
 b.lab.position.y=5.2}
const smokeGeo=new THREE.SphereGeometry(.5,6,5);
function buildFact(b,k,lv,job){const g=b.inner,col=FACTC[k];b.anim={};
 if(!lv){mesh(new THREE.BoxGeometry(5,.3,4),0x9a9282,0,.15,0,g);
  mesh(new THREE.BoxGeometry(5,3,4),new THREE.MeshBasicMaterial({color:0xf2c230,wireframe:true,transparent:true,opacity:.5}),0,1.8,0,g);
  mesh(new THREE.BoxGeometry(.3,6,.3),0xe0a020,2.8,3,-2,g);const arm=mesh(new THREE.BoxGeometry(4,.3,.3),0xe0a020,1.2,6,-2,g);b.anim.arm=arm;b.lab.position.y=7;return}
 const h=2.4+Math.min(lv,10)*.25;
 mesh(new THREE.BoxGeometry(5,h,4),col,0,h/2,0,g);
 sawtooth(5.2,4.2,1.1,h,g);
 mesh(new THREE.BoxGeometry(1.4,1.6,.1),0x3a2a1a,0,.8,2.01,g);
 for(const x of[-1.7,1.7])mesh(new THREE.BoxGeometry(.9,.7,.1),job?winOn:winMat,x,h*.6,2.01,g);
 mesh(new THREE.CylinderGeometry(.35,.45,3,10),0x7a3b2e,1.6,h+1.2,-1.2,g);
 for(let r=0;r<3;r++)mesh(new THREE.TorusGeometry(.42,.06,6,12),0xdddddd,1.6,h+.5+r*.9,-1.2,g).rotation.x=Math.PI/2;
 if(job){b.anim.smokes=[];for(let s=0;s<6;s++){const p=mesh(smokeGeo,new THREE.MeshStandardMaterial({color:0xeeeeee,transparent:true,opacity:.6}),1.6,0,-1.2,g);p.castShadow=false;p.userData={base:h+2.8,ph:s/6};b.anim.smokes.push(p)}
  const w=mesh(new THREE.TorusGeometry(.8,.15,6,10),0x999999,-2.6,h-.4,0,g);w.rotation.y=Math.PI/2;b.anim.wheel=w}
 b.lab.position.y=5.6+Math.min(lv,10)*.25}
function sign(g,txt){mesh(new THREE.BoxGeometry(.2,2.4,.2),0x6b4a2b,-1.2,1.2,0,g);mesh(new THREE.BoxGeometry(.2,2.4,.2),0x6b4a2b,1.2,1.2,0,g);
 const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');x.fillStyle='#f4e7c5';x.fillRect(0,0,256,128);x.fillStyle='#a33';x.font='bold 46px sans-serif';x.textAlign='center';x.fillText(txt,128,80);
 mesh(new THREE.BoxGeometry(3,1.5,.15),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c)}),0,2.1,.05,g);
 for(let i=-3;i<=3;i++){mesh(new THREE.BoxGeometry(.12,.8,.12),0xd8d0c0,i*1.6,.4,3,g)}mesh(new THREE.BoxGeometry(9.8,.1,.06),0xd8d0c0,0,.65,3,g)}
const townMat=[0xd9c8a9,0xc98f6b,0xe6e0d4,0xb7c9d6,0xd6b26b].map(c=>M(c)),roofMat=[0x8b3a2b,0x5a4a42,0x4a5a6b].map(c=>M(c));
function buildParc(b,k,own,town){const g=b.inner;b.anim={};
 if(!own){sign(g,'À VENDRE');b.lab.position.y=4.5;return}
 if(k==='ville'){ // mairie + maisons
  mesh(new THREE.BoxGeometry(6,4,4),0xe8e2d0,12,2,0,g);gable(6.6,4.4,1.8,0x5a6b7a,12,4,0,g);
  mesh(new THREE.BoxGeometry(1,2.5,1),0xe8e2d0,12,6.6,0,g);
  const n=Math.min(town,45);seed=7;
  for(let i=0;i<n;i++){const x=-10+(i%5)*4.5,z=-18+Math.floor(i/5)*4.5,fl=1+Math.floor((town-1-i)/45)+(town>45&&i<town%45?1:0);
   const hh=1.6*Math.min(fl,4);const m=mesh(new THREE.BoxGeometry(2.6,hh,2.4),townMat[Math.floor(srnd()*5)],x,hh/2,z,g);
   gable(3,2.8,1.2,roofMat[Math.floor(srnd()*3)],x,hh,z,g);
   mesh(new THREE.BoxGeometry(.6,.6,.05),winMat,x-.6,hh-.8,z+1.21,g);mesh(new THREE.BoxGeometry(.6,.6,.05),winMat,x+.6,hh-.8,z+1.21,g)}
  b.lab.position.y=9;b.g.userData.labOff=12;return}
 if(k==='gare'){mesh(new THREE.BoxGeometry(12,.6,3),0xb0a898,0,.3,6,g);mesh(new THREE.BoxGeometry(7,3,3),0xc9a77a,0,1.8,1,g);
  mesh(new THREE.BoxGeometry(8,.3,4),0x7a3b2e,0,3.4,1,g);mesh(new THREE.CylinderGeometry(.5,.5,.2,16),0xffffff,0,2.6,2.6,g).rotation.x=Math.PI/2;
  b.lab.position.y=6;return}
 if(k==='port'){mesh(new THREE.BoxGeometry(10,.6,4),0x8a6a4a,-5,.2,0,g);
  for(const z of[-6,6]){mesh(new THREE.BoxGeometry(.6,7,.6),0xd04030,3,3.5,z,g);mesh(new THREE.BoxGeometry(7,.5,.5),0xd04030,0,7,z,g)}
  for(let i=0;i<6;i++)mesh(new THREE.BoxGeometry(2.2,1.2,1.1),[0xd94a3a,0x3a7bd9,0x3aa66a,0xe0b040][i%4],5+Math.floor(i/3)*2.4,.6+((i%3)>1?1.2:0),-2+(i%3)*1.2,g);
  b.lab.position.y=9;return}}
// eau (port) et rails (gare) n'apparaissent qu'une fois achetés
const water=new THREE.Mesh(new THREE.PlaneGeometry(40,110),new THREE.MeshStandardMaterial({color:0x2f78b8,roughness:.25,metalness:.1}));
water.rotation.x=-Math.PI/2;water.position.set(-75,.08,6);water.receiveShadow=true;water.visible=false;scene.add(water);
const boat=new THREE.Group();mesh(new THREE.BoxGeometry(9,1.6,3),0x2a3a5a,0,.6,0,boat);mesh(new THREE.BoxGeometry(2.5,2,2.4),0xeeeeee,-3,2.2,0,boat);
for(let i=0;i<3;i++)mesh(new THREE.BoxGeometry(1.6,1,2.2),[0xd94a3a,0x3a7bd9,0xe0b040][i],-.5+i*1.8,1.9,0,boat);boat.visible=false;scene.add(boat);
const rails=new THREE.Group();scene.add(rails);rails.visible=false;
const RX=60,RZ=44;
for(const r of[-.6,.6]){const t=new THREE.Mesh(new THREE.TorusGeometry(1,.012,4,160),M(0x555555));t.scale.set(RX+r,RZ+r,1);t.rotation.x=Math.PI/2;t.position.y=.15;rails.add(t)}
for(let i=0;i<120;i++){const a=i/120*Math.PI*2,s=new THREE.Mesh(new THREE.BoxGeometry(.4,.12,1.8),M(0x6b4a2b));s.position.set(Math.cos(a)*RX,.06,Math.sin(a)*RZ);s.rotation.y=-Math.atan2(Math.cos(a)*RZ,-Math.sin(a)*RX);rails.add(s)}
const train=[];for(let i=0;i<5;i++){const c=new THREE.Group();mesh(new THREE.BoxGeometry(3.4,1.6,1.5),i?[0x3a7bd9,0x3aa66a,0xd9a03a,0x9a4ad9][i-1]:0x222222,0,1.1,0,c);if(!i)mesh(new THREE.CylinderGeometry(.3,.3,1,8),0x222222,1,2.2,0,c);rails.add(c);train.push(c)}

const SEL=new THREE.Mesh(new THREE.RingGeometry(3.6,4.1,40),new THREE.MeshBasicMaterial({color:0xf6c445,transparent:true,opacity:.9,side:THREE.DoubleSide}));
SEL.rotation.x=-Math.PI/2;SEL.position.y=.15;SEL.visible=false;scene.add(SEL);

function refresh(){const S=J.S,now=Date.now();
 for(const key in B){const b=B[key],[kind,k]=key.split(':');let sig,txt,sub,dim;
  if(kind==='mine'){const lv=S.mine[k]||0;sig=[!!lv,Math.min(lv,40)].join();txt=J.MINES[k].n;sub=lv?'niv. '+lv:'à construire';dim=!lv;if(sig!==b.sig){clear(b.inner);buildMine(b,k,lv)}}
  else if(kind==='fact'){const lv=S.fact[k]||0,j=S.job[k];sig=[lv,!!j].join();txt=J.FACT[k].n;sub=!lv?'à construire':j?`⚙️ ${j.q} · ${dur((j.end-now)/1000)}`:'niv. '+lv+' · à l\'arrêt';dim=!lv;
   if(sig!==b.sig){const was=b.sig&&b.sig.startsWith('0,');clear(b.inner);buildFact(b,k,lv,j);if(was&&lv){b.grow=0;puff(b.g.position)}}}
  else{const own=S.parc[k];sig=[own,k==='ville'?S.town:0].join();txt=J.PARC[k].i+' '+J.PARC[k].n;sub=own?(k==='ville'?S.town+' maison'+(S.town>1?'s':''):'en service'):'terrain à vendre';dim=!own;
   if(sig!==b.sig){const was=b.sig&&b.sig.startsWith('0');clear(b.inner);buildParc(b,k,own,S.town);if(was&&own){b.grow=0;puff(b.g.position)}}}
  b.sig=sig;b.lab.userData.set(txt,sub,dim)}
 water.visible=boat.visible=!!S.parc.port;rails.visible=!!S.parc.gare;
 const nT=Math.max(2,Math.min(8,Object.keys(S.fact).length+1));while(trucks.length<nT)addTruck();
 if(J.sel){const b=B[J.sel.kind+':'+J.sel.k];if(b){SEL.visible=true;SEL.position.x=b.g.position.x;SEL.position.z=b.g.position.z;SEL.scale.setScalar(J.sel.kind==='parc'?2.2:1)}}else SEL.visible=false;
 while(J.EV.length)deliveryTruck(J.EV.shift());
}

/* ---------- poussière de construction ---------- */
const puffs=[];
function puff(p){for(let i=0;i<14;i++){const m=new THREE.Mesh(smokeGeo,new THREE.MeshStandardMaterial({color:0xd8cbb0,transparent:true,opacity:.8}));
 m.position.set(p.x+rnd(-3,3),.5,p.z+rnd(-3,3));m.userData={v:new THREE.Vector3(rnd(-1,1),rnd(1.5,3),rnd(-1,1)),t:0};scene.add(m);puffs.push(m)}}

/* ---------- camions ---------- */
const truckGeo={body:new THREE.BoxGeometry(2.4,1.3,1.2),cab:new THREE.BoxGeometry(.9,1,1.1),wheel:new THREE.CylinderGeometry(.3,.3,.2,10)};
function makeTruck(col,crate){const g=new THREE.Group();mesh(truckGeo.body,col,-.3,1,0,g);mesh(truckGeo.cab,0xeeeeee,1.2,.85,0,g);
 for(const x of[-1,1])for(const z of[-.6,.6])mesh(truckGeo.wheel,0x111111,x,.3,z,g).rotation.x=Math.PI/2;
 if(crate)mesh(new THREE.BoxGeometry(1.6,.8,.9),crate,-.4,2.05,0,g);scene.add(g);return g}
const loop=[[R.x0,R.z0],[R.x1,R.z0],[R.x1,R.z1],[R.x0,R.z1]],per=2*((R.x1-R.x0)+(R.z1-R.z0)),trucks=[];
function addTruck(){trucks.push({g:makeTruck([0xd94a3a,0x3a7bd9,0xe0b040,0x3aa66a][trucks.length%4]),d:Math.random()*per})}
function along(d){d=((d%per)+per)%per;for(let i=0;i<4;i++){const a=loop[i],b=loop[(i+1)%4],L=Math.abs(b[0]-a[0])+Math.abs(b[1]-a[1]);
 if(d<=L){const t=d/L;return{x:a[0]+(b[0]-a[0])*t+(i==1?-.8:i==3?.8:0),z:a[1]+(b[1]-a[1])*t+(i==0?.8:i==2?-.8:0),a:Math.atan2(-(b[1]-a[1]),b[0]-a[0])}}d-=L}return{x:0,z:0,a:0}}
// camion de livraison : part du bâtiment qui fabrique (ou de la mine), rejoint la route sud et quitte la carte vers l'est
const delivs=[];
function deliveryTruck(ev){if(delivs.length>8)return;
 const f=J.OUT2F[ev.k],b=f?B['fact:'+f]:B['mine:'+ev.k];if(!b)return;
 const p=b.g.position,pts=[[p.x,p.z+3],[p.x,R.z1-.8],[90,R.z1-.8]];
 if(p.z<R.z0)pts.splice(1,0,[p.x,R.z0+.8],[R.x1-.8,R.z0+.8],[R.x1-.8,R.z1-.8]);
 const col=ev.k==='maisons'?0xe8e2d0:0xf2c230;
 delivs.push({g:makeTruck(0xffffff,col),pts,i:0,pos:new THREE.Vector3(pts[0][0],0,pts[0][1]),town:ev.k==='maisons'})}

/* ---------- toucher ---------- */
const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();let down=null;
renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);
renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>8)return;
 ptr.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ptr,cam);
 const hit=ray.intersectObjects(pick,true).find(h=>!h.object.isSprite||true);
 if(!hit){J.select(null);return}
 let o=hit.object;while(o&&!o.userData.sel)o=o.parent;if(!o)return;
 J.select(o.userData.sel);ctl.autoRotate=false;tgt=o.position.clone()});
let tgt=null;

/* ---------- jour / nuit ---------- */
function nightAmount(){const d=new Date();let h=J.time==='jour'?13:J.time==='nuit'?23:d.getHours()+d.getMinutes()/60;
 const a=(h-6)/24*Math.PI*2,el=Math.sin(a);sun.position.set(Math.cos(a)*80,Math.max(el,.05)*90,30);return{el,a}}
const tmpC=new THREE.Color();

/* ---------- boucle ---------- */
const clock=new THREE.Clock();let acc=1;
renderer.setAnimationLoop(()=>{
 if(!document.body.classList.contains('mode3d'))return; // onglet 3D masqué : pause
 const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
 acc+=dt;if(acc>.5){acc=0;refresh()}
 const{el}=nightAmount(),day=THREE.MathUtils.clamp(el*3+.25,0,1),night=1-day,dusk=Math.max(0,1-Math.abs(el)*5)*.8;
 tmpC.copy(NIGHT).lerp(DAY,day).lerp(DUSK,dusk*day);scene.background.copy(tmpC);scene.fog.color.copy(tmpC);
 sun.intensity=2.2*day;hemi.intensity=.45+.65*day;moon.intensity=.8*night;
 {const dd=cam.position.distanceTo(ctl.target);scene.fog.near=dd*1.1;scene.fog.far=dd*2.6}stars.material.opacity=night;
 winMat.emissiveIntensity=.9*night;glassMat.emissiveIntensity=.7*night;winOn.emissiveIntensity=.6+.9*night;lampMat.emissiveIntensity=1.5*night;
 for(const l of glow)l.intensity=40*night;
 for(const key in B){const b=B[key],a=b.anim;
  if(b.grow<1){b.grow=Math.min(1,b.grow+dt*.8);const s=1-Math.pow(1-b.grow,3);b.inner.scale.set(1,Math.max(.01,s),1)}
  if(a.smokes)for(const p of a.smokes){const k=(t*.35+p.userData.ph)%1;p.position.y=p.userData.base+k*5;p.position.x=1.6+k*1.5;p.scale.setScalar(.4+k*1.6);p.material.opacity=.6*(1-k)}
  if(a.wheel)a.wheel.rotation.x=t*2;
  if(a.boxes)a.boxes.forEach((m,i)=>m.position.z=3+((t*a.speed+i*1.5)%6));
  if(a.arm)a.arm.rotation.y=Math.sin(t*.5)*.6}
 for(const tr of trucks){tr.d+=dt*4;const p=along(tr.d);tr.g.position.set(p.x,0,p.z);tr.g.rotation.y=p.a}
 for(let i=delivs.length-1;i>=0;i--){const d=delivs[i],tp=d.pts[d.i+1];if(!tp){scene.remove(d.g);delivs.splice(i,1);continue}
  const dx=tp[0]-d.pos.x,dz=tp[1]-d.pos.z,L=Math.hypot(dx,dz),st=dt*9;
  if(L<st){d.pos.set(tp[0],0,tp[1]);d.i++}else{d.pos.x+=dx/L*st;d.pos.z+=dz/L*st}
  d.g.position.copy(d.pos);d.g.rotation.y=Math.atan2(-dz,dx)}
 for(let i=puffs.length-1;i>=0;i--){const m=puffs[i];m.userData.t+=dt;m.position.addScaledVector(m.userData.v,dt);m.scale.setScalar(1+m.userData.t*2);m.material.opacity=.8*(1-m.userData.t/1.5);
  if(m.userData.t>1.5){scene.remove(m);puffs.splice(i,1)}}
 if(boat.visible){const k=(Math.sin(t*.08)+1)/2;boat.position.set(-58-k*40,0,-4+Math.sin(t*.3)*.3);boat.rotation.z=Math.sin(t*1.2)*.03}
 if(rails.visible)train.forEach((c,i)=>{const a=t*.06-i*.065;c.position.set(Math.cos(a)*RX,0,Math.sin(a)*RZ);c.rotation.y=-Math.atan2(Math.cos(a)*RZ,-Math.sin(a)*RX)});
 if(tgt){ctl.target.lerp(tgt,.08);if(ctl.target.distanceTo(tgt)<.1)tgt=null}
 SEL.material.opacity=.6+Math.sin(t*4)*.3;
 ctl.update();renderer.render(scene,cam)});
refresh();
}

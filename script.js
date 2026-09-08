'use strict';
document.getElementById('year').textContent = new Date().getFullYear();
const grid = document.getElementById('person-grid');
for (let i = 0; i < 64; i++) grid.appendChild(document.createElement('i'));

// A mathematical point field, used as an abstract visual rather than project data.
const canvas = document.getElementById('signal-field');
const ctx = canvas.getContext('2d');
if (ctx) {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, frame = null, phase = 0, visible = true;
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const scale = Math.min(width / 550, height / 530);
    const turn = phase + 0.55;
    const dots = [];
    for (let ring = 0; ring < 47; ring++) {
      const v = ring / 46 * Math.PI;
      for (let step = 0; step < 85; step++) {
        const u = step / 85 * Math.PI * 2;
        const swell = 1 + .17 * Math.sin(u * 3 + v * 4);
        const x = 190 * Math.sin(v) * Math.cos(u) * swell;
        const y = 210 * Math.cos(v);
        const z = 160 * Math.sin(v) * Math.sin(u) * swell;
        const rx = x * Math.cos(turn) + z * Math.sin(turn);
        const rz = -x * Math.sin(turn) + z * Math.cos(turn);
        const ry = y * .88 - rz * .30;
        const depth = (rz + 210) / 420;
        dots.push({x:width*.5 + (rx + y*.22)*scale,y:height*.5 + ry*scale,z:depth,bright: Math.sin(u*3+v*2)>.58});
      }
    }
    dots.sort((a,b)=>a.z-b.z);
    for (const dot of dots) {
      ctx.fillStyle = dot.bright ? `rgba(220,252,160,${.25+dot.z*.75})` : `rgba(146,185,108,${.10+dot.z*.50})`;
      ctx.beginPath(); ctx.arc(dot.x,dot.y,(.7+dot.z*.65)*scale,0,Math.PI*2); ctx.fill();
    }
  }
  function resize() {
    width = canvas.clientWidth; height = canvas.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0); draw();
  }
  let last = 0, started = null, finished = false;
  function animate(time) {
    if (started === null) started = time;
    if(time-last>45){ phase += .0015; draw(); last=time; }
    if (time-started < 4500) frame = requestAnimationFrame(animate);
    else { finished = true; frame = null; }
  }
  function sync() {
    if(frame !== null) cancelAnimationFrame(frame);
    frame=null;
    if(!motion.matches && !finished && visible && !document.hidden) frame=requestAnimationFrame(animate);
    else draw();
  }
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();}).observe(canvas);
  document.addEventListener('visibilitychange',sync);
  motion.addEventListener('change',sync);
  resize(); sync();
}

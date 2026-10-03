import{c as s,e as c,g as i}from"./index.BJXLpHNo.js";import"./theme.Ddq9Fhix.js";import"./framework.D1FqHTxE.js";async function p(){const o=document.getElementById("sound-designer"),r=s(),e={wave:"triangle"};for(const t of o.querySelectorAll("input[type=range]"))e[t.name]=Number(t.value),t.addEventListener("input",()=>{e[t.name]=Number(t.value),o.querySelector(`output[for="${t.id}"]`).textContent=t.value,a()});document.getElementById("sound-designer-wave").addEventListener("value-change",t=>{e.wave=t.detail.value,a()});const n=()=>Math.max(.01,e.decay/1e3);function d(){return{layers:[{kind:"oscillator",wave:e.wave,frequency:i(e.from,e.to,n()),gain:c(e.peak,e.attack/1e3,n())}],space:e.space}}function a(){document.getElementById("sound-designer-code").textContent=`sound.play({
  layers: [
    {
      kind: 'oscillator',
      wave: '${e.wave}',
      frequency: glide(${e.from}, ${e.to}, ${n().toFixed(3)}),
      gain: strike(${e.peak}, ${(e.attack/1e3).toFixed(3)}, ${n().toFixed(3)}),
    },
  ],
  space: ${e.space},
})`}a(),document.getElementById("sound-designer-play").addEventListener("click",()=>r.play(d()))}export{p as default};

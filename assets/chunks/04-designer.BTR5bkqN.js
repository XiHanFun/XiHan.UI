import{d as e,i as t,o as n}from"./dist.CyqdMJma.js";async function r(){let r=document.getElementById(`sound-designer`),i=t(),a={wave:`triangle`};for(let e of r.querySelectorAll(`xh-slider`)){let t=e.dataset.param,n=e.querySelector(`[data-value]`);a[t]=Number(e.getAttribute(`default-value`)),e.addEventListener(`value-change`,e=>{a[t]=e.detail.value[0],n.textContent=a[t],c()})}document.getElementById(`sound-designer-wave`).addEventListener(`value-change`,e=>{a.wave=e.detail.value,c()});let o=()=>Math.max(.01,a.decay/1e3);function s(){return{layers:[{kind:`oscillator`,wave:a.wave,frequency:n(a.from,a.to,o()),gain:e(a.peak,a.attack/1e3,o())}],space:a.space}}function c(){document.getElementById(`sound-designer-code`).textContent=`sound.play({
  layers: [
    {
      kind: 'oscillator',
      wave: '${a.wave}',
      frequency: glide(${a.from}, ${a.to}, ${o().toFixed(3)}),
      gain: strike(${a.peak}, ${(a.attack/1e3).toFixed(3)}, ${o().toFixed(3)}),
    },
  ],
  space: ${a.space},
})`}c(),document.getElementById(`sound-designer-play`).addEventListener(`click`,()=>i.play(s()))}export{r as default};
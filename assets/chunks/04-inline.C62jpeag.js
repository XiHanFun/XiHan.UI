const t=`<!-- 快捷键注册 | 可见提示显式开启 register 后响应按键 -->
<div style="display: flex; align-items: center; gap: 12px">
  <xh-kbd id="registered-kbd" keys="Mod,K" register><kbd data-xh-part="root"></kbd></xh-kbd>
  <output id="kbd-count">按下组合键</output>
</div>
<script type="module">
  let count = 0;
  document.querySelector("#registered-kbd")?.addEventListener("hot-key", () => {
    count += 1;
    document.querySelector("#kbd-count").textContent = \`已触发 \${count} 次\`;
  });
<\/script>
`;export{t as default};

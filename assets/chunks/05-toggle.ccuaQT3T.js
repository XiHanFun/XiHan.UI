const e=`<!-- 开关监听 | enabled 关掉后组合不再触发，键帽也转成不可用的样子 -->
<div style="display: flex; align-items: center; gap: 12px">
  <label style="display: flex; align-items: center; gap: 4px">
    <input id="hotkeys-toggle-switch" type="checkbox" checked />
    监听生效
  </label>
  <xh-hotkeys id="hotkeys-toggle" keys="Mod,B">
    <span data-xh-part="root"></span>
  </xh-hotkeys>
  <span id="hotkeys-toggle-count">已触发 0 次</span>
</div>

<script type="module">
  // enabled 是三态属性：关掉要写 enabled="false"，摘掉属性等于回到默认的开启
  const host = document.getElementById("hotkeys-toggle");
  const box = document.getElementById("hotkeys-toggle-switch");
  const readout = document.getElementById("hotkeys-toggle-count");
  let hits = 0;
  box.addEventListener("change", () => {
    host.setAttribute("enabled", box.checked ? "true" : "false");
  });
  host.addEventListener("hot-key", () => {
    hits += 1;
    readout.textContent = \`已触发 \${hits} 次\`;
  });
<\/script>
`;export{e as default};

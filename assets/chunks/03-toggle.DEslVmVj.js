const e=`<!-- 开关监听 | enabled 只控制行为，KbdGroup 的 disabled 由业务显式同步 -->
<div style="display: flex; align-items: center; gap: 12px">
  <label style="display: flex; align-items: center; gap: 4px">
    <input id="hotkeys-toggle-switch" type="checkbox" checked />
    监听生效
  </label>
  <xh-kbd-group id="hotkeys-toggle-display" keys="Mod,B">
    <span data-xh-part="root"></span>
  </xh-kbd-group>
  <xh-hotkeys id="hotkeys-toggle" keys="Mod,B"></xh-hotkeys>
  <span id="hotkeys-toggle-count">已触发 0 次</span>
</div>

<script type="module">
  // enabled 是三态属性：关掉要写 enabled="false"，摘掉属性等于回到默认的开启
  const host = document.getElementById("hotkeys-toggle");
  const display = document.getElementById("hotkeys-toggle-display");
  const box = document.getElementById("hotkeys-toggle-switch");
  const readout = document.getElementById("hotkeys-toggle-count");
  let hits = 0;
  box.addEventListener("change", () => {
    host.setAttribute("enabled", box.checked ? "true" : "false");
    display.setAttribute("disabled", box.checked ? "false" : "true");
  });
  host.addEventListener("hot-key", () => {
    hits += 1;
    readout.textContent = \`已触发 \${hits} 次\`;
  });
<\/script>
`;export{e as default};

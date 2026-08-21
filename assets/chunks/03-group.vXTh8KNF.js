const t=`<!-- 排成一组 | 多个独立的 toggle 各管各的按下态；要互斥或单一 Tab 位请改用切换按钮组 -->
<xh-toggle id="toggle-group-bold">
  <button data-xh-part="root">B</button>
</xh-toggle>

<xh-toggle id="toggle-group-italic">
  <button data-xh-part="root">I</button>
</xh-toggle>

<xh-toggle id="toggle-group-underline" default-pressed>
  <button data-xh-part="root">U</button>
</xh-toggle>

<span id="toggle-group-readout">underline</span>

<script type="module">
  // 三颗各自的按下态汇总成一行文字
  const marks = { bold: false, italic: false, underline: true };
  const readout = document.getElementById("toggle-group-readout");
  for (const key of Object.keys(marks)) {
    const toggle = document.getElementById(\`toggle-group-\${key}\`);
    toggle.addEventListener("pressed-change", (event) => {
      marks[key] = event.detail.pressed;
      const on = Object.keys(marks).filter((name) => marks[name]);
      readout.textContent = on.join(" ") || "无";
    });
  }
<\/script>
`;export{t as default};

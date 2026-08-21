const t=`<!-- 事件 | checked-change 带一份 { checked }，非受控时内部转移也照发一次 -->
<xh-switch id="switch-event">
  <button data-xh-part="root">
    <span data-xh-part="thumb"></span>
  </button>
</xh-switch>
<span id="switch-event-text">翻转 0 次 · 最近落到 （还没动过）</span>

<script type="module">
  // 每次翻转累计一次并记下落点
  const host = document.getElementById("switch-event");
  const text = document.getElementById("switch-event-text");
  let times = 0;
  host.addEventListener("checked-change", (event) => {
    times += 1;
    text.textContent = \`翻转 \${times} 次 · 最近落到 \${event.detail.checked ? "开" : "关"}\`;
  });
<\/script>
`;export{t as default};

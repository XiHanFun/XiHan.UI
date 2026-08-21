const n=`<!-- 事件 | checked-change 带一份 { checked }，非受控时内部翻转也照发一次 -->
<xh-checkbox id="checkbox-event">
  <button data-xh-part="root">
    <span data-xh-part="indicator"></span>
  </button>
</xh-checkbox>
<span>最近：<span id="checkbox-event-log">（还没动过）</span></span>

<script type="module">
  // 只留最近五条
  const checkbox = document.getElementById("checkbox-event");
  const readout = document.getElementById("checkbox-event-log");
  const log = [];
  checkbox.addEventListener("checked-change", (event) => {
    log.unshift(event.detail.checked ? "勾上" : "取消");
    log.length = Math.min(log.length, 5);
    readout.textContent = log.join(" ← ");
  });
<\/script>
`;export{n as default};

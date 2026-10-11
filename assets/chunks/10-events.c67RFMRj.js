var e=`<!-- 事件 | 值的变化经组件的 value-change，聚焦失焦等原生事件直接写在 input 部件上 -->
<xh-text-field id="text-field-events" placeholder="随便敲几个字" clearable>
  <div data-xh-part="root">
    <label data-xh-part="label">留言</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
    </div>
  </div>
</xh-text-field>

<span id="text-field-events-log" data-demo-output>还没有事件</span>

<script type="module">
  const field = document.getElementById("text-field-events");
  const input = field.querySelector('[data-xh-part="input"]');
  const readout = document.getElementById("text-field-events-log");
  let log = [];

  // 新的排在最前，只留最近三条
  function push(text) {
    log = [text, ...log].slice(0, 3);
    readout.textContent = log.join(" · ");
  }

  field.addEventListener("value-change", (event) => {
    push(\`value-change：\${event.detail.value || "（空）"}\`);
  });
  input.addEventListener("focus", () => push("focus"));
  input.addEventListener("blur", () => push("blur"));
<\/script>
`;export{e as default};
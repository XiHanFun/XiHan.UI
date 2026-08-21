const e=`<!-- 事件 | 值的变化走组件的 value-change，聚焦失焦这类原生事件直接写在 input 部件上 -->
<xh-text-field id="text-field-events" placeholder="随便敲几个字" clearable>
  <div data-xh-part="root">
    <label data-xh-part="label">留言</label>
    <input data-xh-part="input" style="inline-size: 220px" />
  </div>
</xh-text-field>

<ol id="text-field-events-log" style="margin: 0; padding-inline-start: 20px"></ol>
<span id="text-field-events-empty">还没有事件</span>

<script type="module">
  const field = document.getElementById("text-field-events");
  const input = field.querySelector('[data-xh-part="input"]');
  const list = document.getElementById("text-field-events-log");
  const empty = document.getElementById("text-field-events-empty");
  let log = [];

  // 新的排在最前，只留最近三条
  function push(text) {
    log = [text, ...log].slice(0, 3);
    list.replaceChildren(
      ...log.map((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        return li;
      }),
    );
    empty.hidden = true;
  }

  field.addEventListener("value-change", (event) => {
    push("value-change：" + (event.detail.value || "（空）"));
  });
  input.addEventListener("focus", () => push("focus"));
  input.addEventListener("blur", () => push("blur"));
<\/script>
`;export{e as default};

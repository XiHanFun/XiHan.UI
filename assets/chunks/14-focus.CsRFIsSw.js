const t=`<!-- 聚焦与选区 | input 部件就是一个原生 input，拿到它的节点就能聚焦、全选、把光标挪到末尾 -->
<xh-text-field id="text-field-focus" default-value="曦寒组件库">
  <div data-xh-part="root">
    <label data-xh-part="label">标题</label>
    <input data-xh-part="input" style="inline-size: 220px" />
    <div style="display: flex; gap: 8px">
      <button type="button" id="text-field-focus-focus">聚焦</button>
      <button type="button" id="text-field-focus-select">全选</button>
      <button type="button" id="text-field-focus-caret">光标移到末尾</button>
      <button type="button" id="text-field-focus-blur">失焦</button>
    </div>
  </div>
</xh-text-field>

<script type="module">
  const field = document.getElementById("text-field-focus");
  const input = field.querySelector('[data-xh-part="input"]');

  document.getElementById("text-field-focus-focus").addEventListener("click", () => {
    input.focus();
  });
  document.getElementById("text-field-focus-select").addEventListener("click", () => {
    input.focus();
    input.select();
  });
  document.getElementById("text-field-focus-caret").addEventListener("click", () => {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  });
  document.getElementById("text-field-focus-blur").addEventListener("click", () => {
    input.blur();
  });
<\/script>
`;export{t as default};

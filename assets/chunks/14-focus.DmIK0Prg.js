var e=`<!-- 聚焦与选区 | input 部件就是一个原生 input，取得它的节点即可聚焦、全选、把光标移到末尾 -->
<xh-text-field id="text-field-focus" default-value="曦寒组件库">
  <div data-xh-part="root">
    <label data-xh-part="label">标题</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
    </div>
    <div style="display: flex; gap: 8px">
      <xh-button id="text-field-focus-focus" variant="outline" size="sm">
        <button data-xh-part="root">聚焦</button>
      </xh-button>
      <xh-button id="text-field-focus-select" variant="outline" size="sm">
        <button data-xh-part="root">全选</button>
      </xh-button>
      <xh-button id="text-field-focus-caret" variant="outline" size="sm">
        <button data-xh-part="root">光标移到末尾</button>
      </xh-button>
      <xh-button id="text-field-focus-blur" variant="outline" size="sm">
        <button data-xh-part="root">失焦</button>
      </xh-button>
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
`;export{e as default};
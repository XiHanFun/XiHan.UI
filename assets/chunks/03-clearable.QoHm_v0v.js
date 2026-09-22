const e=`<!-- 可清空与字数上限 | Control 把输入框与清空按钮圈进同一个框，clearable 使清空按钮可用并接管 Escape，maxLength 同时写为原生 maxlength 与状态机侧截断 -->
<xh-text-field
  id="text-field-clearable"
  default-value="曦寒"
  placeholder="最多 10 个字符"
  max-length="10"
  clearable
>
  <div data-xh-part="root">
    <label data-xh-part="label">昵称</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="clear-trigger"></button>
    </div>
    <span id="text-field-clearable-count">2 / 10</span>
  </div>
</xh-text-field>

<script type="module">
  // 字数跟着值走，顶到上限补一句提示
  const field = document.getElementById("text-field-clearable");
  const count = document.getElementById("text-field-clearable-count");
  field.addEventListener("value-change", (event) => {
    const length = event.detail.value.length;
    count.textContent = \`\${length} / 10\${length >= 10 ? "（已到上限）" : ""}\`;
  });
<\/script>
`;export{e as default};

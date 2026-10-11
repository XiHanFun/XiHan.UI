var e=`<!-- 可清空与字数上限 | Control 把输入框与清空按钮圈进同一个框，clearable 使清空按钮可用并接管 Escape，maxLength 按字素计（一个组合 emoji 算一个字），超出的部分从新打进来的文字里截掉 -->
<xh-text-field
  default-value="曦寒"
  placeholder="最多 10 个字符"
  max-length="10"
  clearable
  show-count
>
  <div data-xh-part="root">
    <label data-xh-part="label">昵称</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="clear-trigger"></button>
    </div>
    <!-- 字数按字素计，由元素填入，顶到上限换色 -->
    <span data-xh-part="count"></span>
  </div>
</xh-text-field>
`;export{e as default};
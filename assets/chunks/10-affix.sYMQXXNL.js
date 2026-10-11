var e=`<!-- 框内单位与货币符号 | 前后缀图标/文字直接以流式插入 control，减、加按钮统一收在右侧 -->
<xh-number-field default-value="99" min="0" max="9999">
  <div data-xh-part="root">
    <label data-xh-part="label">单价</label>
    <div data-xh-part="control">
      <button data-xh-part="decrement-trigger"></button>
      <span data-xh-part="prefix">¥</span>
      <input data-xh-part="input" />
      <span data-xh-part="suffix">元</span>
      <button data-xh-part="increment-trigger"></button>
    </div>
  </div>
</xh-number-field>

<xh-number-field default-value="500" min="0" max="5000" step="50">
  <div data-xh-part="root">
    <label data-xh-part="label">重量</label>
    <div data-xh-part="control">
      <button data-xh-part="decrement-trigger"></button>
      <input data-xh-part="input" />
      <span data-xh-part="suffix">g</span>
      <button data-xh-part="increment-trigger"></button>
    </div>
  </div>
</xh-number-field>
`;export{e as default};
const t=`<!-- 框内单位与货币符号 | 前后缀图标/文字直接流式插进 control：减在左、加在右、输入框居中，前后缀排在输入框两侧 -->
<xh-number-field default-value="99" min="0" max="9999">
  <div data-xh-part="root">
    <label data-xh-part="label">单价</label>
    <div data-xh-part="control">
      <button data-xh-part="decrement-trigger">−</button>
      <span style="color: var(--xh-fg-muted)">¥</span>
      <input data-xh-part="input" />
      <span style="color: var(--xh-fg-muted)">元</span>
      <button data-xh-part="increment-trigger">+</button>
    </div>
  </div>
</xh-number-field>

<xh-number-field default-value="500" min="0" max="5000" step="50">
  <div data-xh-part="root">
    <label data-xh-part="label">重量</label>
    <div data-xh-part="control">
      <button data-xh-part="decrement-trigger">−</button>
      <input data-xh-part="input" />
      <span style="color: var(--xh-fg-muted)">g</span>
      <button data-xh-part="increment-trigger">+</button>
    </div>
  </div>
</xh-number-field>
`;export{t as default};

const t=`<!-- 禁用与只读 | 两者都改不动值，禁用还会把加减按钮一并关掉、值也不再随表单提交 -->
<xh-number-field default-value="5" disabled>
  <div data-xh-part="root">
    <label data-xh-part="label">禁用</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="decrement-trigger">−</button>
      <button data-xh-part="increment-trigger">+</button>
    </div>
  </div>
</xh-number-field>

<xh-number-field default-value="5" read-only>
  <div data-xh-part="root">
    <label data-xh-part="label">只读</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="decrement-trigger">−</button>
      <button data-xh-part="increment-trigger">+</button>
    </div>
  </div>
</xh-number-field>
`;export{t as default};

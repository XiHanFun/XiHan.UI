const a=`<!-- 只读 | readOnly 只锁关闭钮：叉留在原地但按不动，标签本身不置灰；与 disabled 的区别只在标签本体的颜色 -->
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
  <xh-tag variant="subtle" tone="brand" closable>
    <span data-xh-part="root">
      <span data-xh-part="label">可摘掉</span>
      <button data-xh-part="close-trigger"></button>
    </span>
  </xh-tag>

  <xh-tag variant="subtle" tone="brand" closable read-only>
    <span data-xh-part="root">
      <span data-xh-part="label">只读</span>
      <button data-xh-part="close-trigger"></button>
    </span>
  </xh-tag>

  <xh-tag variant="subtle" tone="brand" closable disabled>
    <span data-xh-part="root">
      <span data-xh-part="label">禁用</span>
      <button data-xh-part="close-trigger"></button>
    </span>
  </xh-tag>
</div>
`;export{a as default};

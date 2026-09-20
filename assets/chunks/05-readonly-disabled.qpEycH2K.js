const a=`<!-- 只读与禁用 | 只读时已绘制的笔迹可见但不可修改，禁用时连清空按钮都不可按下；两者都使用原生 disabled，不只是视觉置灰 -->
<div style="display: flex; flex-direction: column; gap: 16px; max-inline-size: 22rem">
  <xh-signature-pad read-only>
    <div data-xh-part="root">
      <span data-xh-part="label">只读</span>
      <svg data-xh-part="control">
        <line data-xh-part="guide"></line>
        <path data-xh-part="path"></path>
      </svg>
      <button data-xh-part="clear-trigger">清空</button>
    </div>
  </xh-signature-pad>
  <xh-signature-pad disabled>
    <div data-xh-part="root">
      <span data-xh-part="label">禁用</span>
      <svg data-xh-part="control">
        <line data-xh-part="guide"></line>
        <path data-xh-part="path"></path>
      </svg>
      <button data-xh-part="clear-trigger">清空</button>
    </div>
  </xh-signature-pad>
</div>
`;export{a as default};

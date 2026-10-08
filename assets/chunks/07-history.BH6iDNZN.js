var e=`<!-- 撤销与重做 | 一笔或一次清空是一步；没有可撤销、可重做的一步时按钮置灰，焦点仍留在原处 -->
<xh-signature-pad>
  <div data-xh-part="root" style="max-inline-size: 22rem">
    <svg data-xh-part="control">
      <line data-xh-part="guide"></line>
      <path data-xh-part="path"></path>
    </svg>
    <div style="display: flex; gap: var(--xh-space-2)">
      <button data-xh-part="undo-trigger">撤销</button>
      <button data-xh-part="redo-trigger">重做</button>
      <!-- 清空也是一步：误清之后按撤销能把整份签名找回来 -->
      <button data-xh-part="clear-trigger">清空</button>
    </div>
  </div>
</xh-signature-pad>
`;export{e as default};
const a=`<!-- 分隔符 | 在相邻内容之间添加分隔符 -->
<style>
  #flex-split [data-link] {
    color: var(--xh-fg-brand);
    cursor: pointer;
  }
  #flex-split [data-rule] {
    display: block;
    inline-size: 1px;
    block-size: 1em;
    background: var(--xh-border-default);
  }
</style>

<xh-flex id="flex-split" gap="sm" style="display: contents">
  <div data-xh-part="root">
    <span data-link>编辑</span>
    <span data-xh-part="split"><span data-rule></span></span>
    <span data-link>复制</span>
    <span data-xh-part="split"><span data-rule></span></span>
    <span data-link>归档</span>
    <span data-xh-part="split"><span data-rule></span></span>
    <span data-link>删除</span>
  </div>
</xh-flex>
`;export{a as default};

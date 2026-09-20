const a=`<!-- 分隔符 | 在相邻内容之间添加分隔符 -->
<style>
  #flex-split [data-rule] {
    display: block;
    inline-size: 1px;
    block-size: 1em;
    background: var(--xh-border-default);
  }
</style>

<xh-flex id="flex-split" gap="sm" style="display: contents">
  <div data-xh-part="root">
    <span data-demo-block="line" data-tone="brand" aria-label="编辑" style="--xh-demo-block-inline-size: 48px"></span>
    <span data-xh-part="split"><span data-rule></span></span>
    <span data-demo-block="line" data-tone="info" aria-label="复制" style="--xh-demo-block-inline-size: 48px"></span>
    <span data-xh-part="split"><span data-rule></span></span>
    <span data-demo-block="line" data-tone="success" aria-label="归档" style="--xh-demo-block-inline-size: 48px"></span>
    <span data-xh-part="split"><span data-rule></span></span>
    <span data-demo-block="line" data-tone="danger" aria-label="删除" style="--xh-demo-block-inline-size: 48px"></span>
  </div>
</xh-flex>
`;export{a as default};

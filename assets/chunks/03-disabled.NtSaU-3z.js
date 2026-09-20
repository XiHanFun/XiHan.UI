const a=`<!-- 禁用 | 禁止调整面板比例 -->
<xh-splitter
  panels='[{"id":"aside"},{"id":"main"}]'
  disabled
  style="display: contents"
>
  <div data-xh-part="root" style="inline-size: min(480px, 100%); block-size: 140px">
    <div data-xh-part="panel" index="0" style="background: var(--xh-bg-subtle)">
      <span data-demo-block data-tone="neutral" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px"></span>
    </div>
    <div data-xh-part="resize-trigger" index="0"></div>
    <div data-xh-part="panel" index="1" style="background: var(--xh-bg-brand-subtle)">
      <span data-demo-block data-tone="brand" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px"></span>
    </div>
  </div>
</xh-splitter>
`;export{a as default};

const a=`<!-- 间距 | 设置栅格间距 -->
<style>
  #grid-gap { display: grid; gap: 16px; inline-size: min(480px, 100%); }
  #grid-gap [data-label] { margin-block-end: 6px; color: var(--xh-fg-muted); font-size: 13px; }
</style>
<div id="grid-gap">
  <div><div data-label>紧凑</div><xh-grid cols="3" gap="sm" style="display: contents"><div data-xh-part="root"><div data-xh-part="item" data-demo-block data-tone="brand" style="block-size: 32px"></div><div data-xh-part="item" data-demo-block data-tone="brand" style="block-size: 32px"></div><div data-xh-part="item" data-demo-block data-tone="brand" style="block-size: 32px"></div></div></xh-grid></div>
  <div><div data-label>标准</div><xh-grid cols="3" gap="md" style="display: contents"><div data-xh-part="root"><div data-xh-part="item" data-demo-block data-tone="brand" style="block-size: 32px"></div><div data-xh-part="item" data-demo-block data-tone="brand" style="block-size: 32px"></div><div data-xh-part="item" data-demo-block data-tone="brand" style="block-size: 32px"></div></div></xh-grid></div>
  <div><div data-label>宽松</div><xh-grid cols="3" gap="lg" style="display: contents"><div data-xh-part="root"><div data-xh-part="item" data-demo-block data-tone="brand" style="block-size: 32px"></div><div data-xh-part="item" data-demo-block data-tone="brand" style="block-size: 32px"></div><div data-xh-part="item" data-demo-block data-tone="brand" style="block-size: 32px"></div></div></xh-grid></div>
</div>
`;export{a as default};

const a=`<!-- 跨行 | row-span 让一格占几条行轨道，常用来放一块比同行其余格子更高的主内容 -->
<xh-grid id="grid-row-span" cols="3" gap="sm" style="display: contents">
  <div data-xh-part="root" style="inline-size: min(640px, 100%)">
    <div data-xh-part="item" row-span="2" data-demo-block data-tone="brand" style="--xh-demo-block-block-size: auto"></div>
    <div data-xh-part="item" data-demo-block data-tone="info"></div>
    <div data-xh-part="item" data-demo-block data-tone="success"></div>
    <div data-xh-part="item" data-demo-block data-tone="warning"></div>
    <div data-xh-part="item" data-demo-block data-tone="danger"></div>
  </div>
</xh-grid>
`;export{a as default};

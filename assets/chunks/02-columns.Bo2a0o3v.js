const d=`<!-- 响应式列 | 根据容器宽度调整列数 -->
<xh-masonry columns='{"base":1,"sm":2,"md":3}' gap="sm" style="display: contents">
  <div data-xh-part="root" style="inline-size: min(720px, 100%)">
    <div data-xh-part="column"></div><div data-xh-part="column"></div><div data-xh-part="column"></div>
    <div data-xh-part="item"><div data-demo-block data-tone="brand" style="--xh-demo-block-block-size: 64px"></div></div>
    <div data-xh-part="item"><div data-demo-block data-tone="info" style="--xh-demo-block-block-size: 76px"></div></div>
    <div data-xh-part="item"><div data-demo-block data-tone="success" style="--xh-demo-block-block-size: 88px"></div></div>
    <div data-xh-part="item"><div data-demo-block data-tone="warning" style="--xh-demo-block-block-size: 100px"></div></div>
  </div>
</xh-masonry>
`;export{d as default};

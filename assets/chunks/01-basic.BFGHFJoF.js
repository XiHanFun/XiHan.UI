const a=`<!-- 基础用法 | 创建纵向滚动区域 -->
<xh-scroll-area type="always" aria-label="纵向滚动占位区块" style="display: contents">
  <div data-xh-part="root" style="block-size: 180px; inline-size: min(360px, 100%); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
    <div data-xh-part="viewport">
      <div data-xh-part="content" style="padding: 12px 16px">
        <span data-demo-block="line" data-tone="brand" style="--xh-demo-block-inline-size: 76%; margin-block: 14px"></span>
        <span data-demo-block="line" data-tone="info" style="--xh-demo-block-inline-size: 58%; margin-block: 14px"></span>
        <span data-demo-block="line" data-tone="success" style="--xh-demo-block-inline-size: 84%; margin-block: 14px"></span>
        <span data-demo-block="line" data-tone="warning" style="--xh-demo-block-inline-size: 66%; margin-block: 14px"></span>
        <span data-demo-block="line" data-tone="danger" style="--xh-demo-block-inline-size: 72%; margin-block: 14px"></span>
        <span data-demo-block="line" data-tone="neutral" style="--xh-demo-block-inline-size: 54%; margin-block: 14px"></span>
        <span data-demo-block="line" data-tone="brand" style="--xh-demo-block-inline-size: 80%; margin-block: 14px"></span>
        <span data-demo-block="line" data-tone="info" style="--xh-demo-block-inline-size: 62%; margin-block: 14px"></span>
        <span data-demo-block="line" data-tone="success" style="--xh-demo-block-inline-size: 74%; margin-block: 14px"></span>
        <span data-demo-block="line" data-tone="warning" style="--xh-demo-block-inline-size: 56%; margin-block: 14px"></span>
      </div>
    </div>
    <div data-xh-part="scrollbar" orientation="vertical"><div data-xh-part="track"><div data-xh-part="thumb"></div></div></div>
  </div>
</xh-scroll-area>
`;export{a as default};

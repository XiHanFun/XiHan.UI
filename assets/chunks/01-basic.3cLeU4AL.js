const a=`<!-- 基础用法 | 按最短列排列卡片 -->
<style>
  #masonry-basic article { padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); }
  #masonry-basic p { margin-block-end: 0; color: var(--xh-fg-muted); }
</style>
<xh-masonry id="masonry-basic" columns="3" gap="md" style="display: contents">
  <div data-xh-part="root" style="inline-size: min(680px, 100%)">
    <div data-xh-part="column"></div><div data-xh-part="column"></div><div data-xh-part="column"></div>
    <div data-xh-part="item"><article><strong>快速上手</strong><p>几分钟完成安装并渲染第一个组件。</p></article></div>
    <div data-xh-part="item"><article><strong>无头内核</strong><p>行为、状态和无障碍逻辑独立于视图层，可在多个框架中复用。</p></article></div>
    <div data-xh-part="item"><article><strong>设计令牌</strong><p>统一颜色、间距和动效。</p></article></div>
    <div data-xh-part="item"><article><strong>多端适配</strong><p>同时支持 Vue、React 和 Web Components。</p></article></div>
    <div data-xh-part="item"><article><strong>无障碍</strong><p>内置键盘导航与语义属性。</p></article></div>
    <div data-xh-part="item"><article><strong>主题系统</strong><p>支持浅色、深色、高对比度和自定义品牌主题。</p></article></div>
  </div>
</xh-masonry>
`;export{a as default};

const a=`<!-- 响应式列 | 根据容器宽度调整列数 -->
<xh-masonry columns='{"base":1,"sm":2,"md":3}' gap="sm" style="display: contents">
  <div data-xh-part="root" style="inline-size: min(720px, 100%)">
    <div data-xh-part="column"></div><div data-xh-part="column"></div><div data-xh-part="column"></div>
    <div data-xh-part="item"><div style="padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">概览</div></div>
    <div data-xh-part="item"><div style="padding: 22px 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">组件</div></div>
    <div data-xh-part="item"><div style="padding: 28px 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">主题</div></div>
    <div data-xh-part="item"><div style="padding: 34px 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">发布</div></div>
  </div>
</xh-masonry>
`;export{a as default};

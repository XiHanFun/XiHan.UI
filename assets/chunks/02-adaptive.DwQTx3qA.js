const a=`<!-- 自适应列 | 根据最小列宽自动排列 -->
<style>
  #grid-adaptive [data-card] { padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); }
</style>
<xh-grid id="grid-adaptive" min-col-width="sm" gap="sm" style="display: contents">
  <div data-xh-part="root" style="inline-size: min(640px, 100%)">
    <div data-xh-part="item" data-card>无头内核</div>
    <div data-xh-part="item" data-card>Vue</div>
    <div data-xh-part="item" data-card>React</div>
    <div data-xh-part="item" data-card>Web Components</div>
    <div data-xh-part="item" data-card>设计令牌</div>
    <div data-xh-part="item" data-card>无障碍</div>
  </div>
</xh-grid>
`;export{a as default};

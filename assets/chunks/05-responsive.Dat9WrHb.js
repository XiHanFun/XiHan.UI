const a=`<!-- 响应式列 | 在不同视口使用不同列数 -->
<style>
  #grid-responsive [data-card] { padding: 20px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); text-align: center; }
</style>
<xh-grid id="grid-responsive" cols='{"base":1,"sm":2,"lg":4}' gap="sm" style="display: contents">
  <div data-xh-part="root" style="inline-size: min(720px, 100%)">
    <div data-xh-part="item" data-card>概览</div>
    <div data-xh-part="item" data-card>分析</div>
    <div data-xh-part="item" data-card>报告</div>
    <div data-xh-part="item" data-card>设置</div>
  </div>
</xh-grid>
`;export{a as default};

const a=`<!-- 基础用法 | 创建等宽列 -->
<style>
  #grid-basic [data-card] {
    min-inline-size: 0;
    padding: 16px;
    border-radius: var(--xh-shape-surface);
    background: var(--xh-bg-subtle);
  }
  #grid-basic [data-label] { color: var(--xh-fg-muted); font-size: 13px; }
  #grid-basic strong { display: block; margin-block-start: 8px; font-size: 24px; }
</style>
<xh-grid id="grid-basic" cols="3" gap="md" style="display: contents">
  <div data-xh-part="root" style="inline-size: min(600px, 100%)">
    <div data-xh-part="item" data-card><div data-label>活跃用户</div><strong>12,860</strong></div>
    <div data-xh-part="item" data-card><div data-label>转化率</div><strong>8.4%</strong></div>
    <div data-xh-part="item" data-card><div data-label>订单</div><strong>1,294</strong></div>
  </div>
</xh-grid>
`;export{a as default};

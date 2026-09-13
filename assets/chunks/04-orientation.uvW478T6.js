const a=`<!-- 横向滚动 | 只启用横向滚动 -->
<style>
  #scroll-area-horizontal [data-card] { flex: none; display: grid; place-items: center; inline-size: 96px; block-size: 64px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); }
</style>
<xh-scroll-area id="scroll-area-horizontal" orientation="horizontal" type="always" style="display: contents">
  <div data-xh-part="root" style="block-size: 110px; inline-size: min(420px, 100%); border-radius: var(--xh-shape-surface)">
    <div data-xh-part="viewport"><div data-xh-part="content" style="display: flex; gap: 10px; padding: 10px 12px"><div data-card>概览</div><div data-card>分析</div><div data-card>报告</div><div data-card>成员</div><div data-card>设置</div><div data-card>发布</div></div></div>
    <div data-xh-part="scrollbar" orientation="horizontal"><div data-xh-part="track"><div data-xh-part="thumb"></div></div></div>
  </div>
</xh-scroll-area>
`;export{a as default};

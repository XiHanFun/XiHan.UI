const a=`<!-- 方向 | 设置水平或垂直排列 -->
<style>
  #flex-direction [data-item] { padding: 8px 14px; border-radius: var(--xh-shape-control); background: var(--xh-bg-subtle); }
</style>
<xh-flex id="flex-direction" orientation="vertical" gap="lg" style="display: contents">
  <div data-xh-part="root">
    <xh-flex gap="sm" style="display: contents"><div data-xh-part="root"><span data-item>设计</span><span data-item>开发</span><span data-item>测试</span></div></xh-flex>
    <xh-flex orientation="vertical" gap="sm" style="display: contents"><div data-xh-part="root" style="inline-size: 120px"><span data-item>设计</span><span data-item>开发</span><span data-item>测试</span></div></xh-flex>
  </div>
</xh-flex>
`;export{a as default};

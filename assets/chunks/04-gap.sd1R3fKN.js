const a=`<!-- 间距 | 使用预设间距 -->
<style>
  #flex-gap [data-box] {
    inline-size: 28px;
    block-size: 28px;
    border-radius: var(--xh-shape-control);
    background: var(--xh-bg-brand-subtle);
  }
  #flex-gap [data-label] {
    inline-size: 48px;
    color: var(--xh-fg-muted);
  }
</style>
<xh-flex id="flex-gap" orientation="vertical" gap="md" style="display: contents">
  <div data-xh-part="root">
    <xh-flex align="center" gap="md" style="display: contents">
      <div data-xh-part="root"><span data-label>紧凑</span><xh-flex gap="sm" style="display: contents"><div data-xh-part="root"><span data-box></span><span data-box></span><span data-box></span></div></xh-flex></div>
    </xh-flex>
    <xh-flex align="center" gap="md" style="display: contents">
      <div data-xh-part="root"><span data-label>标准</span><xh-flex gap="md" style="display: contents"><div data-xh-part="root"><span data-box></span><span data-box></span><span data-box></span></div></xh-flex></div>
    </xh-flex>
    <xh-flex align="center" gap="md" style="display: contents">
      <div data-xh-part="root"><span data-label>宽松</span><xh-flex gap="lg" style="display: contents"><div data-xh-part="root"><span data-box></span><span data-box></span><span data-box></span></div></xh-flex></div>
    </xh-flex>
  </div>
</xh-flex>
`;export{a as default};

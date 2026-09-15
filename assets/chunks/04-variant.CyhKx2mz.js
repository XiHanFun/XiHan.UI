const t=`<!-- 变体 | 选择与所在表面匹配的样式 -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(112px, 1fr)); gap: 12px; inline-size: min(640px, 100%)">
  <div style="position: relative; block-size: 120px; padding: 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
    <span style="color: var(--xh-fg-muted)">默认</span>
    <xh-back-top visibility-height="0"><div data-xh-part="root" style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"><button data-xh-part="trigger"></button></div></xh-back-top>
  </div>
  <div style="position: relative; block-size: 120px; padding: 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
    <span style="color: var(--xh-fg-muted)">实心</span>
    <xh-back-top variant="solid" visibility-height="0"><div data-xh-part="root" style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"><button data-xh-part="trigger"></button></div></xh-back-top>
  </div>
  <div style="position: relative; block-size: 120px; padding: 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
    <span style="color: var(--xh-fg-muted)">线框</span>
    <xh-back-top variant="outline" visibility-height="0"><div data-xh-part="root" style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"><button data-xh-part="trigger"></button></div></xh-back-top>
  </div>
  <div style="position: relative; block-size: 120px; padding: 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
    <span style="color: var(--xh-fg-muted)">幽灵</span>
    <xh-back-top variant="ghost" visibility-height="0"><div data-xh-part="root" style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"><button data-xh-part="trigger"></button></div></xh-back-top>
  </div>
</div>
`;export{t as default};

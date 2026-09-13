const a=`<!-- 变体 | 设置分隔线强度和线型 -->
<div style="display: grid; grid-template-columns: 64px minmax(0, 1fr); align-items: center; gap: 16px; inline-size: min(480px, 100%)">
  <span>默认</span><xh-separator decorative style="display: contents"><div data-xh-part="root"></div></xh-separator>
  <span>弱化</span><xh-separator decorative variant="subtle" style="display: contents"><div data-xh-part="root"></div></xh-separator>
  <span>强调</span><xh-separator decorative variant="strong" style="display: contents"><div data-xh-part="root"></div></xh-separator>
  <span>虚线</span><xh-separator decorative dashed style="display: contents"><div data-xh-part="root"></div></xh-separator>
</div>
`;export{a as default};

const a=`<!-- 渐变字配色 | tone 换成语气色板，覆盖槽改写两端颜色与走向 -->
<xh-typography>
  <div data-xh-part="root">
    <p data-xh-part="heading" level="3">
      <span data-xh-part="text" variant="gradient" tone="success">成功</span>
      ·
      <span data-xh-part="text" variant="gradient" tone="warning">警告</span>
      ·
      <span data-xh-part="text" variant="gradient" tone="danger">危险</span>
      ·
      <span data-xh-part="text" variant="gradient" tone="info">信息</span>
    </p>
    <p data-xh-part="heading" level="3">
      <span
        data-xh-part="text"
        variant="gradient"
        style="--xh-typography-gradient-from: var(--xh-color-orange-500); --xh-typography-gradient-to: var(--xh-color-pink-500)"
      >日落橙</span>
      ·
      <span
        data-xh-part="text"
        variant="gradient"
        style="--xh-typography-gradient-from: var(--xh-color-purple-500); --xh-typography-gradient-to: var(--xh-color-cyan-500); --xh-typography-gradient-direction: to bottom right"
      >极光紫</span>
    </p>
  </div>
</xh-typography>
`;export{a as default};

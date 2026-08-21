const a=`<!-- 尺寸 | size 换的是整块正文的字号与段间距，不传 size 即默认档 -->
<div style="display: flex; flex-direction: column; gap: 24px">
  <xh-typography size="sm">
    <div data-xh-part="root">
      <p data-xh-part="heading" level="4">小档</p>
      <p data-xh-part="paragraph">正文字号与段间距跟着档位走，标题档位另由 level 决定。</p>
    </div>
  </xh-typography>

  <!-- 中间一档不写 size -->
  <xh-typography>
    <div data-xh-part="root">
      <p data-xh-part="heading" level="4">默认档</p>
      <p data-xh-part="paragraph">正文字号与段间距跟着档位走，标题档位另由 level 决定。</p>
    </div>
  </xh-typography>

  <xh-typography size="lg">
    <div data-xh-part="root">
      <p data-xh-part="heading" level="4">大档</p>
      <p data-xh-part="paragraph">正文字号与段间距跟着档位走，标题档位另由 level 决定。</p>
    </div>
  </xh-typography>
</div>
`;export{a as default};

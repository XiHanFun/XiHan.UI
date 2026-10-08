var e=`<!-- 淡入淡出换页 | effect="fade" 把各张叠放在同一格：翻页时新一张淡入、旧一张同时淡出，轨道不位移；按钮、键盘、指示点与循环照常，减弱动效下直接换 -->
<xh-carousel slide-count="3" effect="fade" loop>
  <div data-xh-part="root" style="inline-size: 100%">
    <button data-xh-part="prev-trigger"></button>
    <div data-xh-part="viewport" style="block-size: 176px">
      <div data-xh-part="list">
        <div data-xh-part="item" index="0">
          <div style="display: grid; place-items: center; block-size: 100%; background: var(--xh-bg-brand-subtle); color: var(--xh-fg-default)">
            城市夜景
          </div>
        </div>
        <div data-xh-part="item" index="1">
          <div style="display: grid; place-items: center; block-size: 100%; background: color-mix(in oklab, var(--xh-fg-success) 12%, var(--xh-bg-surface)); color: var(--xh-fg-default)">
            海岸线
          </div>
        </div>
        <div data-xh-part="item" index="2">
          <div style="display: grid; place-items: center; block-size: 100%; background: color-mix(in oklab, var(--xh-fg-warning) 12%, var(--xh-bg-surface)); color: var(--xh-fg-default)">
            雪山
          </div>
        </div>
      </div>
    </div>
    <button data-xh-part="next-trigger"></button>
    <div data-xh-part="indicator-group">
      <button data-xh-part="indicator" index="0"></button>
      <button data-xh-part="indicator" index="1"></button>
      <button data-xh-part="indicator" index="2"></button>
    </div>
  </div>
</xh-carousel>
`;export{e as default};
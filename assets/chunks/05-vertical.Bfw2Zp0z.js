const t=`<!-- 纵向轨道 | orientation 换为 vertical 后轨道竖向位移，两端按钮落到上下两端，翻页识别上下方向键 -->
<xh-carousel id="carousel-vertical" orientation="vertical" slide-count="3">
  <div data-xh-part="root" style="inline-size: min(360px, 100%)">
    <button data-xh-part="prev-trigger"></button>
    <!-- 纵轨的裁切窗口靠高度定，宽度交给根节点 -->
    <div data-xh-part="viewport" style="block-size: 200px; inline-size: 100%">
      <div data-xh-part="list">
        <div data-xh-part="item" index="0">
          <article style="display: grid; align-content: center; gap: 6px; block-size: 100%; padding: 32px; background: var(--xh-bg-subtle); color: var(--xh-fg-default)">
            <span style="color: var(--xh-fg-brand); font-size: var(--xh-text-caption-size)">09:00</span>
            <strong style="color: var(--xh-fg-default); font-size: var(--xh-text-heading-3-size)">晨会</strong>
            <span style="color: var(--xh-fg-muted)">同步今天的目标与阻塞项。</span>
          </article>
        </div>
        <div data-xh-part="item" index="1">
          <article style="display: grid; align-content: center; gap: 6px; block-size: 100%; padding: 32px; background: var(--xh-bg-subtle); color: var(--xh-fg-default)">
            <span style="color: var(--xh-fg-brand); font-size: var(--xh-text-caption-size)">11:00</span>
            <strong style="color: var(--xh-fg-default); font-size: var(--xh-text-heading-3-size)">客户沟通</strong>
            <span style="color: var(--xh-fg-muted)">确认需求范围与交付节奏。</span>
          </article>
        </div>
        <div data-xh-part="item" index="2">
          <article style="display: grid; align-content: center; gap: 6px; block-size: 100%; padding: 32px; background: var(--xh-bg-subtle); color: var(--xh-fg-default)">
            <span style="color: var(--xh-fg-brand); font-size: var(--xh-text-caption-size)">15:00</span>
            <strong style="color: var(--xh-fg-default); font-size: var(--xh-text-heading-3-size)">联调</strong>
            <span style="color: var(--xh-fg-muted)">核对三端行为与视觉结果。</span>
          </article>
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
`;export{t as default};

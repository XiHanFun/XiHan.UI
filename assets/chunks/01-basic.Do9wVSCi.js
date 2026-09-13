const t=`<!-- 基础用法 | 张数由 slideCount 声明而不是从 DOM 数，页数与指示点数量都由它算出来 -->
<xh-carousel slide-count="3">
  <div data-xh-part="root" style="inline-size: 100%">
    <button data-xh-part="prev-trigger"></button>
    <!-- 视口只负责裁切，高度由页面给：不给高度就没有可裁的窗口 -->
    <div data-xh-part="viewport" style="block-size: 176px">
      <div data-xh-part="list">
        <div data-xh-part="item" index="0">
          <article style="display: grid; align-content: end; gap: 6px; block-size: 100%; padding: 24px; background: var(--xh-bg-brand-subtle); color: var(--xh-fg-default)">
            <span style="color: var(--xh-fg-muted); font-size: var(--xh-text-caption-size)">设计系统</span>
            <strong style="color: var(--xh-fg-default); font-size: var(--xh-text-heading-3-size)">一套视觉语言</strong>
            <span style="color: var(--xh-fg-muted)">令牌、皮肤与组件共享同一组设计决策。</span>
          </article>
        </div>
        <div data-xh-part="item" index="1">
          <article style="display: grid; align-content: end; gap: 6px; block-size: 100%; padding: 24px; background: color-mix(in oklab, var(--xh-fg-success) 12%, var(--xh-bg-surface)); color: var(--xh-fg-default)">
            <span style="color: var(--xh-fg-muted); font-size: var(--xh-text-caption-size)">无障碍</span>
            <strong style="color: var(--xh-fg-default); font-size: var(--xh-text-heading-3-size)">键盘与读屏一致</strong>
            <span style="color: var(--xh-fg-muted)">交互状态由无头内核统一维护。</span>
          </article>
        </div>
        <div data-xh-part="item" index="2">
          <article style="display: grid; align-content: end; gap: 6px; block-size: 100%; padding: 24px; background: color-mix(in oklab, var(--xh-fg-warning) 12%, var(--xh-bg-surface)); color: var(--xh-fg-default)">
            <span style="color: var(--xh-fg-muted); font-size: var(--xh-text-caption-size)">跨框架</span>
            <strong style="color: var(--xh-fg-default); font-size: var(--xh-text-heading-3-size)">Vue、React 与 Web Components</strong>
            <span style="color: var(--xh-fg-muted)">同一份行为契约，对齐三种渲染方式。</span>
          </article>
        </div>
      </div>
    </div>
    <button data-xh-part="next-trigger"></button>
    <div data-xh-part="indicator-group">
      <!-- 指示点一页一个，一屏一张时页数就是张数 -->
      <button data-xh-part="indicator" index="0"></button>
      <button data-xh-part="indicator" index="1"></button>
      <button data-xh-part="indicator" index="2"></button>
    </div>
  </div>
</xh-carousel>
`;export{t as default};

const t=`<!-- 自定义圆点 | 圆点是个容器，里面可以放图标；放图标时在根上把 --xh-timeline-indicator-size 调大一档，整列一样大，连线才对得齐 -->
<xh-timeline>
  <ol data-xh-part="root" style="max-inline-size: 360px; --xh-timeline-indicator-size: var(--xh-space-6); --xh-icon-size: var(--xh-glyph-size-sm)">
    <li data-xh-part="item" tone="success">
      <span data-xh-part="indicator">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="inline-size: var(--xh-icon-size); block-size: var(--xh-icon-size)"><path d="M5 2.5h14v19l-2.33-1.5-2.34 1.5-2.33-1.5-2.34 1.5-2.33-1.5-2.33 1.5Z"/><path d="M8.5 8h7"/><path d="M8.5 12h7"/><path d="M8.5 16h4"/></svg>
      </span>
      <span data-xh-part="connector"></span>
      <div data-xh-part="content">
        <time data-xh-part="time">09-26 10:02</time>
        <div data-xh-part="title">已下单</div>
        <div data-xh-part="description">订单号 A-20931</div>
      </div>
    </li>
    <li data-xh-part="item" tone="success">
      <span data-xh-part="indicator">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="inline-size: var(--xh-icon-size); block-size: var(--xh-icon-size)"><polygon points="12,3 20,7.5 20,16.5 12,21 4,16.5 4,7.5"/><path d="M4 7.5L12 12L20 7.5"/><path d="M12 12v9"/><path d="M8 5.25L16 9.75"/></svg>
      </span>
      <span data-xh-part="connector"></span>
      <div data-xh-part="content">
        <time data-xh-part="time">09-26 16:40</time>
        <div data-xh-part="title">已出库</div>
        <div data-xh-part="description">上海仓 · 2 件</div>
      </div>
    </li>
    <li data-xh-part="item" tone="info">
      <span data-xh-part="indicator">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="inline-size: var(--xh-icon-size); block-size: var(--xh-icon-size)"><path d="M14 17.5V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v10.5a1 1 0 0 0 1 1h2"/><path d="M9 17.5h6"/><path d="M19 17.5h2a1 1 0 0 0 1-1v-3a1 1 0 0 0-0.29-0.71L18.7 9.3a1 1 0 0 0-0.7-0.3H14"/><circle cx="7" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/></svg>
      </span>
      <span data-xh-part="connector"></span>
      <div data-xh-part="content">
        <time data-xh-part="time">09-27 08:15</time>
        <div data-xh-part="title">运输中</div>
        <div data-xh-part="description">预计明天送达</div>
      </div>
    </li>
  </ol>
</xh-timeline>
`;export{t as default};

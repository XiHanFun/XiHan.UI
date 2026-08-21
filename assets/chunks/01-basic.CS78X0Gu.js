const t=`<!-- 基础用法 | 一条竖向的事件流：每条一个圆点，圆点之间连一截线，末条的线自动收掉 -->
<xh-timeline>
  <ol data-xh-part="root" style="max-inline-size: 360px">
    <li data-xh-part="item">
      <span data-xh-part="indicator"></span>
      <span data-xh-part="connector"></span>
      <div data-xh-part="content">
        <!-- datetime 由作者写，组件不代填机读时间 -->
        <time data-xh-part="time" datetime="2026-07-01T09:12">7 月 1 日 09:12</time>
        <div data-xh-part="title">订单已创建</div>
        <div data-xh-part="description">下单来源：网页端</div>
      </div>
    </li>
    <li data-xh-part="item">
      <span data-xh-part="indicator"></span>
      <span data-xh-part="connector"></span>
      <div data-xh-part="content">
        <time data-xh-part="time" datetime="2026-07-01T10:30">7 月 1 日 10:30</time>
        <div data-xh-part="title">已发货</div>
        <div data-xh-part="description">承运商已揽收</div>
      </div>
    </li>
    <li data-xh-part="item">
      <span data-xh-part="indicator"></span>
      <span data-xh-part="connector"></span>
      <div data-xh-part="content">
        <time data-xh-part="time" datetime="2026-07-02T14:05">7 月 2 日 14:05</time>
        <div data-xh-part="title">已签收</div>
        <div data-xh-part="description">本人签收</div>
      </div>
    </li>
  </ol>
</xh-timeline>
`;export{t as default};

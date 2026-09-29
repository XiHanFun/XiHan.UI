const a=`<!-- 标题与附加内容 | 列表之前的头部放标题与作用于整份描述的操作；它排在 dl 之外，标题标签按页面层级由作者选 -->
<!-- 头部写成 dl 的前一个兄弟：dl 里面只能放成对的 dt / dd -->
<xh-descriptions columns="2" variant="outline" style="display: block; max-inline-size: 560px">
  <div data-xh-part="header">
    <h3 data-xh-part="title">订单信息</h3>
    <div data-xh-part="extra">
      <xh-button variant="outline" size="sm">
        <button data-xh-part="root">编辑</button>
      </xh-button>
    </div>
  </div>
  <dl data-xh-part="root">
    <div data-xh-part="item">
      <dt data-xh-part="label">订单号</dt>
      <dd data-xh-part="value">XH-20260810-0042</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">下单时间</dt>
      <dd data-xh-part="value">2026-08-10 09:31</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">支付方式</dt>
      <dd data-xh-part="value">余额支付</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">收货人</dt>
      <dd data-xh-part="value">林一</dd>
    </div>
  </dl>
</xh-descriptions>
`;export{a as default};

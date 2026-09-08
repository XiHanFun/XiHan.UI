const a=`<!-- 跨列 | 一格写 span 横跨几列，上限是当前列数；长文本字段因此不必另开一份描述列表 -->
<xh-descriptions columns="3" bordered>
  <dl data-xh-part="root" style="max-inline-size: 720px">
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

    <div data-xh-part="item" span="2">
      <dt data-xh-part="label">收货地址</dt>
      <dd data-xh-part="value">浙江省杭州市余杭区文一西路 969 号</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">联系电话</dt>
      <dd data-xh-part="value">138 0000 0000</dd>
    </div>

    <!-- 超过 columns 时按 columns 算，不会跨出网格另起一行 -->
    <div data-xh-part="item" span="9">
      <dt data-xh-part="label">备注</dt>
      <dd data-xh-part="value">工作日 09:00–18:00 送达，到前电联。</dd>
    </div>
  </dl>
</xh-descriptions>
`;export{a as default};

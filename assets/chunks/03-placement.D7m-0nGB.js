const d=`<!-- 标签位置 | placement 决定标签在上还是在左，不传即在上 -->
<div style="display: flex; flex-wrap: wrap; gap: 24px">
  <div style="inline-size: 260px">
    <p>标签在上（默认）</p>
    <xh-descriptions>
      <dl data-xh-part="root">
        <div data-xh-part="item">
          <dt data-xh-part="label">订单号</dt>
          <dd data-xh-part="value">XH-20260810-0042</dd>
        </div>
        <div data-xh-part="item">
          <dt data-xh-part="label">下单时间</dt>
          <dd data-xh-part="value">2026-08-10 09:31</dd>
        </div>
      </dl>
    </xh-descriptions>
  </div>

  <div style="inline-size: 260px">
    <p>标签在左</p>
    <xh-descriptions placement="left">
      <dl data-xh-part="root">
        <div data-xh-part="item">
          <dt data-xh-part="label">订单号</dt>
          <dd data-xh-part="value">XH-20260810-0042</dd>
        </div>
        <div data-xh-part="item">
          <dt data-xh-part="label">下单时间</dt>
          <dd data-xh-part="value">2026-08-10 09:31</dd>
        </div>
      </dl>
    </xh-descriptions>
  </div>
</div>
`;export{d as default};

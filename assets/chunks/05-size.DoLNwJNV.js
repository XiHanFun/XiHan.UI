const d=`<!-- 尺寸 | size 换的是每格的内边距、组与组的间距与整体字号，不传 size 即默认档 -->
<div style="display: flex; flex-direction: column; gap: 16px">
  <xh-descriptions size="sm" bordered columns="2" placement="left">
    <dl data-xh-part="root">
      <div data-xh-part="item">
        <dt data-xh-part="label">小 · 状态</dt>
        <dd data-xh-part="value">已发货</dd>
      </div>
      <div data-xh-part="item">
        <dt data-xh-part="label">小 · 承运商</dt>
        <dd data-xh-part="value">顺丰速运</dd>
      </div>
    </dl>
  </xh-descriptions>

  <!-- 中间这一档不写 size -->
  <xh-descriptions bordered columns="2" placement="left">
    <dl data-xh-part="root">
      <div data-xh-part="item">
        <dt data-xh-part="label">默认 · 状态</dt>
        <dd data-xh-part="value">已发货</dd>
      </div>
      <div data-xh-part="item">
        <dt data-xh-part="label">默认 · 承运商</dt>
        <dd data-xh-part="value">顺丰速运</dd>
      </div>
    </dl>
  </xh-descriptions>

  <xh-descriptions size="lg" bordered columns="2" placement="left">
    <dl data-xh-part="root">
      <div data-xh-part="item">
        <dt data-xh-part="label">大 · 状态</dt>
        <dd data-xh-part="value">已发货</dd>
      </div>
      <div data-xh-part="item">
        <dt data-xh-part="label">大 · 承运商</dt>
        <dd data-xh-part="value">顺丰速运</dd>
      </div>
    </dl>
  </xh-descriptions>
</div>
`;export{d as default};

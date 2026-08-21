const t=`<!-- 语气 | 六种语气换的是浮层实心底与其上的文字色，箭头一并跟着走；把指针停在触发器上（或用 Tab 聚焦）看差别 -->
<div style="display: flex; flex-wrap: wrap; gap: 24px">
  <xh-tooltip tone="brand" placement="bottom" open-delay="0">
    <button data-xh-part="trigger">品牌</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        tone = brand
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-tooltip>

  <xh-tooltip tone="neutral" placement="bottom" open-delay="0">
    <button data-xh-part="trigger">中性</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        tone = neutral
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-tooltip>

  <xh-tooltip tone="success" placement="bottom" open-delay="0">
    <button data-xh-part="trigger">成功</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        tone = success
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-tooltip>

  <xh-tooltip tone="warning" placement="bottom" open-delay="0">
    <button data-xh-part="trigger">警告</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        tone = warning
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-tooltip>

  <xh-tooltip tone="danger" placement="bottom" open-delay="0">
    <button data-xh-part="trigger">危险</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        tone = danger
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-tooltip>

  <xh-tooltip tone="info" placement="bottom" open-delay="0">
    <button data-xh-part="trigger">信息</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        tone = info
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-tooltip>
</div>
`;export{t as default};

const t=`<!-- 朝向 | placement 是请求值，空间不够时由定位引擎避让；箭头跟着最终落定的那一面走 -->
<div style="display: flex; flex-wrap: wrap; gap: 24px">
  <xh-tooltip placement="top" open-delay="0">
    <button data-xh-part="trigger">上方</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        请求朝向 top
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-tooltip>

  <xh-tooltip placement="right" open-delay="0">
    <button data-xh-part="trigger">右侧</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        请求朝向 right
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-tooltip>

  <xh-tooltip placement="bottom" open-delay="0">
    <button data-xh-part="trigger">下方</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        请求朝向 bottom
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-tooltip>

  <xh-tooltip placement="left" open-delay="0">
    <button data-xh-part="trigger">左侧</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        请求朝向 left
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-tooltip>
</div>
`;export{t as default};

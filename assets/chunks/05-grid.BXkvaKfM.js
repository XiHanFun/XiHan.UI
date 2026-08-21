const a=`<!-- 栅格排布 | 组容器的行列只是缺省排布，行内把 display 改成 grid 就能摆成多列 -->
<xh-checkbox-group default-value="beijing,chengdu">
  <div
    data-xh-part="root"
    style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 16px"
  >
    <span data-xh-part="label" style="grid-column: 1 / -1">开通城市</span>
    <div data-xh-part="item" value="beijing">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">北京</span>
    </div>
    <div data-xh-part="item" value="shanghai">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">上海</span>
    </div>
    <div data-xh-part="item" value="guangzhou">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">广州</span>
    </div>
    <div data-xh-part="item" value="shenzhen">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">深圳</span>
    </div>
    <div data-xh-part="item" value="chengdu">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">成都</span>
    </div>
    <div data-xh-part="item" value="hangzhou">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">杭州</span>
    </div>
  </div>
</xh-checkbox-group>
`;export{a as default};

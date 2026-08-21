const a=`<!-- 横向排布 | orientation 只影响排版与 aria-orientation，方向键四个方向照样都能切换 -->
<xh-radio-group default-value="md" orientation="horizontal">
  <div data-xh-part="root">
    <span data-xh-part="label">尺寸</span>
    <div data-xh-part="item" value="sm">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">小</span>
    </div>
    <div data-xh-part="item" value="md">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">中</span>
    </div>
    <div data-xh-part="item" value="lg">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">大</span>
    </div>
  </div>
</xh-radio-group>
`;export{a as default};

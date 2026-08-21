const a=`<!-- 尺寸 | size 改条目间距与字号，不写即缺省中档 -->
<div style="display: flex; gap: 32px; flex-wrap: wrap; align-items: flex-start">
  <xh-radio-group default-value="standard" size="sm">
    <div data-xh-part="root">
      <span data-xh-part="label">sm</span>
      <div data-xh-part="item" value="free">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">免费版</span>
      </div>
      <div data-xh-part="item" value="standard">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">标准版</span>
      </div>
    </div>
  </xh-radio-group>

  <xh-radio-group default-value="standard">
    <div data-xh-part="root">
      <span data-xh-part="label">缺省</span>
      <div data-xh-part="item" value="free">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">免费版</span>
      </div>
      <div data-xh-part="item" value="standard">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">标准版</span>
      </div>
    </div>
  </xh-radio-group>

  <xh-radio-group default-value="standard" size="lg">
    <div data-xh-part="root">
      <span data-xh-part="label">lg</span>
      <div data-xh-part="item" value="free">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">免费版</span>
      </div>
      <div data-xh-part="item" value="standard">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">标准版</span>
      </div>
    </div>
  </xh-radio-group>
</div>
`;export{a as default};

const a=`<!-- 尺寸 | 不传 size 即默认档；行高、内边距与字号一起换档，标题也跟着变 -->
<div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px">
  <xh-time-field size="sm" default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">sm</label>
      <div data-xh-part="control">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
      </div>
    </div>
  </xh-time-field>

  <xh-time-field default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">默认</label>
      <div data-xh-part="control">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
      </div>
    </div>
  </xh-time-field>

  <xh-time-field size="lg" default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">lg</label>
      <div data-xh-part="control">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
      </div>
    </div>
  </xh-time-field>
</div>
`;export{a as default};

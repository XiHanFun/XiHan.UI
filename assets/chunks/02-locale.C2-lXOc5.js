const a=`<!-- 地区格式 | 根据 locale 调整日期顺序 -->
<div style="display: grid; gap: 16px">
  <xh-date-field locale="zh-CN" default-value="2026-07-28">
    <div data-xh-part="root">
      <label data-xh-part="label">中文格式</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field locale="en-US" default-value="2026-07-28">
    <div data-xh-part="root">
      <label data-xh-part="label">美国格式</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>/</span>
          <span data-xh-part="segment" index="1"></span>
          <span>/</span>
          <span data-xh-part="segment" index="2"></span>
        </div>
      </div>
    </div>
  </xh-date-field>
</div>
`;export{a as default};

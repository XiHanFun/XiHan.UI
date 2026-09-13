const a=`<!-- 日期范围 | 限制可输入日期 -->
<div style="display: grid; gap: 16px">
  <xh-date-field default-value="2026-07-28" locale="zh-CN" min="2020-01-01" max="2030-12-31">
    <div data-xh-part="root">
      <label data-xh-part="label">有效日期（2020—2030）</label>
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

  <xh-date-field default-value="2019-05-01" locale="zh-CN" min="2020-01-01">
    <div data-xh-part="root">
      <label data-xh-part="label">早于最小日期</label>
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
</div>
`;export{a as default};

const a=`<!-- 基础用法 | 输入日期 -->
<xh-date-field locale="zh-CN" name="deadline">
    <div
      data-xh-part="root"
      style="--xh-date-field-control-min-w: calc(var(--xh-control-min-w) + var(--xh-control-h-md) + var(--xh-space-6))"
    >
    <label data-xh-part="label">截止日期</label>
    <div data-xh-part="control">
      <div data-xh-part="segment-group">
        <span data-xh-part="segment" index="0"></span>
        <span>/</span>
        <span data-xh-part="segment" index="1"></span>
        <span>/</span>
        <span data-xh-part="segment" index="2"></span>
      </div>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <input data-xh-part="hidden-input" />
  </div>
</xh-date-field>
`;export{a as default};

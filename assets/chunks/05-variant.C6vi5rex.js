const a=`<!-- 形态 | variant 只改分段框的底色与描边用法，分段结构与键盘行为都不变 -->
<div style="display: grid; gap: 16px; justify-items: start">
  <xh-date-field variant="outline" default-value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">outline</label>
      <div data-xh-part="control">
        <span data-xh-part="segment" index="0"></span>
        <span>年</span>
        <span data-xh-part="segment" index="1"></span>
        <span>月</span>
        <span data-xh-part="segment" index="2"></span>
        <span>日</span>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field variant="subtle" default-value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">subtle</label>
      <div data-xh-part="control">
        <span data-xh-part="segment" index="0"></span>
        <span>年</span>
        <span data-xh-part="segment" index="1"></span>
        <span>月</span>
        <span data-xh-part="segment" index="2"></span>
        <span>日</span>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field variant="ghost" default-value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">ghost</label>
      <div data-xh-part="control">
        <span data-xh-part="segment" index="0"></span>
        <span>年</span>
        <span data-xh-part="segment" index="1"></span>
        <span>月</span>
        <span data-xh-part="segment" index="2"></span>
        <span>日</span>
      </div>
    </div>
  </xh-date-field>
</div>
`;export{a as default};

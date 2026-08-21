const l=`<!-- 字段横排 | 一行里摆多个字段：每个字段自成一块，谁跟谁排一行是外层容器的事 -->
<!-- 外层给一行的排布，宽度逐个字段自己定 -->
<div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 12px">
  <xh-field>
    <div data-xh-part="root" style="inline-size: 160px">
      <label data-xh-part="label">姓名</label>
      <input data-xh-part="control" placeholder="请输入姓名" />
    </div>
  </xh-field>

  <xh-field>
    <div data-xh-part="root" style="inline-size: 96px">
      <label data-xh-part="label">年龄</label>
      <input data-xh-part="control" type="number" placeholder="18" />
    </div>
  </xh-field>

  <xh-field>
    <div data-xh-part="root" style="inline-size: 180px">
      <label data-xh-part="label">电话</label>
      <input data-xh-part="control" type="tel" placeholder="请输入电话" />
    </div>
  </xh-field>
</div>
`;export{l as default};

const a=`<!-- 分段形态 | variant="segmented" 把一排短选项画成一条轨道，选中段由滑块标出，换段时滑块滑过去；缺省横排 -->
<!-- 滑块写在段之前：它绝对定位，靠文档序让段压在它上面；轨道里不排可见标题，label 只作可及名 -->
<!-- 段不要用原生 button：单选只认 Space 选中，按钮会把 Enter 也翻成点击 -->
<xh-radio-group variant="segmented" default-value="week">
  <div data-xh-part="root">
    <span data-xh-part="label">时间粒度</span>
    <span data-xh-part="thumb"></span>
    <div data-xh-part="item" value="day">
      <span data-xh-part="item-text">日</span>
    </div>
    <div data-xh-part="item" value="week">
      <span data-xh-part="item-text">周</span>
    </div>
    <div data-xh-part="item" value="month">
      <span data-xh-part="item-text">月</span>
    </div>
  </div>
</xh-radio-group>
`;export{a as default};

const a=`<!-- 基础用法 | 一个自动递增的秒表：不写内容时组件铺设时、分、秒三段，auto-start 使它挂载即开始运行 -->
<xh-timer auto-start>
  <div data-xh-part="root">
    <div data-xh-part="display">
      <span data-xh-part="item" unit="hours"></span>
      <span data-xh-part="separator">:</span>
      <span data-xh-part="item" unit="minutes"></span>
      <span data-xh-part="separator">:</span>
      <span data-xh-part="item" unit="seconds"></span>
    </div>
  </div>
</xh-timer>
`;export{a as default};

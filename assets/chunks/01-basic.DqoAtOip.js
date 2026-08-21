const a=`<!-- 基础用法 | 一个自己往上走的秒表：不写内容时组件铺开时、分、秒三段，auto-start 让它挂载即开跑 -->
<xh-timer auto-start>
  <div data-xh-part="root">
    <div data-xh-part="area">
      <span data-xh-part="item" unit="hours"></span>
      <span data-xh-part="separator">:</span>
      <span data-xh-part="item" unit="minutes"></span>
      <span data-xh-part="separator">:</span>
      <span data-xh-part="item" unit="seconds"></span>
    </div>
  </div>
</xh-timer>
`;export{a as default};

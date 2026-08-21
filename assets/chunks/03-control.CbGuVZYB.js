const t=`<!-- 起停与归零 | 自己写部件：control 是一个原生按钮，按一下就按当前状态走一步（开始 / 暂停 / 继续 / 重来） -->
<xh-timer>
  <div data-xh-part="root">
    <div data-xh-part="area">
      <span data-xh-part="item" unit="minutes"></span>
      <span data-xh-part="separator">:</span>
      <span data-xh-part="item" unit="seconds"></span>
    </div>
    <button data-xh-part="control">起停</button>
  </div>
</xh-timer>
`;export{t as default};

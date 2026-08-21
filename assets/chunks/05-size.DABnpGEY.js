const t=`<!-- 三个尺寸档 | size 只写在 root 上，数字大小与起停按钮的高度一起换档，子部件不重复标注 -->
<div style="margin-block-end: 12px">
  <xh-timer size="sm" countdown start-ms="60000">
    <div data-xh-part="root">
      <div data-xh-part="area">
        <span data-xh-part="item" unit="minutes"></span>
        <span data-xh-part="separator">:</span>
        <span data-xh-part="item" unit="seconds"></span>
      </div>
      <button data-xh-part="control">起停</button>
    </div>
  </xh-timer>
</div>

<div style="margin-block-end: 12px">
  <xh-timer size="md" countdown start-ms="60000">
    <div data-xh-part="root">
      <div data-xh-part="area">
        <span data-xh-part="item" unit="minutes"></span>
        <span data-xh-part="separator">:</span>
        <span data-xh-part="item" unit="seconds"></span>
      </div>
      <button data-xh-part="control">起停</button>
    </div>
  </xh-timer>
</div>

<div style="margin-block-end: 12px">
  <xh-timer size="lg" countdown start-ms="60000">
    <div data-xh-part="root">
      <div data-xh-part="area">
        <span data-xh-part="item" unit="minutes"></span>
        <span data-xh-part="separator">:</span>
        <span data-xh-part="item" unit="seconds"></span>
      </div>
      <button data-xh-part="control">起停</button>
    </div>
  </xh-timer>
</div>
`;export{t as default};

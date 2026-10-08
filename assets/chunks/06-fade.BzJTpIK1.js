var e=`<!-- 两端渐隐 | fade 让内容从窗口一端淡入、从另一端淡出，边缘不再生硬地切断文字；有暂停开关时行尾那一端淡到开关之前 -->
<xh-marquee fade auto-fill>
  <div data-xh-part="root" style="max-inline-size: 420px">
    <div data-xh-part="content">
      <div data-xh-copy="0">
        <span style="margin-inline-end: 32px; white-space: nowrap">
          系统将于本周六 02:00 起停机维护两小时
        </span>
        <span style="margin-inline-end: 32px; white-space: nowrap">
          新版导出支持按列脱敏
        </span>
        <span style="margin-inline-end: 32px; white-space: nowrap">本月账单已生成</span>
      </div>
      <!-- 第二份只为接缝：对读屏隐藏、不进 Tab 序 -->
      <div data-xh-copy="1" aria-hidden="true" inert>
        <span style="margin-inline-end: 32px; white-space: nowrap">
          系统将于本周六 02:00 起停机维护两小时
        </span>
        <span style="margin-inline-end: 32px; white-space: nowrap">
          新版导出支持按列脱敏
        </span>
        <span style="margin-inline-end: 32px; white-space: nowrap">本月账单已生成</span>
      </div>
    </div>
    <button data-xh-part="autoplay-trigger"></button>
  </div>
</xh-marquee>
`;export{e as default};
const n=`<!-- 暂停开关 | 窗口行尾压一颗暂停开关，触屏与键盘也停得住；名字与图标随状态换成下一步的动作 -->
<xh-marquee
  auto-fill
  style="
    display: block;
    max-inline-size: 420px;
    border: 1px solid var(--xh-border-default);
    border-radius: 6px;
  "
>
  <div data-xh-part="root">
    <div data-xh-part="content">
      <div data-xh-copy="0">
        <span style="padding: 10px 14px; white-space: nowrap">系统将于本周六 02:00 起停机维护两小时</span>
        <span style="padding: 10px 14px; white-space: nowrap">新版导出支持按列脱敏</span>
        <span style="padding: 10px 14px; white-space: nowrap">本月账单已生成</span>
      </div>
      <div data-xh-copy="1" aria-hidden="true" inert>
        <span style="padding: 10px 14px; white-space: nowrap">系统将于本周六 02:00 起停机维护两小时</span>
        <span style="padding: 10px 14px; white-space: nowrap">新版导出支持按列脱敏</span>
        <span style="padding: 10px 14px; white-space: nowrap">本月账单已生成</span>
      </div>
    </div>
    <!-- 写在 root 里、紧跟轨道；不给内容时皮肤画暂停 / 播放图标 -->
    <button data-xh-part="autoplay-trigger"></button>
  </div>
</xh-marquee>
`;export{n as default};

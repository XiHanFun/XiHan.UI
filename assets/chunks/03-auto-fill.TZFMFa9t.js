const n=`<!-- 重复铺满 | autoFill 在轨道中铺设两份内容，滚完一份时第二份正好位于起点，看不出接缝；不开启则整段滚完再回到起点 -->
<div style="display: flex; flex-direction: column; gap: 20px">
  <div>
    <p style="margin-block-end: 8px; font-size: 12px">不开：整段走出窗口后再从另一侧进来</p>
    <!-- 给了 speed 时 root 的内联样式归组件管，外观写在宿主元素上 -->
    <xh-marquee
      speed="60"
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
            <span style="padding: 6px 14px; white-space: nowrap">多租户</span>
            <span style="padding: 6px 14px; white-space: nowrap">字段级脱敏</span>
            <span style="padding: 6px 14px; white-space: nowrap">动态 API</span>
            <span style="padding: 6px 14px; white-space: nowrap">工作流</span>
            <span style="padding: 6px 14px; white-space: nowrap">代码生成</span>
          </div>
        </div>
      </div>
    </xh-marquee>
  </div>

  <div>
    <p style="margin-block-end: 8px; font-size: 12px">autoFill：一圈只走一份，接缝处始终有内容</p>
    <xh-marquee
      auto-fill
      speed="60"
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
            <span style="padding: 6px 14px; white-space: nowrap">多租户</span>
            <span style="padding: 6px 14px; white-space: nowrap">字段级脱敏</span>
            <span style="padding: 6px 14px; white-space: nowrap">动态 API</span>
            <span style="padding: 6px 14px; white-space: nowrap">工作流</span>
            <span style="padding: 6px 14px; white-space: nowrap">代码生成</span>
          </div>
          <!-- 第二份是副本：读屏不念第二遍，Tab 也不停在上面 -->
          <div data-xh-copy="1" aria-hidden="true" inert>
            <span style="padding: 6px 14px; white-space: nowrap">多租户</span>
            <span style="padding: 6px 14px; white-space: nowrap">字段级脱敏</span>
            <span style="padding: 6px 14px; white-space: nowrap">动态 API</span>
            <span style="padding: 6px 14px; white-space: nowrap">工作流</span>
            <span style="padding: 6px 14px; white-space: nowrap">代码生成</span>
          </div>
        </div>
      </div>
    </xh-marquee>
  </div>
</div>
`;export{n as default};

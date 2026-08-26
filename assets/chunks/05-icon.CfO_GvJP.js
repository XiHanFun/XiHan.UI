const n=`<!-- 自定义排版 | 条子本身就是一行 flex，摆什么、摆在哪一侧都归作者；组件只管盒子、计时与退场 -->
<div style="display: grid; gap: 12px; justify-items: start">
  <!-- 换一枚业务自己的图标；尺寸与语气色都取条子给的槽 -->
  <xh-toast type="info" duration="0" closable="false">
    <div data-xh-part="root">
      <span
        aria-hidden="true"
        style="
          display: grid;
          place-items: center;
          flex: none;
          inline-size: var(--xh-icon-size);
          block-size: var(--xh-icon-size);
          color: var(--xh-_tone-fg);
        "
        ><svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5c2.5 2.5 4 6 4 9.5 0 1.8-.4 3.3-1.2 4.5H9.2C8.4 15.3 8 13.8 8 12c0-3.5 1.5-7 4-9.5Z"/><circle cx="12" cy="10" r="0.75"/><path d="M8.2 13.5C6 14.7 4.5 17 4.5 19.5L9.2 16.5"/><path d="M15.8 13.5C18 14.7 19.5 17 19.5 19.5L14.8 16.5"/><path d="M10 17.5c0 1.5 .9 2.8 2 3.5 1.1-.7 2-2 2-3.5"/></svg></span
      >
      <div data-xh-part="title">部署已开始</div>
    </div>
  </xh-toast>

  <!-- 图标摆到行尾 -->
  <xh-toast type="success" duration="0" closable="false">
    <div data-xh-part="root">
      <div data-xh-part="title">已复制到剪贴板</div>
      <span
        aria-hidden="true"
        style="
          display: grid;
          place-items: center;
          flex: none;
          inline-size: var(--xh-icon-size);
          block-size: var(--xh-icon-size);
          color: var(--xh-_tone-fg);
        "
        ><svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M15 6V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h1"/></svg></span
      >
    </div>
  </xh-toast>

  <!-- 什么都不摆，只有一句话 -->
  <xh-toast type="info" duration="0" closable="false">
    <div data-xh-part="root">
      <div data-xh-part="title">已切换到只读模式</div>
    </div>
  </xh-toast>
</div>
`;export{n as default};

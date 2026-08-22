const t=`<!-- 基础用法 | 点触发器打开面板：标题栏那条把手可以拖，右下角可以改大小，Esc 关闭 -->
<!-- 不传 open 即非受控；位置与尺寸同理，default-* 只给初值 -->
<xh-floating-panel default-position="160,140" style="display: contents">
  <div data-xh-part="root">
    <button data-xh-part="trigger">打开面板</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="header">
          <h2 data-xh-part="title">调试面板</h2>
          <!-- 把手自己不显示内容，它铺满标题栏剩下的横向空间 -->
          <button data-xh-part="drag-trigger"></button>
          <button data-xh-part="close-trigger"></button>
        </div>
        <div data-xh-part="body">
          <p style="margin: 0">面板不挡住页面，底下的内容照常能点。</p>
        </div>
        <div data-xh-part="resize-trigger" edge="se"></div>
      </div>
    </div>
  </div>
</xh-floating-panel>
`;export{t as default};

const a=`<!-- 分组 | 在菜单内组织相关命令 -->
<xh-menubar>
  <div data-xh-part="root" style="background: var(--xh-bg-subtle)">
    <button data-xh-part="trigger" value="view">视图</button>
    <div data-xh-part="positioner" value="view">
      <div data-xh-part="content" value="view">
        <div data-xh-part="group" value="theme">
          <span data-xh-part="group-label">主题</span>
          <div data-xh-part="item" value="light"><span data-xh-part="item-indicator"></span><span data-xh-part="item-text">浅色</span></div>
          <div data-xh-part="item" value="dark"><span data-xh-part="item-text">深色</span></div>
        </div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="group" value="panels">
          <span data-xh-part="group-label">面板</span>
          <div data-xh-part="item" value="sidebar"><span data-xh-part="item-text">侧栏</span></div>
          <div data-xh-part="item" value="terminal"><span data-xh-part="item-text">终端</span></div>
        </div>
      </div>
    </div>
  </div>
</xh-menubar>
`;export{a as default};

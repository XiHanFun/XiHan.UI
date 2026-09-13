const a=`<!-- 基础用法 | 在目标区域右键打开命令菜单 -->
<xh-context-menu>
  <div data-xh-part="root">
    <div
      data-xh-part="trigger"
      style="display: grid; place-items: center; gap: 6px; inline-size: min(480px, 100%); min-block-size: 160px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); cursor: context-menu"
    >
      <strong>设计规范.pdf</strong>
      <span style="color: var(--xh-fg-muted)">右键打开菜单</span>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="open"><span data-xh-part="item-text">打开</span></div>
        <div data-xh-part="item" value="rename"><span data-xh-part="item-text">重命名</span></div>
        <div data-xh-part="item" value="duplicate"><span data-xh-part="item-text">创建副本</span></div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="item" value="delete"><span data-xh-part="item-text">移到回收站</span></div>
      </div>
    </div>
  </div>
</xh-context-menu>
`;export{a as default};

const a=`<!-- 说明与快捷键 | 只交数据，副文本与按键提示自动落位 -->
<xh-menu>
  <button data-xh-part="trigger" style="block-size: var(--xh-control-h-md); padding-inline: var(--xh-control-px-md); border: 0; border-radius: var(--xh-shape-pill); background: var(--xh-bg-subtle); color: var(--xh-fg-default); font: inherit; cursor: pointer">更多</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <div data-xh-part="item" value="duplicate">
        <span data-xh-part="item-text">创建副本</span>
        <span data-xh-part="item-description">保留当前版本，另存一份</span>
        <span data-xh-part="item-shortcut">⌘ D</span>
      </div>
      <div data-xh-part="item" value="export">
        <span data-xh-part="item-text">导出</span>
        <span data-xh-part="item-description">生成 PDF 或 PNG</span>
        <span data-xh-part="item-shortcut">⌘ E</span>
      </div>
      <div data-xh-part="separator"></div>
      <div data-xh-part="item" value="archive">
        <span data-xh-part="item-text">归档</span>
        <span data-xh-part="item-description">移出列表，随时可以恢复</span>
        <span data-xh-part="item-shortcut">⌘ ⇧ A</span>
      </div>
    </div>
  </div>
</xh-menu>
`;export{a as default};

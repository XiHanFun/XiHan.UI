const t=`<!-- 图标与快捷键 | 为常用命令补充识别信息 -->
<xh-menu>
  <button data-xh-part="trigger" style="block-size: var(--xh-control-h-md); padding-inline: var(--xh-control-px-md); border: 0; border-radius: var(--xh-shape-pill); background: var(--xh-bg-subtle); color: var(--xh-fg-default); font: inherit; cursor: pointer">编辑</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <div data-xh-part="item" value="copy">
        <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>
        <span data-xh-part="item-text">复制</span><span aria-hidden="true">⌘ C</span>
      </div>
      <div data-xh-part="item" value="rename">
        <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 20h4l11-11-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>
        <span data-xh-part="item-text">重命名</span><span aria-hidden="true">F2</span>
      </div>
      <div data-xh-part="separator"></div>
      <div data-xh-part="item" value="delete">
        <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13"/></svg>
        <span data-xh-part="item-text">移到回收站</span><span aria-hidden="true">⌫</span>
      </div>
    </div>
  </div>
</xh-menu>
`;export{t as default};

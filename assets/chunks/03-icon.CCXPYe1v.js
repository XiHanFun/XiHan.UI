const t=`<!-- 图标与快捷键 | 补充常用命令的识别信息 -->
<xh-menubar>
  <div data-xh-part="root" style="background: var(--xh-bg-subtle)">
    <button data-xh-part="trigger" value="file">文件</button>
    <button data-xh-part="trigger" value="edit">编辑</button>
    <div data-xh-part="positioner" value="file">
      <div data-xh-part="content" value="file">
        <div data-xh-part="item" value="new"><span data-xh-part="item-indicator"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></span><span data-xh-part="item-text">新建</span><span data-xh-part="item-shortcut">⌘ N</span></div>
        <div data-xh-part="item" value="open"><span data-xh-part="item-indicator"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 7h7l2 3h9v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></span><span data-xh-part="item-text">打开</span><span data-xh-part="item-shortcut">⌘ O</span></div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="item" value="save"><span data-xh-part="item-indicator"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 4h12l3 3v13H4V5zM8 4v6h8M8 20v-6h8v6"/></svg></span><span data-xh-part="item-text">保存</span><span data-xh-part="item-shortcut">⌘ S</span></div>
      </div>
    </div>
    <div data-xh-part="positioner" value="edit"><div data-xh-part="content" value="edit"><div data-xh-part="item" value="undo">撤销</div><div data-xh-part="item" value="redo">重做</div></div></div>
  </div>
</xh-menubar>
`;export{t as default};

var e=`<!-- 基础用法 | 从按钮打开一组操作 -->
<xh-menu>
  <xh-button data-xh-part="trigger" variant="subtle">
    <button data-xh-part="root">
      操作
      <xh-icon>
        <svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9L12 15L18 9" /></svg>
      </xh-icon>
    </button>
  </xh-button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <div data-xh-part="item" value="new">新建文件</div>
      <div data-xh-part="item" value="open">打开文件</div>
      <div data-xh-part="item" value="save">保存</div>
      <div data-xh-part="separator"></div>
      <div data-xh-part="item" value="delete">移到回收站</div>
    </div>
  </div>
</xh-menu>
`;export{e as default};
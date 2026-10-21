var e=`<!-- 委托 | delegate 让一个提示管一整排按钮：文字取按钮的 data-xh-tooltip 或可及名，快捷键取 aria-keyshortcuts；指针在按钮之间挪动时提示直接换过去 -->
<xh-tooltip delegate="button">
  <div data-xh-part="trigger">
    <div style="display: flex; gap: 8px">
      <xh-button variant="outline"><button data-xh-part="root" aria-keyshortcuts="Control+Z">撤销</button></xh-button>
      <xh-button variant="outline"><button data-xh-part="root" aria-keyshortcuts="Control+Shift+Z">重做</button></xh-button>
      <xh-button variant="outline"><button data-xh-part="root" aria-keyshortcuts="Delete" data-xh-tooltip="删除选中的对象">删除</button></xh-button>
    </div>
  </div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <div data-xh-part="arrow"></div>
    </div>
  </div>
</xh-tooltip>
`;export{e as default};
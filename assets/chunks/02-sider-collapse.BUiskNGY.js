const d=`<!-- 折叠侧栏 | 不传 sider-collapsed 即为非受控，把手按下去只改宽度，侧栏节点一直在 -->
<xh-layout bordered>
  <div
    data-xh-part="root"
    style="block-size: 240px; border-radius: 8px; overflow: hidden"
  >
    <div data-xh-part="header">
      <button data-xh-part="sider-trigger">切换</button>
      <span>控制台</span>
    </div>
    <div data-xh-part="sider">导航 · 收藏 · 回收站</div>
    <div data-xh-part="content">
      折起来的是宽度不是高度，侧栏里的滚动位置与输入框都留着。
    </div>
  </div>
</xh-layout>
`;export{d as default};

const d=`<!-- 侧栏覆盖档 | sider-presentation="sheet" 把侧栏移出画外，唤出来时盖在内容之上；点遮罩或按 Escape 收起 -->
<xh-layout bordered default-sider-collapsed sider-presentation="sheet">
  <div
    data-xh-part="root"
    style="block-size: 240px; border-radius: 8px; overflow: hidden"
  >
    <div data-xh-part="header">
      <button data-xh-part="sider-trigger">菜单</button>
      <span>控制台</span>
    </div>
    <div data-xh-part="sider-backdrop"></div>
    <div data-xh-part="sider">导航 · 收藏 · 回收站</div>
    <div data-xh-part="content">
      覆盖档下侧栏不占列，内容占满整宽；面板贴住视口那条边升起来。
    </div>
  </div>
</xh-layout>
`;export{d as default};

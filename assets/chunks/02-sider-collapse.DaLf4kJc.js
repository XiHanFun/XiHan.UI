const a=`<!-- 折叠侧栏 | 保留侧栏节点并切换宽度 -->
<xh-layout bordered style="display: contents">
  <div data-xh-part="root" style="inline-size: min(640px, 100%); block-size: 240px; border-radius: var(--xh-shape-surface); overflow: hidden">
    <div data-xh-part="header"><button data-xh-part="sider-trigger">菜单</button><strong>控制台</strong></div>
    <div data-xh-part="sider"><div style="display: grid; gap: 12px"><span>概览</span><span>收藏</span><span>回收站</span></div></div>
    <div data-xh-part="content">项目动态</div>
  </div>
</xh-layout>
`;export{a as default};

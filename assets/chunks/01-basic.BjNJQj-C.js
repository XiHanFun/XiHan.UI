const a=`<!-- 基础用法 | 从顶部入口展开站点导航 -->
<div style="inline-size: min(720px, 100%); padding-block-end: 180px">
  <xh-navigation-menu style="display: contents">
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item"><button data-xh-part="trigger" value="products">产品</button><div data-xh-part="content" value="products"><a data-xh-part="link" href="#/products/headless"><span><strong>无头内核</strong><br><span style="color: var(--xh-fg-muted)">框架无关的行为与状态</span></span></a><a data-xh-part="link" href="#/products/adapters"><span><strong>多端适配器</strong><br><span style="color: var(--xh-fg-muted)">Vue、React 与 Web Components</span></span></a></div></li>
        <li data-xh-part="item"><button data-xh-part="trigger" value="docs">文档</button><div data-xh-part="content" value="docs"><a data-xh-part="link" href="#/docs/guide"><span><strong>快速开始</strong><br><span style="color: var(--xh-fg-muted)">安装并创建第一个组件</span></span></a><a data-xh-part="link" href="#/docs/components"><span><strong>组件文档</strong><br><span style="color: var(--xh-fg-muted)">浏览组件与 API</span></span></a></div></li>
        <li data-xh-part="item"><button data-xh-part="trigger" value="resources">资源</button><div data-xh-part="content" value="resources"><a data-xh-part="link" href="#/resources/themes"><span><strong>主题</strong><br><span style="color: var(--xh-fg-muted)">令牌与视觉定制</span></span></a><a data-xh-part="link" href="#/resources/examples"><span><strong>示例</strong><br><span style="color: var(--xh-fg-muted)">常见界面组合</span></span></a></div></li>
        <li data-xh-part="indicator"></li>
      </ul>
    </nav>
  </xh-navigation-menu>
</div>
`;export{a as default};

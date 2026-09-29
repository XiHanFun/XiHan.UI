const a=`<!-- 面板子级 | 面板里的条目再展开一层 -->
<div style="inline-size: min(640px, 100%); padding-block-end: 260px">
  <xh-navigation-menu style="display: contents">
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="products">产品</button>
          <div data-xh-part="content" value="products">
            <a data-xh-part="link" href="#/products">产品概览</a>
            <button data-xh-part="branch-trigger" value="adapters">框架适配器<span data-xh-part="branch-indicator" value="adapters"></span></button>
            <div data-xh-part="branch-content" value="adapters">
              <a data-xh-part="link" href="#/products/vue">Vue</a>
              <a data-xh-part="link" href="#/products/react">React</a>
              <a data-xh-part="link" href="#/products/wc">Web Components</a>
            </div>
            <button data-xh-part="branch-trigger" value="tools">开发工具<span data-xh-part="branch-indicator" value="tools"></span></button>
            <div data-xh-part="branch-content" value="tools">
              <a data-xh-part="link" href="#/products/cli">命令行</a>
              <a data-xh-part="link" href="#/products/figma">设计插件</a>
            </div>
          </div>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="docs">文档</button>
          <div data-xh-part="content" value="docs">
            <a data-xh-part="link" href="#/docs/guide">上手指南</a>
            <a data-xh-part="link" href="#/docs/components">组件文档</a>
          </div>
        </li>
        <li data-xh-part="indicator"></li>
      </ul>
    </nav>
  </xh-navigation-menu>
</div>
`;export{a as default};

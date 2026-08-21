const a=`<!-- 尺寸 | size 一档换掉入口的高度、内边距与字号，写在 root 上、面板里的链接一并跟着变 -->
<!-- 面板是绝对定位的浮层，这里给下方留出它落位的空间 -->
<div
  style="
    inline-size: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 24px;
    padding-block-end: 180px;
  "
>
  <div style="display: grid; gap: 6px">
    <span>sm</span>
    <xh-navigation-menu size="sm" style="display: contents">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <button data-xh-part="trigger" value="products">产品</button>
            <div data-xh-part="content" value="products">
              <a data-xh-part="link" href="#/products/runtime">运行时内核</a>
              <a data-xh-part="link" href="#/products/vue">Vue 适配器</a>
            </div>
          </li>
          <li data-xh-part="item">
            <button data-xh-part="trigger" value="docs">文档</button>
            <div data-xh-part="content" value="docs">
              <a data-xh-part="link" href="#/docs/guide">上手指南</a>
            </div>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-navigation-menu>
  </div>

  <div style="display: grid; gap: 6px">
    <span>缺省</span>
    <xh-navigation-menu style="display: contents">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <button data-xh-part="trigger" value="products">产品</button>
            <div data-xh-part="content" value="products">
              <a data-xh-part="link" href="#/products/runtime">运行时内核</a>
              <a data-xh-part="link" href="#/products/vue">Vue 适配器</a>
            </div>
          </li>
          <li data-xh-part="item">
            <button data-xh-part="trigger" value="docs">文档</button>
            <div data-xh-part="content" value="docs">
              <a data-xh-part="link" href="#/docs/guide">上手指南</a>
            </div>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-navigation-menu>
  </div>

  <div style="display: grid; gap: 6px">
    <span>lg</span>
    <xh-navigation-menu size="lg" style="display: contents">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <button data-xh-part="trigger" value="products">产品</button>
            <div data-xh-part="content" value="products">
              <a data-xh-part="link" href="#/products/runtime">运行时内核</a>
              <a data-xh-part="link" href="#/products/vue">Vue 适配器</a>
            </div>
          </li>
          <li data-xh-part="item">
            <button data-xh-part="trigger" value="docs">文档</button>
            <div data-xh-part="content" value="docs">
              <a data-xh-part="link" href="#/docs/guide">上手指南</a>
            </div>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-navigation-menu>
  </div>
</div>
`;export{a as default};

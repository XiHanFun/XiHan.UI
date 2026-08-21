const a=`<!-- 基础用法 | 面板落在同一个 li 里、紧跟 trigger 之后，展开时按 Tab 就走得进去，里面的条目是链接不是命令，点了就跳走 -->
<!-- 面板是绝对定位的浮层，这里给下方留出它落位的空间 -->
<div style="inline-size: 100%; padding-block-end: 180px">
  <xh-navigation-menu style="display: contents">
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="products">产品</button>
          <div data-xh-part="content" value="products">
            <a data-xh-part="link" href="#/products/runtime">运行时内核</a>
            <a data-xh-part="link" href="#/products/vue">Vue 适配器</a>
            <a data-xh-part="link" href="#/products/wc">Web Components 适配器</a>
          </div>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="docs">文档</button>
          <div data-xh-part="content" value="docs">
            <!-- 指向当前页面的那一条写 current -->
            <a data-xh-part="link" href="#/docs/guide" current>上手指南</a>
            <a data-xh-part="link" href="#/docs/anatomy">部件解剖</a>
          </div>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="about">关于</button>
          <div data-xh-part="content" value="about">
            <a data-xh-part="link" href="#/about/team">团队</a>
          </div>
        </li>
        <li data-xh-part="indicator"></li>
      </ul>
    </nav>
  </xh-navigation-menu>
</div>
`;export{a as default};

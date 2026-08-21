const a=`<!-- 直达入口 | 没有下级的去处不必套面板：那一项直接铺成一条 link，它不进方向键那一组（那一组只认 trigger），按 Tab 一样到得了 -->
<div style="inline-size: 100%; padding-block-end: 150px">
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
            <a data-xh-part="link" href="#/docs/anatomy">部件解剖</a>
          </div>
        </li>
        <li data-xh-part="item">
          <!-- 直达入口：这一项没有 trigger 也没有面板，点了就跳走 -->
          <a data-xh-part="link" href="#/changelog">更新日志</a>
        </li>
        <li data-xh-part="indicator"></li>
      </ul>
    </nav>
  </xh-navigation-menu>
</div>
`;export{a as default};

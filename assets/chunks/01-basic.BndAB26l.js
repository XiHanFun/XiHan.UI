const t=`<!-- 基础用法 | 不传 open 即为非受控；Escape 关闭、Tab 在面板里循环，展开期间页面滚不动 -->
<xh-drawer id="drawer-basic">
  <div data-xh-part="root">
    <button data-xh-part="trigger">打开抽屉</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h2 data-xh-part="title">筛选条件</h2>
        <p data-xh-part="description">面板贴住右边，这是 side 的默认值。</p>
        <xh-button variant="solid">
          <button data-xh-part="root" data-dismiss>应用并关闭</button>
        </xh-button>
        <button data-xh-part="close-trigger"></button>
      </div>
    </div>
  </div>
</xh-drawer>

<script type="module">
  const drawer = document.getElementById("drawer-basic");
  // 文案是对象，只走 property
  drawer.translations = { close: "关闭" };

  // 面板里那颗按钮把关闭转交给已接线的关闭部件
  const close = drawer.querySelector('[data-xh-part="close-trigger"]');
  for (const button of drawer.querySelectorAll("[data-dismiss]")) {
    button.addEventListener("click", () => close.click());
  }
<\/script>
`;export{t as default};

const t=`<!-- 尺寸 | size 落成 content 的 data-size，只改面板贴边方向上的厚度；三档各自一个抽屉，点开才看得出厚薄 -->
<div id="drawer-sizes" style="display: flex; flex-wrap: wrap; gap: 12px">
  <xh-drawer size="sm">
    <div data-xh-part="root">
      <button data-xh-part="trigger">sm 薄</button>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">sm 薄抽屉</h2>
          <p data-xh-part="description">面板贴住右边，三档只有厚度不同。</p>
          <xh-button variant="solid">
            <button data-xh-part="root" data-dismiss>关闭</button>
          </xh-button>
          <button data-xh-part="close-trigger"></button>
        </div>
      </div>
    </div>
  </xh-drawer>

  <!-- 这一档不写 size，落在中档 -->
  <xh-drawer>
    <div data-xh-part="root">
      <button data-xh-part="trigger">缺省</button>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">缺省抽屉</h2>
          <p data-xh-part="description">面板贴住右边，三档只有厚度不同。</p>
          <xh-button variant="solid">
            <button data-xh-part="root" data-dismiss>关闭</button>
          </xh-button>
          <button data-xh-part="close-trigger"></button>
        </div>
      </div>
    </div>
  </xh-drawer>

  <xh-drawer size="lg">
    <div data-xh-part="root">
      <button data-xh-part="trigger">lg 厚</button>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">lg 厚抽屉</h2>
          <p data-xh-part="description">面板贴住右边，三档只有厚度不同。</p>
          <xh-button variant="solid">
            <button data-xh-part="root" data-dismiss>关闭</button>
          </xh-button>
          <button data-xh-part="close-trigger"></button>
        </div>
      </div>
    </div>
  </xh-drawer>
</div>

<script type="module">
  for (const drawer of document.getElementById("drawer-sizes").children) {
    // 文案是对象，只走 property
    drawer.translations = { close: "关闭" };
    // 面板里那颗按钮把关闭转交给已接线的关闭部件
    const close = drawer.querySelector('[data-xh-part="close-trigger"]');
    for (const button of drawer.querySelectorAll("[data-dismiss]")) {
      button.addEventListener("click", () => close.click());
    }
  }
<\/script>
`;export{t as default};

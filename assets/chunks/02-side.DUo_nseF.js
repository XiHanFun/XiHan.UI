const t=`<!-- 贴边方向 | side 只落成 data-side，面板压在哪条边由皮肤按这个值决定；root 与 content 报的是同一条边 -->
<div id="drawer-sides" style="display: flex; flex-wrap: wrap; gap: 12px">
  <xh-drawer side="left">
    <div data-xh-part="root">
      <button data-xh-part="trigger">左侧</button>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">左侧抽屉</h2>
          <p data-xh-part="description">当前 data-side 是 left。</p>
          <button data-xh-part="close-trigger"></button>
        </div>
      </div>
    </div>
  </xh-drawer>

  <xh-drawer side="right">
    <div data-xh-part="root">
      <button data-xh-part="trigger">右侧</button>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">右侧抽屉</h2>
          <p data-xh-part="description">当前 data-side 是 right。</p>
          <button data-xh-part="close-trigger"></button>
        </div>
      </div>
    </div>
  </xh-drawer>

  <xh-drawer side="top">
    <div data-xh-part="root">
      <button data-xh-part="trigger">顶部</button>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">顶部抽屉</h2>
          <p data-xh-part="description">当前 data-side 是 top。</p>
          <button data-xh-part="close-trigger"></button>
        </div>
      </div>
    </div>
  </xh-drawer>

  <xh-drawer side="bottom">
    <div data-xh-part="root">
      <button data-xh-part="trigger">底部</button>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">底部抽屉</h2>
          <p data-xh-part="description">当前 data-side 是 bottom。</p>
          <button data-xh-part="close-trigger"></button>
        </div>
      </div>
    </div>
  </xh-drawer>
</div>

<script type="module">
  // 文案是对象，只走 property
  for (const drawer of document.getElementById("drawer-sides").children) {
    drawer.translations = { close: "关闭" };
  }
<\/script>
`;export{t as default};

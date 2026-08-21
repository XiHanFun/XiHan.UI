const t=`<!-- 受控 | 传了 open 就由宿主说了算；Escape、点面板外、按叉都只回写 open，不自己改状态 -->
<xh-drawer id="drawer-controlled" open="false" side="left">
  <div data-xh-part="root">
    <div style="display: flex; align-items: center; gap: 12px">
      <xh-button id="drawer-controlled-open" variant="solid">
        <button data-xh-part="root">打开左侧抽屉</button>
      </xh-button>
      <span id="drawer-controlled-state">当前：收起</span>
    </div>

    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h2 data-xh-part="title">受控抽屉</h2>
        <p data-xh-part="description">
          这里没有 trigger，开合完全跟着外面那颗按钮与 open 走。
        </p>
        <button data-xh-part="close-trigger">✕</button>
      </div>
    </div>
  </div>
</xh-drawer>

<script type="module">
  const drawer = document.getElementById("drawer-controlled");
  const button = document.getElementById("drawer-controlled-open");
  const state = document.getElementById("drawer-controlled-state");
  // 文案是对象，只走 property
  drawer.translations = { close: "关闭" };

  function setOpen(next) {
    drawer.open = next;
    state.textContent = \`当前：\${next ? "展开" : "收起"}\`;
  }

  button.addEventListener("click", () => setOpen(true));
  drawer.addEventListener("open-change", (event) => setOpen(event.detail.open));
<\/script>
`;export{t as default};

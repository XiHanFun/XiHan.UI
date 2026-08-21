const n=`<!-- 拖边缘改厚度 | 面板里放一根把手，拖动时把新厚度写进 content 的 --xh-drawer-size；这个槽压过 size 三档，滑入滑出仍按面板自身宽度算 -->
<xh-drawer id="drawer-resize">
  <div data-xh-part="root">
    <button data-xh-part="trigger">打开可调宽的抽屉</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div
          id="drawer-resize-handle"
          style="
            position: absolute;
            inset-block: 0;
            inset-inline-start: 0;
            inline-size: 8px;
            cursor: ew-resize;
            touch-action: none;
          "
        ></div>
        <h2 data-xh-part="title">字段设置</h2>
        <p data-xh-part="description">
          拖面板左边缘，厚度在 260 到 560 像素之间取值。
        </p>
        <p id="drawer-resize-readout" style="margin: 0; color: var(--xh-fg-muted)">
          当前厚度：默认
        </p>
        <xh-button variant="solid">
          <button data-xh-part="root" data-dismiss>关闭</button>
        </xh-button>
        <button data-xh-part="close-trigger">✕</button>
      </div>
    </div>
  </div>
</xh-drawer>

<script type="module">
  const MIN = 260;
  const MAX = 560;

  const drawer = document.getElementById("drawer-resize");
  const handle = document.getElementById("drawer-resize-handle");
  const readout = document.getElementById("drawer-resize-readout");
  // 文案是对象，只走 property
  drawer.translations = { close: "关闭" };

  let panel = null;

  handle.addEventListener("pointerdown", (event) => {
    panel = handle.closest('[data-scope="drawer"][data-part="content"]');
    handle.setPointerCapture(event.pointerId);
  });

  handle.addEventListener("pointermove", (event) => {
    if (!panel) {
      return;
    }
    // 面板贴右边，厚度就是视口右缘到指针的距离
    const width = Math.round(
      Math.min(MAX, Math.max(MIN, window.innerWidth - event.clientX)),
    );
    panel.style.setProperty("--xh-drawer-size", \`\${width}px\`);
    readout.textContent = \`当前厚度：\${width} px\`;
  });

  function end(event) {
    if (!panel) {
      return;
    }
    panel = null;
    handle.releasePointerCapture(event.pointerId);
  }

  handle.addEventListener("pointerup", end);
  handle.addEventListener("pointercancel", end);

  // 面板里那颗按钮把关闭转交给已接线的关闭部件
  const close = drawer.querySelector('[data-xh-part="close-trigger"]');
  for (const button of drawer.querySelectorAll("[data-dismiss]")) {
    button.addEventListener("click", () => close.click());
  }
<\/script>
`;export{n as default};

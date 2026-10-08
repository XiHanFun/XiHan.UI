var e=`<!-- 调整厚度 | resizable 在朝向页面的那条边上放一根把手：拖动或用方向键推，厚度夹在 minPanelSize 与 maxPanelSize 之间；受控的 panelSize 读写当前厚度 -->
<xh-drawer id="drawer-resize" resizable min-panel-size="260" max-panel-size="560">
  <div data-xh-part="root">
    <button data-xh-part="trigger">打开可调宽的抽屉</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h2 data-xh-part="title">字段设置</h2>
        <p data-xh-part="description">拖面板左边缘，或聚焦把手后按方向键；Home / End 推到最窄与最宽。</p>
        <p id="drawer-resize-readout" style="margin: 0; color: var(--xh-fg-muted)">当前厚度：默认</p>
        <xh-button variant="solid">
          <button data-xh-part="root" data-dismiss>关闭</button>
        </xh-button>
        <button data-xh-part="close-trigger"></button>
        <div data-xh-part="resize-trigger"></div>
      </div>
    </div>
  </div>
</xh-drawer>

<script type="module">
  // 文案是对象，只能走 property；厚度意图写回 panel-size，回显同步刷新
  const drawer = document.getElementById("drawer-resize");
  drawer.translations = { close: "关闭", resizeTrigger: "调整抽屉宽度" };
  const readout = document.getElementById("drawer-resize-readout");
  const close = drawer.querySelector('[data-xh-part="close-trigger"]');
  drawer.addEventListener("panel-size-change", (event) => {
    drawer.panelSize = event.detail.panelSize;
    readout.textContent = \`当前厚度：\${event.detail.panelSize} px\`;
  });
  for (const button of drawer.querySelectorAll("[data-dismiss]")) {
    button.addEventListener("click", () => close.click());
  }
<\/script>
`;export{e as default};
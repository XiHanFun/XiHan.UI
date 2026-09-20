const n=`<!-- 受控 | 传入 open 后由宿主决定，组件自身不再修改状态；Esc、点击遮罩、按关闭按钮都只回写 open -->
<div style="display: flex; align-items: center; gap: 12px">
  <xh-button variant="solid">
    <button data-xh-part="root" id="dialog-controlled-open">打开</button>
  </xh-button>
  <span>当前：<span id="dialog-controlled-state">收起</span></span>
</div>

<xh-dialog id="dialog-controlled" open="false">
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <h2 data-xh-part="title">受控对话框</h2>
      <p data-xh-part="description">
        这里没有 trigger，开合完全由外面那颗按钮与 open 决定。
      </p>
      <button data-xh-part="close-trigger" aria-label="关闭"></button>
    </div>
  </div>
</xh-dialog>

<script type="module">
  // 开合状态存在宿主这一侧，组件只按 open 显示
  const dialog = document.getElementById("dialog-controlled");
  const opener = document.getElementById("dialog-controlled-open");
  const state = document.getElementById("dialog-controlled-state");

  function render(open) {
    dialog.open = open;
    state.textContent = open ? "展开" : "收起";
  }

  opener.addEventListener("click", () => render(true));
  dialog.addEventListener("open-change", (event) => render(event.detail.open));
<\/script>
`;export{n as default};

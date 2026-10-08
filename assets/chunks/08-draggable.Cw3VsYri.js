var e=`<!-- 可拖动 | draggable 让标题栏成为拖动区，面板始终夹在视口内；标题栏里的拖动把手让键盘也能挪：方向键挪一步，Enter 回到居中 -->
<xh-dialog id="dialog-draggable" panel-draggable>
  <button data-xh-part="trigger">打开可拖动的对话框</button>
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <header data-xh-part="header">
        <button data-xh-part="drag-trigger"></button>
        <h2 data-xh-part="title">拖住标题栏挪窗口</h2>
        <p data-xh-part="description">每次打开都从正中开始；拖出视口的那一截会被夹回来。</p>
      </header>
      <div style="display: flex; justify-content: flex-end">
        <xh-button variant="solid">
          <button data-xh-part="root" data-dismiss>关闭</button>
        </xh-button>
      </div>
      <button data-xh-part="close-trigger"></button>
    </div>
  </div>
</xh-dialog>

<script type="module">
  // 文案是对象，只能走 property；页脚按钮借关闭钮收起
  const dialog = document.getElementById("dialog-draggable");
  dialog.translations = { close: "关闭", dragTrigger: "移动对话框" };
  const close = dialog.querySelector('[data-xh-part="close-trigger"]');
  for (const button of dialog.querySelectorAll("[data-dismiss]")) {
    button.addEventListener("click", () => close.click());
  }
<\/script>
`;export{e as default};
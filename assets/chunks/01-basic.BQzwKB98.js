const n=`<!-- 基础用法 | 整条在 Tab 序列里只占一个位子，条内改用方向键走；条目是作者自己的按钮，工具条不接管它的点击 -->
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <xh-toolbar id="toolbar-basic">
    <div data-xh-part="root">
      <!-- 条目的观感归条目自己，工具条只补焦点环与禁用光标 -->
      <button
        type="button"
        data-xh-part="item"
        value="bold"
        style="
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--xh-border-default);
          background: var(--xh-bg-surface);
        "
      >
        粗体
      </button>
      <button
        type="button"
        data-xh-part="item"
        value="italic"
        style="
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--xh-border-default);
          background: var(--xh-bg-surface);
        "
      >
        斜体
      </button>
      <div data-xh-part="separator"></div>
      <button
        type="button"
        data-xh-part="item"
        value="link"
        style="
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--xh-border-default);
          background: var(--xh-bg-surface);
        "
      >
        插入链接
      </button>
    </div>
  </xh-toolbar>

  <span id="toolbar-basic-log">最近点击：（无）</span>
</div>

<script type="module">
  // 点击归条目自己，工具条不接管
  const toolbar = document.getElementById("toolbar-basic");
  const log = document.getElementById("toolbar-basic-log");
  for (const item of toolbar.querySelectorAll('[data-xh-part="item"]')) {
    item.addEventListener("click", () => {
      log.textContent = \`最近点击：\${item.textContent.trim()}\`;
    });
  }
<\/script>
`;export{n as default};

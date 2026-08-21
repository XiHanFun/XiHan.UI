const n=`<!-- 图标条目 | 只画图标的条目必须自带无障碍名：aria-label 直接写在条目上，透传到那一层 DOM -->
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <xh-toolbar id="toolbar-icon">
    <div data-xh-part="root">
      <!-- 条目的观感归条目自己，工具条只补焦点环与禁用光标 -->
      <button
        type="button"
        data-xh-part="item"
        value="undo"
        aria-label="撤销"
        style="
          display: inline-flex;
          align-items: center;
          padding: 6px;
          border-radius: 6px;
          border: 1px solid var(--xh-border-default);
          background: var(--xh-bg-surface);
          color: inherit;
        "
      >
        <xh-icon size="sm">
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </button>
      <button
        type="button"
        data-xh-part="item"
        value="redo"
        aria-label="重做"
        style="
          display: inline-flex;
          align-items: center;
          padding: 6px;
          border-radius: 6px;
          border: 1px solid var(--xh-border-default);
          background: var(--xh-bg-surface);
          color: inherit;
        "
      >
        <xh-icon size="sm">
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </button>

      <div data-xh-part="separator"></div>

      <div data-xh-part="group">
        <button
          type="button"
          data-xh-part="item"
          value="align-left"
          aria-label="左对齐"
          style="
            display: inline-flex;
            align-items: center;
            padding: 6px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
            color: inherit;
          "
        >
          <xh-icon size="sm">
            <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
          </xh-icon>
        </button>
        <button
          type="button"
          data-xh-part="item"
          value="align-center"
          aria-label="居中"
          style="
            display: inline-flex;
            align-items: center;
            padding: 6px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
            color: inherit;
          "
        >
          <xh-icon size="sm">
            <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
          </xh-icon>
        </button>
        <button
          type="button"
          data-xh-part="item"
          value="align-right"
          aria-label="右对齐"
          style="
            display: inline-flex;
            align-items: center;
            padding: 6px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
            color: inherit;
          "
        >
          <xh-icon size="sm">
            <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
          </xh-icon>
        </button>
      </div>
    </div>
  </xh-toolbar>

  <span id="toolbar-icon-log">最近点击：（无）</span>
</div>

<script type="module">
  // 描边取 currentColor，图标颜色随条目文字色走
  const strokeAttrs = {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  };

  // 图标记录是对象，只走 property；键与条目的 value 一一对应
  const icons = {
    "undo": {
      name: "undo",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [
        { tag: "path", attrs: { d: "M4 10H15A5 5 0 0 1 15 20H10" } },
        { tag: "path", attrs: { d: "M8 6L4 10L8 14" } },
      ],
    },
    "redo": {
      name: "redo",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [
        { tag: "path", attrs: { d: "M20 10H9A5 5 0 0 0 9 20H14" } },
        { tag: "path", attrs: { d: "M16 6L20 10L16 14" } },
      ],
    },
    "align-left": {
      name: "align-left",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [{ tag: "path", attrs: { d: "M4 6H20M4 12H14M4 18H18" } }],
    },
    "align-center": {
      name: "align-center",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [{ tag: "path", attrs: { d: "M4 6H20M7 12H17M5 18H19" } }],
    },
    "align-right": {
      name: "align-right",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [{ tag: "path", attrs: { d: "M4 6H20M10 12H20M6 18H20" } }],
    },
  };

  const toolbar = document.getElementById("toolbar-icon");
  const log = document.getElementById("toolbar-icon-log");
  for (const item of toolbar.querySelectorAll('[data-xh-part="item"]')) {
    const name = item.getAttribute("value");
    item.querySelector("xh-icon").icon = icons[name];
    item.addEventListener("click", () => {
      log.textContent = \`最近点击：\${item.getAttribute("aria-label")}\`;
    });
  }
<\/script>
`;export{n as default};

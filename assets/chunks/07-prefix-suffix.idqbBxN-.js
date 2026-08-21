const n=`<!-- 前缀与行尾 | 行里放什么由标记说了算：文字前塞图标、文字后塞操作，方向指示也可以挪到行尾去 -->
<div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
  <xh-tree id="tree-prefix-suffix">
    <div data-xh-part="root">
      <span data-xh-part="label">工作区</span>
      <div data-xh-part="tree">
        <div data-xh-part="branch" value="src">
          <div data-xh-part="branch-control">
            <span aria-hidden="true">📁</span>
            <span data-xh-part="branch-text">src</span>
            <!-- 指示器不带点击语义，展开态转 90° 全靠皮肤读 data-state -->
            <span data-xh-part="branch-indicator">›</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="index">
              <span aria-hidden="true">📄</span>
              <span data-xh-part="item-text">index.ts</span>
              <button type="button" data-rename="index.ts">重命名</button>
            </div>
            <div data-xh-part="item" value="app">
              <span aria-hidden="true">📄</span>
              <span data-xh-part="item-text">app.vue</span>
              <button type="button" data-rename="app.vue">重命名</button>
            </div>
          </div>
        </div>

        <div data-xh-part="branch" value="docs">
          <div data-xh-part="branch-control">
            <span aria-hidden="true">📁</span>
            <span data-xh-part="branch-text">docs</span>
            <span data-xh-part="branch-indicator">›</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="guide">
              <span aria-hidden="true">📄</span>
              <span data-xh-part="item-text">guide.md</span>
              <button type="button" data-rename="guide.md">重命名</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree>
  <span id="tree-prefix-suffix-log">（还没动过）</span>
</div>

<script type="module">
  const tree = document.getElementById("tree-prefix-suffix");
  const log = document.getElementById("tree-prefix-suffix-log");

  tree.collection = [
    {
      value: "src",
      label: "src",
      children: [
        { value: "index", label: "index.ts" },
        { value: "app", label: "app.vue" },
      ],
    },
    {
      value: "docs",
      label: "docs",
      children: [{ value: "guide", label: "guide.md" }],
    },
  ];

  tree.expandedValue = ["src"];
  tree.addEventListener(
    "expanded-change",
    (event) => (tree.expandedValue = event.detail.value),
  );

  for (const button of tree.querySelectorAll("[data-rename]")) {
    button.addEventListener("click", (event) => {
      // 掐断冒泡，否则点按钮连带把这一行也选上
      event.stopPropagation();
      log.textContent = \`重命名 \${button.dataset.rename}\`;
    });
  }
<\/script>
`;export{n as default};

const n=`<!-- 前缀与行尾 | 行中放置什么由标记决定：文字前放图标、文字后放操作，方向指示也可以移到行尾 -->
<div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
  <xh-tree id="tree-prefix-suffix">
    <div data-xh-part="root">
      <span data-xh-part="label">工作区</span>
      <div data-xh-part="tree">
        <div data-xh-part="branch" value="src">
          <div data-xh-part="branch-control">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="inline-size: var(--xh-icon-size); block-size: var(--xh-icon-size)"><path d="M21.5 18.5a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h4.5l2 3h8.5a2 2 0 0 1 2 2Z"/></svg>
            <span data-xh-part="branch-text">src</span>
            <!-- 指示器不带点击语义，展开态转 90° 全靠皮肤读 data-state -->
            <span data-xh-part="branch-indicator"></span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="index">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="inline-size: var(--xh-icon-size); block-size: var(--xh-icon-size)"><path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8Z"/><path d="M14 2.5V6a2 2 0 0 0 2 2h3.5"/></svg>
              <span data-xh-part="item-text">index.ts</span>
              <button type="button" data-rename="index.ts">重命名</button>
            </div>
            <div data-xh-part="item" value="app">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="inline-size: var(--xh-icon-size); block-size: var(--xh-icon-size)"><path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8Z"/><path d="M14 2.5V6a2 2 0 0 0 2 2h3.5"/></svg>
              <span data-xh-part="item-text">app.vue</span>
              <button type="button" data-rename="app.vue">重命名</button>
            </div>
          </div>
        </div>

        <div data-xh-part="branch" value="docs">
          <div data-xh-part="branch-control">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="inline-size: var(--xh-icon-size); block-size: var(--xh-icon-size)"><path d="M21.5 18.5a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h4.5l2 3h8.5a2 2 0 0 1 2 2Z"/></svg>
            <span data-xh-part="branch-text">docs</span>
            <span data-xh-part="branch-indicator"></span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="guide">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="inline-size: var(--xh-icon-size); block-size: var(--xh-icon-size)"><path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8Z"/><path d="M14 2.5V6a2 2 0 0 0 2 2h3.5"/></svg>
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
    "expanded-value-change",
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

const a=`<!-- 只让叶子进选中集合 | 选中受控就由宿主定夺：分支的值直接不写回，点目录只剩展开收起这一个效果 -->
<div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
  <xh-tree id="tree-leaf-only" selection-mode="multiple">
    <div data-xh-part="root">
      <span data-xh-part="label">要提交的文件</span>
      <div data-xh-part="tree">
        <div data-xh-part="branch" value="src">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger">▸</span>
            <span data-xh-part="branch-text">src</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="index">
              <span data-xh-part="item-indicator">✓</span>
              <span data-xh-part="item-text">index.ts</span>
            </div>
            <div data-xh-part="item" value="app">
              <span data-xh-part="item-indicator">✓</span>
              <span data-xh-part="item-text">app.vue</span>
            </div>
          </div>
        </div>

        <div data-xh-part="branch" value="docs">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger">▸</span>
            <span data-xh-part="branch-text">docs</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="guide">
              <span data-xh-part="item-indicator">✓</span>
              <span data-xh-part="item-text">guide.md</span>
            </div>
            <div data-xh-part="item" value="api">
              <span data-xh-part="item-indicator">✓</span>
              <span data-xh-part="item-text">api.md</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree>
  <span>已选：<span id="tree-leaf-only-value">（无）</span></span>
</div>

<script type="module">
  const tree = document.getElementById("tree-leaf-only");
  const readout = document.getElementById("tree-leaf-only-value");

  const collection = [
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
      children: [
        { value: "guide", label: "guide.md" },
        { value: "api", label: "api.md" },
      ],
    },
  ];
  tree.collection = collection;

  tree.expandedValue = ["src"];
  tree.addEventListener(
    "expanded-change",
    (event) => (tree.expandedValue = event.detail.value),
  );

  const leaves = new Set(
    collection.flatMap((dir) => dir.children.map((file) => file.value)),
  );

  // 分支的值在写回时滤掉，选中集合里只留叶子
  tree.selectedValue = [];
  tree.addEventListener("selection-change", (event) => {
    const value = event.detail.value.filter((one) => leaves.has(one));
    tree.selectedValue = value;
    readout.textContent = value.join("、") || "（无）";
  });
<\/script>
`;export{a as default};

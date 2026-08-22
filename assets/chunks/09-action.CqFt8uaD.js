const e=`<!-- 浮层里的操作区 | content 里除了树还能放别的：在浮层内点按钮不算点在外面，浮层不会因此收起 -->
<xh-tree-select id="tree-select-action" placeholder="选一个文件">
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">文档</span>
    <button data-xh-part="trigger">
      <span data-xh-part="value-text"></span>
      <span data-xh-part="indicator"></span>
    </button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="tree">
          <div data-xh-part="branch" value="docs">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">docs</span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="guide">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">guide.md</span>
              </div>
              <div data-xh-part="item" value="api">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">api.md</span>
              </div>
            </div>
          </div>
          <div data-xh-part="branch" value="assets">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">assets</span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="logo">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">logo.svg</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 浮层内的按钮直接改选中集合与展开集合 -->
        <div style="display: flex; gap: 8px; padding: 8px 4px 4px">
          <button type="button" id="tree-select-action-expand">全部展开</button>
          <button type="button" id="tree-select-action-collapse">全部收起</button>
          <button type="button" id="tree-select-action-clear" disabled>清空</button>
        </div>
      </div>
    </div>
  </div>
</xh-tree-select>

<script type="module">
  const treeSelect = document.getElementById("tree-select-action");
  treeSelect.collection = [
    {
      value: "docs",
      label: "docs",
      children: [
        { value: "guide", label: "guide.md" },
        { value: "api", label: "api.md" },
      ],
    },
    {
      value: "assets",
      label: "assets",
      children: [{ value: "logo", label: "logo.svg" }],
    },
  ];
  treeSelect.value = [];
  treeSelect.expandedValue = ["docs"];

  const clear = document.getElementById("tree-select-action-clear");

  function setValue(next) {
    treeSelect.value = next;
    clear.disabled = next.length === 0;
  }

  treeSelect.addEventListener("value-change", (event) => setValue(event.detail.value));
  treeSelect.addEventListener(
    "expanded-change",
    (event) => (treeSelect.expandedValue = event.detail.value),
  );

  document
    .getElementById("tree-select-action-expand")
    .addEventListener("click", () => (treeSelect.expandedValue = ["docs", "assets"]));
  document
    .getElementById("tree-select-action-collapse")
    .addEventListener("click", () => (treeSelect.expandedValue = []));
  clear.addEventListener("click", () => setValue([]));
<\/script>
`;export{e as default};

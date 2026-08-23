const a=`<!-- 基础用法 | 收起时整个控件只占触发器一个 Tab 位，展开那一刻焦点真的进树、落在已选中的那行上 -->
<xh-tree-select id="tree-select-basic" placeholder="选一个文件">
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">文档</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
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
          <div data-xh-part="item" value="readme">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">README.md</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-tree-select>
<p>已选：<span id="tree-select-basic-value">（无）</span></p>

<script type="module">
  // 层级、显示文本与节点禁用都查这份树数据，标记只管长相
  const treeSelect = document.getElementById("tree-select-basic");
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
    { value: "readme", label: "README.md" },
  ];

  // 展开集合是数组，只走属性；这里由宿主持有，组件发的事件宿主写回才算数
  treeSelect.expandedValue = ["docs"];
  treeSelect.addEventListener(
    "expanded-change",
    (event) => (treeSelect.expandedValue = event.detail.value),
  );

  const readout = document.getElementById("tree-select-basic-value");
  treeSelect.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
<\/script>
`;export{a as default};

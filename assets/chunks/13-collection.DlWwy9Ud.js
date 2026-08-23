const a=`<!-- 只交数据自动渲染 | Vue 不写默认插槽时按 collection 铺开整套部件：带 children 的节点落成 branch、其余落成 item，文本与禁用都查数据；label 给标题，clearable 带上清空钮（手写部件不看它），产出的 DOM 与手写全套部件完全一致；Web Components 没有自动铺树，节点部件照常手写、只报 value -->
<xh-tree-select
  id="tree-select-collection"
  default-value="guide"
  placeholder="选一个文件"
>
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">文档</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
      <button data-xh-part="clear-trigger"></button>
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
<p>已选：<span id="tree-select-collection-value">guide</span></p>

<script type="module">
  // 层级、显示文本与节点禁用都查这份树数据，标记只管长相
  const treeSelect = document.getElementById("tree-select-collection");
  treeSelect.collection = [
    {
      value: "docs",
      label: "docs",
      children: [
        { value: "guide", label: "guide.md" },
        { value: "api", label: "api.md", disabled: true },
      ],
    },
    {
      value: "assets",
      label: "assets",
      children: [{ value: "logo", label: "logo.svg" }],
    },
    { value: "readme", label: "README.md" },
  ];
  treeSelect.translations = { clearTrigger: "清空所选" };

  // 展开集合是数组，只走属性；这里由宿主持有，组件发的事件宿主写回才算数
  treeSelect.expandedValue = ["docs"];
  treeSelect.addEventListener(
    "expanded-change",
    (event) => (treeSelect.expandedValue = event.detail.value),
  );

  const readout = document.getElementById("tree-select-collection-value");
  treeSelect.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
<\/script>
`;export{a as default};

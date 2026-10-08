var e=`<!-- 多选与表单 | multiple 下已选项在触发器里排成标签，确认键是切换、浮层不收起；写了 hidden-input 才随表单提交，每个值一个同名字段 -->
<xh-tree-select
  id="tree-select-multiple"
  value="index"
  multiple
  name="docs"
  placeholder="可以多选"
>
  <div data-xh-part="root">
    <span data-xh-part="label">提交范围</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <!-- 标签行：可见的几枚由脚本按 tags 渲染，+N 那一枚常挂、由元素填字；触发器里的标签只作展示 -->
        <span data-xh-part="tag-list">
          <span data-xh-part="overflow-tag"></span>
        </span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="tree">
          <div data-xh-part="branch" value="src">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">src</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="index">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">index.ts</span>
              </div>
              <div data-xh-part="item" value="app">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">app.vue</span>
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
    <input data-xh-part="hidden-input" />
  </div>
</xh-tree-select>
<p>已选：<span id="tree-select-multiple-value">index</span></p>

<script type="module">
  const treeSelect = document.getElementById("tree-select-multiple");
  treeSelect.collection = [
    {
      value: "src",
      label: "src",
      children: [
        { value: "index", label: "index.ts" },
        { value: "app", label: "app.vue" },
      ],
    },
    { value: "readme", label: "README.md" },
  ];
  treeSelect.expandedValue = ["src"];
  treeSelect.addEventListener(
    "expanded-value-change",
    (event) => (treeSelect.expandedValue = event.detail.value),
  );

  const readout = document.getElementById("tree-select-multiple-value");
  const overflow = treeSelect.querySelector('[data-xh-part="overflow-tag"]');

  // 摆得下几枚由组件按 max-tag-count 算好：按值复用已有的节点，只增删变了的那几枚
  function renderTags() {
    const current = new Map(
      [...treeSelect.querySelectorAll('[data-xh-part="tag-list"] > [data-xh-part="tag"]')].map((el) => [el.getAttribute("value"), el]),
    );
    const next = treeSelect.tags.map((tag) => {
      if (current.has(tag.value))
        return current.get(tag.value);
      const el = document.createElement("span");
      el.setAttribute("data-xh-part", "tag");
      el.setAttribute("value", tag.value);
      el.textContent = tag.label;
      return el;
    });
    for (const el of current.values()) {
      if (!next.includes(el))
        el.remove();
    }
    overflow.before(...next);
  }

  // 受控：写回选中值，等元素把这一轮更新落定再按 tags 重排标签
  treeSelect.addEventListener("value-change", async (event) => {
    treeSelect.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
    await treeSelect.updateComplete;
    renderTags();
  });
  treeSelect.updateComplete.then(renderTags);
<\/script>
`;export{e as default};
const e=`<!-- 多选与表单 | multiple 下确认键是切换、浮层不收起；写了 hidden-input 才随表单提交，多个值按逗号拼成一串 -->
<xh-tree-select
  id="tree-select-multiple"
  value="index"
  multiple
  name="docs"
  placeholder="可以多选"
>
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">提交范围</span>
    <button data-xh-part="trigger">
      <span data-xh-part="value-text"></span>
      <span data-xh-part="indicator"></span>
    </button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="tree">
          <div data-xh-part="branch" value="src">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">src</span>
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
    "expanded-change",
    (event) => (treeSelect.expandedValue = event.detail.value),
  );

  const readout = document.getElementById("tree-select-multiple-value");
  treeSelect.addEventListener("value-change", (event) => {
    treeSelect.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
<\/script>
`;export{e as default};

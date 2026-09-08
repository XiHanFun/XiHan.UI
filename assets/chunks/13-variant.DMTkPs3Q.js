const a=`<!-- 形态 | variant="plain" 去掉外框与底色，树直接落在页面上；缺省 surface 保持带框的样子 -->
<div style="display: grid; gap: 16px; inline-size: 100%; max-inline-size: 320px">
  <xh-tree id="tree-variant-surface" variant="surface">
    <div data-xh-part="root">
      <div data-xh-part="tree">
        <div data-xh-part="branch" value="src">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-text">src</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="main">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">main.ts</span>
            </div>
            <div data-xh-part="item" value="app">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">App.vue</span>
            </div>
          </div>
        </div>
        <div data-xh-part="item" value="readme">
          <span data-xh-part="item-indicator"></span>
          <span data-xh-part="item-text">README.md</span>
        </div>
      </div>
    </div>
  </xh-tree>

  <xh-tree id="tree-variant-plain" variant="plain">
    <div data-xh-part="root">
      <div data-xh-part="tree">
        <div data-xh-part="branch" value="src">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-text">src</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="main">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">main.ts</span>
            </div>
            <div data-xh-part="item" value="app">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">App.vue</span>
            </div>
          </div>
        </div>
        <div data-xh-part="item" value="readme">
          <span data-xh-part="item-indicator"></span>
          <span data-xh-part="item-text">README.md</span>
        </div>
      </div>
    </div>
  </xh-tree>
</div>

<script type="module">
  const collection = [
    {
      value: "src",
      label: "src",
      children: [
        { value: "main", label: "main.ts" },
        { value: "app", label: "App.vue" },
      ],
    },
    { value: "readme", label: "README.md" },
  ];

  // 数据与展开集合都是数组，只走属性
  for (const id of ["tree-variant-surface", "tree-variant-plain"]) {
    const tree = document.getElementById(id);
    tree.collection = collection;
    tree.expandedValue = ["src"];
    tree.addEventListener(
      "expanded-value-change",
      (event) => (tree.expandedValue = event.detail.value),
    );
  }
<\/script>
`;export{a as default};

const a=`<!-- 尺寸 | size 写到 root 的 data-size：行高、字号、展开箭头与对号盒、层级缩进一起随档；三档并排，缺省即 md -->
<div id="tree-size" style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start">
  <xh-tree size="sm" style="flex: 1 1 180px; min-width: 180px">
    <div data-xh-part="root">
      <span data-xh-part="label">sm</span>
      <div data-xh-part="tree">
        <div data-xh-part="branch" value="src">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-text">src</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="main">
              <span data-xh-part="item-text">main.ts</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="app">
              <span data-xh-part="item-text">App.vue</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
        <div data-xh-part="item" value="readme">
          <span data-xh-part="item-text">README.md</span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
    </div>
  </xh-tree>

  <!-- 中间档不写 size，缺省即 md -->
  <xh-tree style="flex: 1 1 180px; min-width: 180px">
    <div data-xh-part="root">
      <span data-xh-part="label">缺省（md）</span>
      <div data-xh-part="tree">
        <div data-xh-part="branch" value="src">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-text">src</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="main">
              <span data-xh-part="item-text">main.ts</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="app">
              <span data-xh-part="item-text">App.vue</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
        <div data-xh-part="item" value="readme">
          <span data-xh-part="item-text">README.md</span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
    </div>
  </xh-tree>

  <xh-tree size="lg" style="flex: 1 1 180px; min-width: 180px">
    <div data-xh-part="root">
      <span data-xh-part="label">lg</span>
      <div data-xh-part="tree">
        <div data-xh-part="branch" value="src">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-text">src</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="main">
              <span data-xh-part="item-text">main.ts</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="app">
              <span data-xh-part="item-text">App.vue</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
        <div data-xh-part="item" value="readme">
          <span data-xh-part="item-text">README.md</span>
          <span data-xh-part="item-indicator"></span>
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

  // 数据、展开与选中集合都是数组，只走属性
  for (const tree of document.querySelectorAll("#tree-size xh-tree")) {
    tree.collection = collection;
    tree.defaultExpandedValue = ["src"];
    tree.defaultSelection = ["main"];
  }
<\/script>
`;export{a as default};

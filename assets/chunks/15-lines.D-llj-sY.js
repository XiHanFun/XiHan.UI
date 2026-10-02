const a=`<!-- 连接线 | lines 从父节点的展开箭头引出竖线，每个子节点横出一段接到行首、最后一个子节点拐成直角收住，层级深的时候一眼看得出谁挂在谁下面；只是外观，不改结构与键盘 -->
<xh-tree lines id="tree-lines">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 320px">
    <span data-xh-part="label">项目文件</span>
    <div data-xh-part="tree">
      <div data-xh-part="branch" value="src">
        <div data-xh-part="branch-control">
          <span data-xh-part="branch-trigger"></span>
          <span data-xh-part="branch-text">src</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="branch-content">
          <div data-xh-part="branch" value="components">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">components</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="button">
                <span data-xh-part="item-text">Button.vue</span>
                <span data-xh-part="item-indicator"></span>
              </div>
              <div data-xh-part="item" value="dialog">
                <span data-xh-part="item-text">Dialog.vue</span>
                <span data-xh-part="item-indicator"></span>
              </div>
            </div>
          </div>
          <div data-xh-part="item" value="main">
            <span data-xh-part="item-text">main.ts</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>

      <div data-xh-part="branch" value="docs">
        <div data-xh-part="branch-control">
          <span data-xh-part="branch-trigger"></span>
          <span data-xh-part="branch-text">docs</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="branch-content">
          <div data-xh-part="item" value="guide">
            <span data-xh-part="item-text">guide.md</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="api">
            <span data-xh-part="item-text">api.md</span>
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

<script type="module">
  // 层级、显示文本与节点禁用都查这份树数据，标记只管长相
  const tree = document.getElementById("tree-lines");
  tree.collection = [
    {
      value: "src",
      label: "src",
      children: [
        {
          value: "components",
          label: "components",
          children: [
            { value: "button", label: "Button.vue" },
            { value: "dialog", label: "Dialog.vue" },
          ],
        },
        { value: "main", label: "main.ts" },
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
    { value: "readme", label: "README.md" },
  ];

  // 展开集合是数组，只走属性；这里由宿主持有，组件发的事件宿主写回才算数
  tree.expandedValue = ["src", "components", "docs"];
  tree.addEventListener(
    "expanded-value-change",
    (event) => (tree.expandedValue = event.detail.value),
  );
<\/script>
`;export{a as default};

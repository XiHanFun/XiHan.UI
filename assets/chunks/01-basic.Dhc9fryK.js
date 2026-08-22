const a=`<!-- 基础用法 | collection 是层级元信息的唯一事实源，标记只管长相；缩进由子层容器自己顶着 -->
<xh-tree id="tree-basic">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 320px">
    <span data-xh-part="label">项目文件</span>
    <div data-xh-part="tree">
      <div data-xh-part="branch" value="src">
        <div data-xh-part="branch-control">
          <span data-xh-part="branch-trigger"></span>
          <span data-xh-part="branch-text">src</span>
        </div>
        <div data-xh-part="branch-content">
          <div data-xh-part="branch" value="components">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">components</span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="button">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">Button.vue</span>
              </div>
              <div data-xh-part="item" value="dialog">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">Dialog.vue</span>
              </div>
            </div>
          </div>
          <div data-xh-part="item" value="main">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">main.ts</span>
          </div>
        </div>
      </div>

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

      <div data-xh-part="item" value="readme">
        <span data-xh-part="item-indicator"></span>
        <span data-xh-part="item-text">README.md</span>
      </div>
    </div>
  </div>
</xh-tree>

<script type="module">
  // 层级、显示文本与节点禁用都查这份树数据，标记只管长相
  const tree = document.getElementById("tree-basic");
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
  tree.expandedValue = ["src"];
  tree.addEventListener(
    "expanded-change",
    (event) => (tree.expandedValue = event.detail.value),
  );
<\/script>
`;export{a as default};

var e=`<!-- 异步加载子节点 | 展开时才请求数据：请求在途的分支写进 loadingValue，展开箭头换成转圈并报告 aria-busy；取回后写回 collection 并移出，收起再展开不重复请求 -->
<xh-tree id="tree-async">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 320px">
    <span data-xh-part="label">组织架构</span>
    <div data-xh-part="tree">
      <div data-xh-part="branch" value="rd">
        <div data-xh-part="branch-control">
          <span data-xh-part="branch-trigger"></span>
          <span data-xh-part="branch-text">研发中心</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="branch-content"></div>
      </div>
      <div data-xh-part="branch" value="ops">
        <div data-xh-part="branch-control">
          <span data-xh-part="branch-trigger"></span>
          <span data-xh-part="branch-text">运维中心</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="branch-content"></div>
      </div>
      <div data-xh-part="branch" value="biz">
        <div data-xh-part="branch-control">
          <span data-xh-part="branch-trigger"></span>
          <span data-xh-part="branch-text">业务中心</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="branch-content"></div>
      </div>
      <div data-xh-part="item" value="board">
        <span data-xh-part="item-text">董事办</span>
        <span data-xh-part="item-indicator"></span>
      </div>
    </div>
  </div>
</xh-tree>

<script type="module">
  const tree = document.getElementById("tree-async");

  // 空数组也是分支：还没取回子项的部门照样报告 aria-expanded；没有 children 的是叶子，不用取
  const collection = [
    { value: "rd", label: "研发中心", children: [] },
    { value: "ops", label: "运维中心", children: [] },
    { value: "biz", label: "业务中心", children: [] },
    { value: "board", label: "董事办" },
  ];
  tree.collection = collection;

  const staff = {
    rd: ["赵一", "钱二"],
    ops: ["孙三"],
    biz: ["李四", "周五", "吴六"],
  };

  // 这一支的子层标记照当下的树数据重铺
  function renderChildren(node) {
    const content = tree.querySelector(
      \`[data-xh-part="branch"][value="\${node.value}"] > [data-xh-part="branch-content"]\`,
    );
    content.replaceChildren(
      ...node.children.map((child) => {
        const item = document.createElement("div");
        item.dataset.xhPart = "item";
        item.setAttribute("value", child.value);
        const text = document.createElement("span");
        text.dataset.xhPart = "item-text";
        text.textContent = child.label;
        const mark = document.createElement("span");
        mark.dataset.xhPart = "item-indicator";
        item.append(text, mark);
        return item;
      }),
    );
  }

  const loaded = new Set();
  let loading = [];

  // 这里用定时器代替一次请求
  function fetchChildren(value) {
    if (loaded.has(value)) return;
    loaded.add(value);
    loading = [...loading, value];
    tree.loadingValue = loading;
    setTimeout(() => {
      const branch = collection.find((node) => node.value === value);
      branch.children = staff[value].map((name, index) => ({
        value: \`\${value}-\${index}\`,
        label: name,
      }));
      renderChildren(branch);
      tree.collection = [...collection];
      loading = loading.filter((item) => item !== value);
      tree.loadingValue = loading;
    }, 800);
  }

  tree.expandedValue = [];
  tree.addEventListener("expanded-value-change", (event) => {
    tree.expandedValue = event.detail.value;
    for (const value of event.detail.value) fetchChildren(value);
  });
<\/script>
`;export{e as default};
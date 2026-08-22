const n=`<!-- 异步加载子节点 | 展开那一刻才去要数据：先摆一行禁用的占位，取回来就地换掉，收起再展开不重复请求 -->
<xh-tree id="tree-async">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 320px">
    <span data-xh-part="label">组织架构</span>
    <div data-xh-part="tree">
      <div data-xh-part="branch" value="rd">
        <div data-xh-part="branch-control">
          <span data-xh-part="branch-trigger"></span>
          <span data-xh-part="branch-text">研发中心</span>
        </div>
        <div data-xh-part="branch-content">
          <div data-xh-part="item" value="rd-pending">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">加载中…</span>
          </div>
        </div>
      </div>
      <div data-xh-part="branch" value="ops">
        <div data-xh-part="branch-control">
          <span data-xh-part="branch-trigger"></span>
          <span data-xh-part="branch-text">运维中心</span>
        </div>
        <div data-xh-part="branch-content">
          <div data-xh-part="item" value="ops-pending">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">加载中…</span>
          </div>
        </div>
      </div>
      <div data-xh-part="branch" value="biz">
        <div data-xh-part="branch-control">
          <span data-xh-part="branch-trigger"></span>
          <span data-xh-part="branch-text">业务中心</span>
        </div>
        <div data-xh-part="branch-content">
          <div data-xh-part="item" value="biz-pending">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">加载中…</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-tree>

<script type="module">
  const tree = document.getElementById("tree-async");

  // 占位行也是一个真节点：它得在 collection 里，方向键才走得到它
  const pending = (owner) => [
    { value: \`\${owner}-pending\`, label: "加载中…", disabled: true },
  ];

  const collection = [
    { value: "rd", label: "研发中心", children: pending("rd") },
    { value: "ops", label: "运维中心", children: pending("ops") },
    { value: "biz", label: "业务中心", children: pending("biz") },
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
        const mark = document.createElement("span");
        mark.dataset.xhPart = "item-indicator";
        const text = document.createElement("span");
        text.dataset.xhPart = "item-text";
        text.textContent = child.label;
        item.append(mark, text);
        return item;
      }),
    );
  }

  const loaded = new Set();

  // 这里用定时器代替一次请求
  function fetchChildren(value) {
    if (loaded.has(value)) return;
    loaded.add(value);
    setTimeout(() => {
      const branch = collection.find((node) => node.value === value);
      branch.children = staff[value].map((name, index) => ({
        value: \`\${value}-\${index}\`,
        label: name,
      }));
      renderChildren(branch);
      tree.collection = [...collection];
    }, 800);
  }

  tree.expandedValue = [];
  tree.addEventListener("expanded-change", (event) => {
    tree.expandedValue = event.detail.value;
    for (const value of event.detail.value) fetchChildren(value);
  });
<\/script>
`;export{n as default};

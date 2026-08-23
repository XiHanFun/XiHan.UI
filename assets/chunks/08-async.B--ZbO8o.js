const n=`<!-- 异步加载子节点 | 展开某个分支才去要它的子节点：先摆一行禁用占位，数据回来就地换掉，显示文本随之取到新 label -->
<xh-tree-select id="tree-select-async" placeholder="选一个城市">
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">投放城市</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="tree">
          <div data-xh-part="branch" value="east">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">华东</span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="east-pending">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">加载中…</span>
              </div>
            </div>
          </div>
          <div data-xh-part="branch" value="north">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">华北</span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="north-pending">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">加载中…</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-tree-select>
<p>已选：<span id="tree-select-async-value">（无）</span></p>

<script type="module">
  const treeSelect = document.getElementById("tree-select-async");

  // 占位行也是一个真节点：它得在树数据里，方向键才走得到它
  const pending = (owner) => [{ value: \`\${owner}-pending\`, label: "加载中…", disabled: true }];

  const collection = [
    { value: "east", label: "华东", children: pending("east") },
    { value: "north", label: "华北", children: pending("north") },
  ];
  const cities = { east: ["上海", "杭州", "南京"], north: ["北京", "天津"] };

  treeSelect.collection = collection;
  treeSelect.expandedValue = [];

  // 数据回来后就地换掉那一枝的标记，节点身份写在 value 属性上
  function renderBranch(value) {
    const branch = treeSelect.querySelector(\`[data-xh-part="branch"][value="\${value}"]\`);
    const content = branch.querySelector('[data-xh-part="branch-content"]');
    const rows = collection.find((node) => node.value === value).children;
    content.replaceChildren(
      ...rows.map((row) => {
        const item = document.createElement("div");
        item.dataset.xhPart = "item";
        item.setAttribute("value", row.value);
        const indicator = document.createElement("span");
        indicator.dataset.xhPart = "item-indicator";
        const text = document.createElement("span");
        text.dataset.xhPart = "item-text";
        text.textContent = row.label;
        item.append(indicator, text);
        return item;
      }),
    );
  }

  const loaded = new Set();

  function fetchChildren(value) {
    if (loaded.has(value)) return;
    loaded.add(value);
    setTimeout(() => {
      const branch = collection.find((node) => node.value === value);
      branch.children = cities[value].map((name, index) => ({
        value: \`\${value}-\${index}\`,
        label: name,
      }));
      treeSelect.collection = [...collection];
      renderBranch(value);
    }, 800);
  }

  treeSelect.addEventListener("expanded-change", (event) => {
    treeSelect.expandedValue = event.detail.value;
    for (const value of event.detail.value) fetchChildren(value);
  });

  const readout = document.getElementById("tree-select-async-value");
  treeSelect.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
<\/script>
`;export{n as default};

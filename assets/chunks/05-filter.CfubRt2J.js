const n=`<!-- 关键词过滤 | collection 换一份树就换一棵：标记跟着数据重铺，过滤剩下的分支顺手全展开 -->
<div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
  <input
    id="tree-filter-keyword"
    type="search"
    aria-label="城市关键词"
    placeholder="输入城市名"
  />

  <xh-tree id="tree-filter">
    <div data-xh-part="root">
      <span data-xh-part="label">投放城市</span>
      <div data-xh-part="tree">
        <div data-xh-part="branch" value="east">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-text">华东</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="sh">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">上海</span>
            </div>
            <div data-xh-part="item" value="hz">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">杭州</span>
            </div>
            <div data-xh-part="item" value="nj">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">南京</span>
            </div>
          </div>
        </div>
        <div data-xh-part="branch" value="north">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-text">华北</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="bj">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">北京</span>
            </div>
            <div data-xh-part="item" value="tj">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">天津</span>
            </div>
          </div>
        </div>
        <div data-xh-part="branch" value="south">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-text">华南</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="gz">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">广州</span>
            </div>
            <div data-xh-part="item" value="sz">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">深圳</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree>

  <span id="tree-filter-empty" style="display: none"></span>
</div>

<script type="module">
  const host = document.getElementById("tree-filter");
  const keyword = document.getElementById("tree-filter-keyword");
  const empty = document.getElementById("tree-filter-empty");
  const tree = host.querySelector('[data-xh-part="tree"]');

  const source = [
    {
      value: "east",
      label: "华东",
      children: [
        { value: "sh", label: "上海" },
        { value: "hz", label: "杭州" },
        { value: "nj", label: "南京" },
      ],
    },
    {
      value: "north",
      label: "华北",
      children: [
        { value: "bj", label: "北京" },
        { value: "tj", label: "天津" },
      ],
    },
    {
      value: "south",
      label: "华南",
      children: [
        { value: "gz", label: "广州" },
        { value: "sz", label: "深圳" },
      ],
    },
  ];

  host.collection = source;
  host.expandedValue = ["east"];
  host.addEventListener(
    "expanded-change",
    (event) => (host.expandedValue = event.detail.value),
  );

  function part(name, text) {
    const node = document.createElement("div");
    node.dataset.xhPart = name;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // 树数据换了，标记跟着重铺
  function renderTree(regions) {
    tree.replaceChildren(
      ...regions.map((region) => {
        const branch = part("branch");
        branch.setAttribute("value", region.value);
        const control = part("branch-control");
        control.append(part("branch-trigger"), part("branch-text", region.label));
        const content = part("branch-content");
        content.append(
          ...region.children.map((city) => {
            const item = part("item");
            item.setAttribute("value", city.value);
            item.append(part("item-indicator"), part("item-text", city.label));
            return item;
          }),
        );
        branch.append(control, content);
        return branch;
      }),
    );
  }

  // 分支名命中就整枝留下，否则只留命中的子节点；一个子节点都不剩的分支整枝去掉
  function filter(key) {
    if (!key) return source;
    return source
      .map((region) => ({
        ...region,
        children: region.label.includes(key)
          ? region.children
          : region.children.filter((city) => city.label.includes(key)),
      }))
      .filter((region) => region.children.length > 0);
  }

  keyword.addEventListener("input", () => {
    const key = keyword.value.trim();
    const regions = filter(key);
    host.collection = regions;
    renderTree(regions);
    host.expandedValue = regions.map((region) => region.value);
    empty.textContent = \`没有匹配「\${key}」的城市\`;
    empty.style.display = regions.length ? "none" : "block";
  });
<\/script>
`;export{n as default};

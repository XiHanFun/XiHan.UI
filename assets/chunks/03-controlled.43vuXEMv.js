const n=`<!-- 受控 | 传了 expandedValue / selection 就由宿主说了算，组件只发事件不落内部值，宿主写回它才动 -->
<div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
  <div style="display: flex; gap: 8px">
    <xh-button id="tree-controlled-expand" size="sm">
      <button data-xh-part="root">全部展开</button>
    </xh-button>
    <xh-button id="tree-controlled-collapse" size="sm">
      <button data-xh-part="root">全部收起</button>
    </xh-button>
  </div>

  <xh-tree id="tree-controlled">
    <div data-xh-part="root">
      <span data-xh-part="label">文档目录</span>
      <div data-xh-part="tree">
        <div data-xh-part="branch" value="api">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-text">接口</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="auth">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">鉴权</span>
            </div>
            <div data-xh-part="item" value="user">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">用户</span>
            </div>
          </div>
        </div>

        <div data-xh-part="branch" value="guide">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-text">指南</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="start">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">快速开始</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree>

  <span>展开：<span id="tree-controlled-expanded">api</span> · 选中：<span id="tree-controlled-selected">（无）</span></span>
</div>

<script type="module">
  const tree = document.getElementById("tree-controlled");
  const expandedOut = document.getElementById("tree-controlled-expanded");
  const selectedOut = document.getElementById("tree-controlled-selected");

  tree.collection = [
    {
      value: "api",
      label: "接口",
      children: [
        { value: "auth", label: "鉴权" },
        { value: "user", label: "用户" },
      ],
    },
    {
      value: "guide",
      label: "指南",
      children: [{ value: "start", label: "快速开始" }],
    },
  ];

  // 两份集合都由这段脚本持有：组件只发意图，写回才真的改
  function setExpanded(value) {
    tree.expandedValue = value;
    expandedOut.textContent = value.join("、") || "（无）";
  }

  function setSelected(value) {
    tree.selection = value;
    selectedOut.textContent = value.join("、") || "（无）";
  }

  setExpanded(["api"]);
  setSelected([]);

  tree.addEventListener("expanded-change", (event) => setExpanded(event.detail.value));
  tree.addEventListener("selection-change", (event) => setSelected(event.detail.value));

  const button = (id) =>
    document.getElementById(id).querySelector('[data-xh-part="root"]');

  button("tree-controlled-expand").addEventListener("click", () =>
    setExpanded(["api", "guide"]),
  );
  button("tree-controlled-collapse").addEventListener("click", () => setExpanded([]));
<\/script>
`;export{n as default};

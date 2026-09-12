const a=`<!-- 级联勾选与回显策略 | multiple 加 cascade 内建父子传导：点分支整枝勾上、子全勾父勾、部分勾中半选；对外值按 checked-strategy 收敛，parent 档整组选满只报组名 -->
<xh-tree-select
  id="tree-select-checkable"
  value="user:view"
  multiple
  cascade
  checked-strategy="parent"
>
  <div data-xh-part="root" style="max-inline-size: 340px">
    <span data-xh-part="label">权限</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <!-- parent 收敛下整组选满值就是组名，缺省显示文本直接可用 -->
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="tree">
          <div data-xh-part="branch" value="user">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="branch-text">用户管理</span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="user:view">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">查看</span>
              </div>
              <div data-xh-part="item" value="user:edit">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">编辑</span>
              </div>
              <div data-xh-part="item" value="user:del">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">删除</span>
              </div>
            </div>
          </div>
          <div data-xh-part="branch" value="order">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="branch-text">订单管理</span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="order:view">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">查看</span>
              </div>
              <div data-xh-part="item" value="order:export">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">导出</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-tree-select>
<p>对外值（parent 收敛）：<span id="tree-select-checkable-value">user:view</span></p>

<script type="module">
  const treeSelect = document.getElementById("tree-select-checkable");
  treeSelect.collection = [
    {
      value: "user",
      label: "用户管理",
      children: [
        { value: "user:view", label: "查看" },
        { value: "user:edit", label: "编辑" },
        { value: "user:del", label: "删除" },
      ],
    },
    {
      value: "order",
      label: "订单管理",
      children: [
        { value: "order:view", label: "查看" },
        { value: "order:export", label: "导出" },
      ],
    },
  ];
  treeSelect.expandedValue = ["user", "order"];
  treeSelect.addEventListener(
    "expanded-value-change",
    (event) => (treeSelect.expandedValue = event.detail.value),
  );

  const readout = document.getElementById("tree-select-checkable-value");
  treeSelect.addEventListener("value-change", (event) => {
    treeSelect.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
<\/script>
`;export{a as default};

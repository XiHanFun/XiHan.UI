const e=`<!-- 树形表级联勾选 | cascade 与树的级联同一套算法：勾父行整枝带上，子行勾满父行跟着勾中、勾了一部分显示半选，禁用行的子树不动；对外值缺省只收叶行 -->
<div id="table-tree-cascade" style="width: 100%; max-width: 560px; display: grid; gap: 12px">
  <xh-table data-host selection-mode="multiple" cascade>
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="select"><span data-xh-part="select-all-trigger"></span></div>
          <div data-xh-part="column-header" value="name"><span data-xh-part="column-label">组织</span></div>
          <div data-xh-part="column-header" value="owner"><span data-xh-part="column-label">负责人</span></div>
        </div>
      </div>
      <div data-xh-part="body" data-body></div>
    </div>
  </xh-table>
  <span data-log>选中：（无）</span>
</div>

<script type="module">
  const scope = document.getElementById("table-tree-cascade");
  const table = scope.querySelector("[data-host]");
  const body = scope.querySelector("[data-body]");
  const log = scope.querySelector("[data-log]");

  const units = [
    { id: "rd", label: "研发中心", owner: "赵一", parentId: undefined },
    { id: "rd-web", label: "前端组", owner: "钱二", parentId: "rd" },
    { id: "rd-api", label: "服务端组", owner: "孙三", parentId: "rd" },
    { id: "rd-lab", label: "实验室（冻结）", owner: "李四", parentId: "rd", disabled: true },
    { id: "ops", label: "运维中心", owner: "周五", parentId: undefined },
    { id: "ops-sre", label: "稳定性组", owner: "吴六", parentId: "ops" },
  ];

  let expanded = ["rd", "ops"];
  table.columns = [
    { id: "select", width: "3rem" },
    { id: "name", label: "组织", width: "13rem" },
    { id: "owner", label: "负责人" },
  ];
  table.rows = units.map(unit => ({ id: unit.id, parentId: unit.parentId, disabled: unit.disabled }));

  // 收起的那一枝整段不渲：可见序与层级都照 parentId 与展开集合算
  function render() {
    table.expandedValue = expanded;
    const visible = units.filter(unit => unit.parentId == null || expanded.includes(unit.parentId));
    body.replaceChildren(...visible.map((unit) => {
      const row = document.createElement("div");
      row.dataset.xhPart = "row";
      row.setAttribute("value", unit.id);
      const select = document.createElement("div");
      select.dataset.xhPart = "cell";
      select.setAttribute("value", "select");
      const trigger = document.createElement("span");
      trigger.dataset.xhPart = "row-select-trigger";
      select.append(trigger);
      const name = document.createElement("div");
      name.dataset.xhPart = "cell";
      name.setAttribute("value", "name");
      name.style.paddingInlineStart = \`\${unit.parentId == null ? 16 : 32}px\`;
      if (unit.parentId == null) {
        const expand = document.createElement("span");
        expand.dataset.xhPart = "expand-trigger";
        name.append(expand);
      }
      name.append(unit.label);
      const owner = document.createElement("div");
      owner.dataset.xhPart = "cell";
      owner.setAttribute("value", "owner");
      owner.textContent = unit.owner;
      row.append(select, name, owner);
      return row;
    }));
  }

  table.addEventListener("expanded-value-change", (event) => {
    expanded = event.detail.value;
    render();
  });
  table.addEventListener("selection-change", (event) => {
    const value = event.detail.value;
    log.textContent = \`选中：\${value === "all" ? "全部" : value.length ? value.join("、") : "（无）"}\`;
  });

  render();
<\/script>
`;export{e as default};

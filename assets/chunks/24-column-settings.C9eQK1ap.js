const e=`<!-- 列设置与工具条 | 工具条渲成表的兄弟排在表前（root 是 grid，工具条进不去它里面）；列设置区照 columnSettings 渲，藏起来的列也在其中，只剩最后一列显示着时那颗把手转禁用 -->
<div id="table-settings" style="width: 100%; max-width: 560px; display: grid; gap: 12px">
  <xh-table id="table-settings-table">
    <div data-xh-part="toolbar">
      <span>成员 4 人</span>
      <!-- 设置区直接摆在工具条里：角色节点归它外面最近的那个 xh-* 元素，
           套进另一个自定义元素（比如浮层）里就不再是这张表的部件了 -->
      <div data-xh-part="column-list" id="table-settings-list"></div>
    </div>
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="name">姓名</div>
          <div data-xh-part="column-header" value="dept">部门</div>
          <div data-xh-part="column-header" value="city">城市</div>
          <div data-xh-part="column-header" value="level">职级</div>
        </div>
      </div>
      <div data-xh-part="body" id="table-settings-body"></div>
    </div>
  </xh-table>
  <span id="table-settings-readout">存下来的列偏好：尚未改过</span>
</div>

<script type="module">
  const stage = document.getElementById("table-settings");
  const table = document.getElementById("table-settings-table");
  const list = document.getElementById("table-settings-list");
  const body = document.getElementById("table-settings-body");
  const readout = document.getElementById("table-settings-readout");

  const columns = [
    { id: "name", label: "姓名", width: "7rem" },
    { id: "dept", label: "部门", width: "9rem" },
    { id: "city", label: "城市", width: "7rem" },
    { id: "level", label: "职级" },
  ];
  const members = [
    { id: "u1", name: "赵一", dept: "平台研发", city: "杭州", level: "P6" },
    { id: "u2", name: "钱二", dept: "前端体验", city: "上海", level: "P7" },
    { id: "u3", name: "孙三", dept: "基础架构", city: "北京", level: "P6" },
    { id: "u4", name: "李四", dept: "前端体验", city: "杭州", level: "P5" },
  ];

  table.columns = columns;
  table.rows = members.map((m) => ({ id: m.id }));

  // 行与格子是作者写的：这里一次建好，之后只改显隐
  body.replaceChildren(
    ...members.map((m) => {
      const row = document.createElement("div");
      row.setAttribute("data-xh-part", "row");
      row.setAttribute("value", m.id);
      for (const col of columns) {
        const cell = document.createElement("div");
        cell.setAttribute("data-xh-part", "cell");
        cell.setAttribute("value", col.id);
        cell.textContent = m[col.id];
        row.append(cell);
      }
      return row;
    }),
  );

  // 设置区一列一行：一颗显隐把手加一段列名
  list.replaceChildren(
    ...columns.map((col) => {
      const line = document.createElement("div");
      line.style.cssText = "display: flex; align-items: center; gap: 8px";
      const trigger = document.createElement("span");
      trigger.setAttribute("data-xh-part", "column-visibility-trigger");
      trigger.setAttribute("value", col.id);
      const name = document.createElement("span");
      name.textContent = col.label;
      line.append(trigger, name);
      return line;
    }),
  );

  // WC 这一侧标记归作者：藏起来的列，它的表头格与单元格由作者自己收起
  function syncColumns() {
    const hidden = new Set(table.columnSettings.filter((c) => c.hidden).map((c) => c.id));
    for (const el of stage.querySelectorAll('[data-xh-part="column-header"], [data-xh-part="cell"]')) {
      el.hidden = hidden.has(el.getAttribute("value"));
    }
  }

  table.addEventListener("column-preference-change", (event) => {
    readout.textContent = \`存下来的列偏好：\${JSON.stringify(event.detail.value)}\`;
    syncColumns();
  });

  syncColumns();
<\/script>
`;export{e as default};

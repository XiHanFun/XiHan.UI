const n=`<!-- 单元格合并 | cellSpan 逐格询问合并区的大小：部门列按连续相同的值纵向合并，汇总行的两个季度横向合并；作者照常逐格渲染，被合并掉的格子由表格收起或留成占位 -->
<div style="width: 100%; max-width: 560px">
  <xh-table id="table-cell-span" ruled>
    <div data-xh-part="root">
      <div data-xh-part="caption">季度交付单量</div>
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="dept"><span data-xh-part="column-label">部门</span></div>
          <div data-xh-part="column-header" value="name"><span data-xh-part="column-label">姓名</span></div>
          <div data-xh-part="column-header" value="q1"><span data-xh-part="column-label">Q1</span></div>
          <div data-xh-part="column-header" value="q2"><span data-xh-part="column-label">Q2</span></div>
        </div>
      </div>
      <div data-xh-part="body" data-body></div>
    </div>
  </xh-table>
</div>

<script type="module">
  const table = document.getElementById("table-cell-span");
  const body = table.querySelector("[data-body]");

  const columns = [
    { id: "dept", label: "部门", width: "7rem" },
    { id: "name", label: "姓名", width: "7rem" },
    { id: "q1", label: "Q1", width: "5rem" },
    { id: "q2", label: "Q2", width: "5rem" },
  ];

  const people = [
    { id: "p1", dept: "研发", name: "赵一", q1: "12", q2: "15" },
    { id: "p2", dept: "研发", name: "钱二", q1: "9", q2: "11" },
    { id: "p3", dept: "研发", name: "孙三", q1: "7", q2: "10" },
    { id: "p4", dept: "运维", name: "李四", q1: "5", q2: "6" },
    { id: "p5", dept: "运维", name: "周五", q1: "4", q2: "8" },
    { id: "sum", dept: "合计", name: "—", q1: "上半年 104", q2: "" },
  ];

  const rows = people.map(p => ({ id: p.id }));

  // 部门列：同一部门的第一行往下合并到这个部门的最后一行；汇总行的 Q1 横跨两列
  function cellSpan({ row, rowIndex, column }) {
    const person = people[rowIndex];
    if (column.id === "dept" && row.id !== "sum") {
      if (rowIndex > 0 && people[rowIndex - 1].dept === person.dept)
        return null;
      let span = 1;
      while (people[rowIndex + span]?.dept === person.dept)
        span += 1;
      return { rowSpan: span };
    }
    if (row.id === "sum" && column.id === "q1")
      return { colSpan: 2 };
    return null;
  }

  table.columns = columns;
  table.rows = rows;
  // 合并询问是函数，只走属性
  table.cellSpan = cellSpan;
  // 作者照常逐格写：被合并掉的格子由元素写上 hidden 或留成占位
  body.replaceChildren(...people.map((p) => {
    const row = document.createElement("div");
    row.dataset.xhPart = "row";
    row.setAttribute("value", p.id);
    row.append(...columns.map((col) => {
      const cell = document.createElement("div");
      cell.dataset.xhPart = "cell";
      cell.setAttribute("value", col.id);
      cell.textContent = p[col.id];
      return cell;
    }));
    return row;
  }));
<\/script>
`;export{n as default};

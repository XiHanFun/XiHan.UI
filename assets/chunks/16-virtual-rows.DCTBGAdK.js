const n=`<!-- 只渲窗口内的行 | 全量 rows 照常交给 root（那只是行序与行号的元信息，不产生 DOM），标记里只渲可见那一段，首尾用两块空白撑出真实滚动高度 -->
<div id="table-virtual" style="width: 100%; max-width: 520px; display: grid; gap: 12px">
  <xh-table id="table-virtual-table" sticky-header>
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row" style="block-size: 36px">
          <div data-xh-part="column-header" value="no">编号</div>
          <div data-xh-part="column-header" value="name">姓名</div>
          <div data-xh-part="column-header" value="dept">部门</div>
        </div>
      </div>
      <div data-xh-part="body"></div>
    </div>
  </xh-table>
  <span id="table-virtual-value"></span>
</div>

<script type="module">
  const stage = document.getElementById("table-virtual");
  const table = stage.querySelector("#table-virtual-table");
  // root 自己就是那个滚动容器，滚动量直接从它身上读
  const root = table.querySelector('[data-xh-part="root"]');
  const body = table.querySelector('[data-xh-part="body"]');
  const readout = stage.querySelector("#table-virtual-value");

  const depts = ["平台研发", "前端体验", "基础架构", "质量保障"];
  const people = Array.from({ length: 2000 }, (_, i) => ({
    id: \`u\${i + 1}\`,
    no: \`#\${i + 1}\`,
    name: \`员工 \${i + 1}\`,
    dept: depts[i % depts.length],
  }));

  table.columns = [
    { id: "no", label: "编号", width: "6rem" },
    { id: "name", label: "姓名", width: "8rem" },
    { id: "dept", label: "部门" },
  ];
  // 行号与总数按全量算，与渲染了哪几行无关
  table.rows = people.map((p) => ({ id: p.id }));

  // 行高写死才算得出窗口；上下各多渲几行做缓冲
  const ROW_H = 36;
  const WINDOW = 18;
  const OVERSCAN = 4;

  // 窗口里的行节点只建一次，滚动时改的是身份与文字
  const pool = Array.from({ length: WINDOW }, () => {
    const row = document.createElement("div");
    row.dataset.xhPart = "row";
    row.style.blockSize = \`\${ROW_H}px\`;
    for (const id of ["no", "name", "dept"]) {
      const cell = document.createElement("div");
      cell.dataset.xhPart = "cell";
      cell.setAttribute("value", id);
      row.append(cell);
    }
    return row;
  });
  body.append(...pool);

  let start = 0;

  function render() {
    const end = Math.min(people.length, start + WINDOW);
    // 首尾两块空白撑出真实滚动高度
    body.style.paddingBlockStart = \`\${start * ROW_H}px\`;
    body.style.paddingBlockEnd = \`\${(people.length - end) * ROW_H}px\`;
    pool.forEach((row, i) => {
      const person = people[start + i];
      row.setAttribute("value", person.id);
      const [no, name, dept] = row.children;
      no.textContent = person.no;
      name.textContent = person.name;
      dept.textContent = person.dept;
    });
    readout.textContent = \`共 \${people.length} 行，此刻在 DOM 里的是第 \${start + 1} – \${end} 行\`;
  }

  root.addEventListener("scroll", () => {
    const first = Math.floor(root.scrollTop / ROW_H) - OVERSCAN;
    const next = Math.min(Math.max(0, first), people.length - WINDOW);
    if (next === start) return;
    start = next;
    render();
  });

  render();
<\/script>
`;export{n as default};

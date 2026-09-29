const e=`<!-- 多级表头与表头分组 | 列给出 children 即为分组：表头按 headerRows 逐层渲染，分组格的跨列数、行号与较浅列头的纵向跨行都由表格算出 -->
<div style="width: 100%; max-width: 620px">
  <xh-table id="table-group-header">
    <div data-xh-part="root">
      <div data-xh-part="caption">季度交付单量</div>
      <!-- 表头按 headerRows 逐层铺：每层一行，row 上写 level -->
      <div data-xh-part="header" data-header></div>
      <div data-xh-part="body" data-body></div>
    </div>
  </xh-table>
</div>

<script type="module">
  const table = document.getElementById("table-group-header");
  const header = table.querySelector("[data-header]");
  const body = table.querySelector("[data-body]");

  // 分组只在表头占格：列号、列宽与数据都按叶子列算，分组内的叶子列要给出宽度
  const columns = [
    { id: "team", label: "小组", width: "8rem" },
    {
      id: "h1",
      label: "上半年",
      children: [
        { id: "q1", label: "Q1", width: "5rem" },
        { id: "q2", label: "Q2", width: "5rem" },
      ],
    },
    {
      id: "h2",
      label: "下半年",
      children: [
        { id: "q3", label: "Q3", width: "5rem" },
        { id: "q4", label: "Q4", width: "5rem" },
      ],
    },
  ];
  const teams = [
    { id: "t1", team: "平台研发", q1: 12, q2: 15, q3: 18, q4: 21 },
    { id: "t2", team: "前端体验", q1: 9, q2: 11, q3: 14, q4: 16 },
    { id: "t3", team: "基础架构", q1: 7, q2: 8, q3: 10, q4: 12 },
  ];
  const leaves = ["team", "q1", "q2", "q3", "q4"];

  table.columns = columns;
  table.rows = teams.map(t => ({ id: t.id }));

  function part(tag, name, attrs = {}, text) {
    const el = document.createElement(tag);
    el.dataset.xhPart = name;
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, String(value));
    if (text != null) el.textContent = text;
    return el;
  }

  // 「小组」在第一行纵向跨满两行，第二行那一格是占位，照样铺
  header.replaceChildren(...table.headerRows.map((cells, i) => {
    const row = part("div", "row", { level: i + 1 });
    row.append(...cells.map((cell) => {
      const th = part("div", "column-header", { value: cell.id });
      th.append(part("span", "column-label", {}, cell.label ?? ""));
      return th;
    }));
    return row;
  }));
  body.replaceChildren(...teams.map((t) => {
    const row = part("div", "row", { value: t.id });
    row.append(...leaves.map(id => part("div", "cell", { value: id }, t[id])));
    return row;
  }));
<\/script>
`;export{e as default};

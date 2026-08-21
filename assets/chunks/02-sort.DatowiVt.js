const e=`<!-- 排序 | 列上标了 sortable 才认排序把手；按住 Shift 点是追加到排序链，裸点是整条链换成这一列 -->
<div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
  <xh-table id="table-sort">
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="name">
            <span data-xh-part="sort-trigger">姓名</span>
          </div>
          <div data-xh-part="column-header" value="dept">
            <span data-xh-part="sort-trigger">部门</span>
          </div>
          <div data-xh-part="column-header" value="level">职级</div>
        </div>
      </div>
      <div data-xh-part="body">
        <div data-xh-part="row" value="u1">
          <div data-xh-part="cell" value="name">赵一</div>
          <div data-xh-part="cell" value="dept">平台研发</div>
          <div data-xh-part="cell" value="level">P6</div>
        </div>
        <div data-xh-part="row" value="u2">
          <div data-xh-part="cell" value="name">钱二</div>
          <div data-xh-part="cell" value="dept">前端体验</div>
          <div data-xh-part="cell" value="level">P7</div>
        </div>
        <div data-xh-part="row" value="u3">
          <div data-xh-part="cell" value="name">孙三</div>
          <div data-xh-part="cell" value="dept">基础架构</div>
          <div data-xh-part="cell" value="level">P6</div>
        </div>
        <div data-xh-part="row" value="u4">
          <div data-xh-part="cell" value="name">李四</div>
          <div data-xh-part="cell" value="dept">前端体验</div>
          <div data-xh-part="cell" value="level">P5</div>
        </div>
      </div>
    </div>
  </xh-table>
  <span id="table-sort-value"></span>
</div>

<script type="module">
  const members = [
    { id: "u1", name: "赵一", dept: "平台研发", level: "P6" },
    { id: "u2", name: "钱二", dept: "前端体验", level: "P7" },
    { id: "u3", name: "孙三", dept: "基础架构", level: "P6" },
    { id: "u4", name: "李四", dept: "前端体验", level: "P5" },
  ];

  const table = document.getElementById("table-sort");
  const body = table.querySelector('[data-xh-part="body"]');
  const readout = document.getElementById("table-sort-value");

  table.columns = [
    { id: "name", label: "姓名", width: "8rem", sortable: true },
    { id: "dept", label: "部门", sortable: true },
    { id: "level", label: "职级", width: "6rem" },
  ];

  // 排序链是有序的：下标即优先级，第一个是主排序字段
  let sort = [];

  function sorted() {
    if (!sort.length) return members;
    return [...members].sort((a, b) => {
      for (const s of sort) {
        const diff = String(a[s.id]).localeCompare(String(b[s.id]), "zh");
        if (diff !== 0) return s.direction === "asc" ? diff : -diff;
      }
      return 0;
    });
  }

  function render() {
    const list = sorted();
    // 行序的事实源跟着排序结果走，行节点跟着搬位置
    table.rows = list.map((m) => ({ id: m.id }));
    table.sort = sort;
    for (const m of list)
      body.append(body.querySelector(\`[data-xh-part="row"][value="\${m.id}"]\`));
    readout.textContent = \`排序链：\${
      sort.length ? sort.map((s) => \`\${s.id} \${s.direction}\`).join(" → ") : "（无）"
    }\`;
  }

  render();
  table.addEventListener("sort-change", (event) => {
    sort = event.detail.value;
    render();
  });
<\/script>
`;export{e as default};

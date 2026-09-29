const n=`<!-- 导出 CSV | 工具条里放一个下载按钮：点击时按当前的排序与列头现拼 CSV，Excel 打开不乱码要带 BOM，字段里的逗号、引号与换行按规则转义 -->
<div style="width: 100%; max-width: 560px">
  <xh-table id="table-export-csv">
    <div data-xh-part="toolbar">
      <span>成员 4 人</span>
      <!-- 点击时才拼：导出的是那一刻的排序结果 -->
      <xh-download-trigger id="table-export-csv-download" file-name="members.csv" mime-type="text/csv" size="sm">
        <button data-xh-part="root">
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10L12 15L17 10"/><path d="M12 3V15"/></svg>
          导出 CSV
        </button>
      </xh-download-trigger>
    </div>
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="name">
            <span data-xh-part="column-label">姓名</span>
            <span data-xh-part="sort-trigger"></span>
          </div>
          <div data-xh-part="column-header" value="dept">
            <span data-xh-part="column-label">部门</span>
            <span data-xh-part="sort-trigger"></span>
          </div>
          <div data-xh-part="column-header" value="note"><span data-xh-part="column-label">备注</span></div>
        </div>
      </div>
      <div data-xh-part="body" data-body></div>
    </div>
  </xh-table>
</div>

<script type="module">
  const table = document.getElementById("table-export-csv");
  const download = document.getElementById("table-export-csv-download");
  const body = table.querySelector("[data-body]");

  const columns = [
    { id: "name", label: "姓名", width: "7rem", sortable: true },
    { id: "dept", label: "部门", width: "8rem", sortable: true },
    { id: "note", label: "备注" },
  ];

  const members = [
    { id: "u1", name: "赵一", dept: "平台研发", note: "负责网关，兼管发布" },
    { id: "u2", name: "钱二", dept: "前端体验", note: "组件库, 设计系统" },
    { id: "u3", name: "孙三", dept: "基础架构", note: "口头禅是\\"先压测\\"" },
    { id: "u4", name: "李四", dept: "前端体验", note: "控制台" },
  ];

  function sortMembers(sort) {
    if (!sort.length)
      return members;
    return [...members].sort((a, b) => {
      for (const s of sort) {
        const diff = a[s.id].localeCompare(b[s.id], "zh");
        if (diff !== 0)
          return s.direction === "asc" ? diff : -diff;
      }
      return 0;
    });
  }

  // 含逗号、引号或换行的字段整段加引号，里面的引号写两遍
  function field(value) {
    return /[",\\n]/.test(value) ? \`"\${value.replaceAll('"', '""')}"\` : value;
  }

  // 列头取 columns 的 label，行序取当前排序；开头的 BOM 让 Excel 按 UTF-8 读
  function toCsv(list) {
    const lines = [
      columns.map(col => field(col.label)).join(","),
      ...list.map(m => columns.map(col => field(m[col.id])).join(",")),
    ];
    return \`\\uFEFF\${lines.join("\\r\\n")}\`;
  }

  let sorted = members;

  function render() {
    table.rows = sorted.map(m => ({ id: m.id }));
    body.replaceChildren(...sorted.map((m) => {
      const row = document.createElement("div");
      row.dataset.xhPart = "row";
      row.setAttribute("value", m.id);
      row.append(...columns.map((col) => {
        const cell = document.createElement("div");
        cell.dataset.xhPart = "cell";
        cell.setAttribute("value", col.id);
        cell.textContent = m[col.id];
        return cell;
      }));
      return row;
    }));
  }

  table.columns = columns;
  table.addEventListener("sort-change", (event) => {
    sorted = sortMembers(event.detail.value);
    render();
  });
  // 取数函数只走属性；点击时才拼
  download.data = () => toCsv(sorted);
  render();
<\/script>
`;export{n as default};

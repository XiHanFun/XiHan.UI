var e=`<!-- 可见的数据表 | 根的作用域交出 table：交给表格组件就是一张看得见的数据表，列名、数值格式与占比口径都与图同一份，不必在图下另写一遍数据 -->
<div style="display: grid; gap: var(--xh-space-4); width: 100%">
  <xh-pie-chart id="pie-chart-table" name-field="channel" value-field="visits">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">访问来源</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="center"></div>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-pie-chart>
  <xh-table id="pie-chart-table-view">
    <div data-xh-part="root">
      <div data-xh-part="caption">各来源的访问量</div>
      <div data-xh-part="header">
        <div id="pie-chart-table-head" data-xh-part="row"></div>
      </div>
      <div id="pie-chart-table-body" data-xh-part="body"></div>
    </div>
  </xh-table>
</div>

<script type="module">
  const chart = document.getElementById("pie-chart-table");
  const view = document.getElementById("pie-chart-table-view");
  const rows = [
    { channel: "搜索", visits: 4200 },
    { channel: "直接访问", visits: 2600 },
    { channel: "社交", visits: 1800 },
    { channel: "邮件", visits: 900 },
    { channel: "广告", visits: 500 },
  ];
  chart.data = rows;

  // 元素上的 table 与根里视觉隐藏的那张表同一份：等它按数据算好，再照着铺表格的节点
  await chart.updateComplete;
  const { columns, rows: tableRows } = chart.table;
  view.columns = columns;
  view.rows = tableRows.map(row => ({ id: String(row.key) }));

  function part(name, value, text) {
    const el = document.createElement("div");
    el.dataset.xhPart = name;
    if (value)
      el.setAttribute("value", value);
    if (text !== undefined)
      el.textContent = text;
    return el;
  }
  document.getElementById("pie-chart-table-head").append(...columns.map((column) => {
    const header = part("column-header", column.id);
    const label = document.createElement("span");
    label.dataset.xhPart = "column-label";
    label.textContent = column.label;
    header.append(label);
    return header;
  }));
  document.getElementById("pie-chart-table-body").append(...tableRows.map((row) => {
    const tr = part("row", String(row.key));
    tr.append(...row.cells.map((cell, i) => part("cell", columns[i].id, cell.text)));
    return tr;
  }));
<\/script>
`;export{e as default};
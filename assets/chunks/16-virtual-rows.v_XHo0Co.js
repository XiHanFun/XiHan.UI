const e=`<!-- 只渲染窗口内的行 | 一万行交给 Virtualizer：表格经 virtualizer 接上它的 collectionVirtualizer，行号与方向键仍按完整行序走，DOM 里只有窗口那十几行 -->
<!-- 表体里的视口负责滚动：表格自己不再定高、不再滚；视口不占 Tab 位，键盘归表体 -->
<xh-table id="table-virtual-rows" style="display: block; inline-size: 100%; max-inline-size: 520px">
  <div data-xh-part="root" style="max-block-size: none; overflow: visible">
    <div data-xh-part="header">
      <div data-xh-part="row">
        <div data-xh-part="column-header" value="no"><span data-xh-part="column-label">编号</span></div>
        <div data-xh-part="column-header" value="name"><span data-xh-part="column-label">姓名</span></div>
        <div data-xh-part="column-header" value="dept"><span data-xh-part="column-label">部门</span></div>
      </div>
    </div>
    <div data-xh-part="body">
      <xh-virtualizer id="table-virtual-rows-virtualizer" count="10000" estimate-size="36" viewport-tab-index="-1">
        <div data-xh-part="root">
          <div data-xh-part="viewport" style="block-size: 320px">
            <div data-xh-part="content"></div>
          </div>
        </div>
      </xh-virtualizer>
    </div>
  </div>
</xh-table>

<script type="module">
  const table = document.getElementById("table-virtual-rows");
  const virtualizer = document.getElementById("table-virtual-rows-virtualizer");
  const content = virtualizer.querySelector('[data-xh-part="content"]');

  const columns = [
    { id: "no", label: "编号", width: "6rem" },
    { id: "name", label: "姓名", width: "8rem" },
    { id: "dept", label: "部门" },
  ];

  const depts = ["平台研发", "前端体验", "基础架构", "质量保障"];

  const people = Array.from({ length: 10000 }, (_, i) => ({
    id: \`u\${i + 1}\`,
    no: \`#\${i + 1}\`,
    name: \`员工 \${i + 1}\`,
    dept: depts[i % depts.length],
  }));

  // 行号与总数按全量算，与挂了哪几行无关
  const rows = people.map(p => ({ id: p.id }));

  table.columns = columns;
  table.rows = rows;

  // 行装在虚拟条目里、隔着一层 xh-virtualizer：data-xh-part-owner 声明它们归表格，两台宿主不争同一个节点
  function row(p) {
    const el = document.createElement("div");
    el.dataset.xhPart = "row";
    el.dataset.xhPartOwner = "table";
    el.setAttribute("value", p.id);
    // 行之间的分隔线：每行装在各自的虚拟条目里，彼此不是兄弟节点，分隔线写在行上
    el.style.cssText = "block-size: 36px; border-block-end: 1px solid var(--xh-border-subtle)";
    el.append(...columns.map((col) => {
      const cell = document.createElement("div");
      cell.dataset.xhPart = "cell";
      cell.setAttribute("value", col.id);
      cell.textContent = p[col.id];
      return cell;
    }));
    return el;
  }

  function render(virtualItems) {
    content.replaceChildren(...virtualItems.map((item) => {
      const shell = document.createElement("div");
      shell.dataset.xhPart = "item";
      shell.setAttribute("value", item.index);
      shell.append(row(people[item.index]));
      return shell;
    }));
    virtualizer.requestUpdate();
    table.virtualizer = virtualizer.collectionVirtualizer;
    table.requestUpdate();
  }

  render(virtualizer.virtualItems);
  virtualizer.addEventListener("range-change", event => render(event.detail.virtualItems));
<\/script>
`;export{e as default};

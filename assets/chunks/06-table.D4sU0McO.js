var e=`<!-- 表格排布 | layout="table" 时表头与各行共用一套列宽；columns 定列序与列宽，列头留空即显示这一列的 label -->
<xh-field-array id="field-array-table" layout="table">
  <div data-xh-part="root" style="inline-size: 100%">
    <div data-xh-part="table" aria-label="费用明细">
      <div data-xh-part="header">
        <div data-xh-part="column-header" value="date"></div>
        <div data-xh-part="column-header" value="category"></div>
        <div data-xh-part="column-header" value="amount"></div>
        <div data-xh-part="column-header" value="note"></div>
      </div>
    </div>
    <button data-xh-part="add-trigger">+ 添加一笔</button>
  </div>
</xh-field-array>

<template id="field-array-table-row">
  <div data-xh-part="item">
    <span data-xh-part="item-label"></span>
    <div data-xh-part="item-cell" value="date">
      <xh-date-field locale="zh-CN">
        <div data-xh-part="root">
          <div data-xh-part="control" data-name="日期">
            <div data-xh-part="segment-group">
              <span data-xh-part="segment" index="0"></span>
              <span>/</span>
              <span data-xh-part="segment" index="1"></span>
              <span>/</span>
              <span data-xh-part="segment" index="2"></span>
            </div>
          </div>
        </div>
      </xh-date-field>
    </div>
    <div data-xh-part="item-cell" value="category">
      <xh-select placeholder="选择">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <button data-xh-part="trigger" data-name="类别">
              <span data-xh-part="value-text"></span>
              <span data-xh-part="indicator"></span>
            </button>
          </div>
          <div data-xh-part="positioner">
            <div data-xh-part="content">
              <div data-xh-part="list">
                <div data-xh-part="item" value="travel">
                  <span data-xh-part="item-text">差旅</span>
                  <span data-xh-part="item-indicator"></span>
                </div>
                <div data-xh-part="item" value="meal">
                  <span data-xh-part="item-text">餐饮</span>
                  <span data-xh-part="item-indicator"></span>
                </div>
                <div data-xh-part="item" value="office">
                  <span data-xh-part="item-text">办公</span>
                  <span data-xh-part="item-indicator"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </xh-select>
    </div>
    <div data-xh-part="item-cell" value="amount">
      <xh-number-field min="0">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" data-name="金额" />
          </div>
        </div>
      </xh-number-field>
    </div>
    <div data-xh-part="item-cell" value="note">
      <xh-text-field>
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" data-name="备注" />
          </div>
        </div>
      </xh-text-field>
    </div>
    <div data-xh-part="item-action">
      <button data-xh-part="item-delete-trigger"></button>
    </div>
  </div>
</template>

<script type="module">
  const host = document.getElementById("field-array-table");
  const table = host.querySelector('[data-xh-part="table"]');
  const template = document.getElementById("field-array-table-row");

  const expenses = [
    { date: "2026-10-12", category: "travel", amount: "860", note: "往返高铁" },
    { date: "2026-10-13", category: "meal", amount: "128", note: "" },
  ];

  // 格里的控件不受控，各管各的值；行节点按值的增删补上或撤下
  function createRow(expense) {
    const row = template.content.firstElementChild.cloneNode(true);
    if (expense.date) row.querySelector("xh-date-field").setAttribute("default-value", expense.date);
    if (expense.category) row.querySelector("xh-select").setAttribute("default-value", expense.category);
    row.querySelector("xh-number-field").setAttribute("default-value", expense.amount);
    row.querySelector("xh-text-field").setAttribute("default-value", expense.note);
    return row;
  }

  const rows = () => table.querySelectorAll(':scope > [data-xh-part="item"]');

  // 行号与每格控件的名字跟着行序走
  function renumber() {
    rows().forEach((row, i) => {
      row.querySelector('[data-xh-part="item-label"]').textContent = String(i + 1);
      for (const el of row.querySelectorAll("[data-name]"))
        el.setAttribute("aria-label", \`第 \${i + 1} 笔\${el.dataset.name}\`);
    });
  }

  host.columns = [
    { id: "date", label: "日期", width: "10rem" },
    { id: "category", label: "类别", width: "8rem" },
    { id: "amount", label: "金额", width: "8rem" },
    { id: "note", label: "备注" },
  ];
  host.createItem = () => ({ date: "", category: "", amount: "", note: "" });
  host.defaultValue = expenses;
  for (const expense of expenses) table.append(createRow(expense));
  renumber();

  host.addEventListener("value-change", (event) => {
    // 格里控件的 value-change 也会冒泡上来，只认字段数组自己的
    if (event.target !== host) return;
    const { value, mutation } = event.detail;
    if (mutation?.type === "insert") table.insertBefore(createRow(value[mutation.index]), rows()[mutation.index] ?? null);
    else if (mutation?.type === "remove") rows()[mutation.index]?.remove();
    renumber();
  });
<\/script>
`;export{e as default};
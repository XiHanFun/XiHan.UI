const a=`<!-- 多选 | selectionMode 默认 none，声明 multiple 才有选择机制；选择列也要在 columns 里占一条，否则右侧列号串位 -->
<div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
  <xh-table id="table-selection" selection-mode="multiple">
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="select">
            <!-- 全选把手是三态的唯一载体，自己占一个 Tab 位 -->
            <span data-xh-part="select-all-trigger">✓</span>
          </div>
          <div data-xh-part="column-header" value="name">姓名</div>
          <div data-xh-part="column-header" value="dept">部门</div>
        </div>
      </div>
      <div data-xh-part="body">
        <div data-xh-part="row" value="u1">
          <div data-xh-part="cell" value="select">
            <span data-xh-part="row-select-trigger">✓</span>
          </div>
          <div data-xh-part="cell" value="name">赵一</div>
          <div data-xh-part="cell" value="dept">平台研发</div>
        </div>
        <div data-xh-part="row" value="u2">
          <div data-xh-part="cell" value="select">
            <span data-xh-part="row-select-trigger">✓</span>
          </div>
          <div data-xh-part="cell" value="name">钱二</div>
          <div data-xh-part="cell" value="dept">前端体验</div>
        </div>
        <div data-xh-part="row" value="u3">
          <div data-xh-part="cell" value="select">
            <span data-xh-part="row-select-trigger">✓</span>
          </div>
          <div data-xh-part="cell" value="name">孙三</div>
          <div data-xh-part="cell" value="dept">基础架构</div>
        </div>
        <div data-xh-part="row" value="u4">
          <div data-xh-part="cell" value="select">
            <span data-xh-part="row-select-trigger">✓</span>
          </div>
          <div data-xh-part="cell" value="name">李四（禁用）</div>
          <div data-xh-part="cell" value="dept">质量保障</div>
        </div>
      </div>
    </div>
  </xh-table>
  <span id="table-selection-value"></span>
</div>

<script type="module">
  const table = document.getElementById("table-selection");
  const readout = document.getElementById("table-selection-value");

  table.columns = [
    { id: "select", width: "3rem" },
    { id: "name", label: "姓名", width: "8rem" },
    { id: "dept", label: "部门" },
  ];
  // 禁用行选不动，也不算进全选的基数
  table.rows = [
    { id: "u1" },
    { id: "u2" },
    { id: "u3" },
    { id: "u4", disabled: true },
  ];

  function apply(selection) {
    table.selection = selection;
    readout.textContent = \`选中：\${
      selection === "all"
        ? "全部"
        : selection.length
          ? selection.join("、")
          : "（无）"
    }\`;
  }

  apply(["u2"]);
  table.addEventListener("selection-change", (event) => apply(event.detail.value));
<\/script>
`;export{a as default};

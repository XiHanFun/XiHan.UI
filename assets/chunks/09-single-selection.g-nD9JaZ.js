const e=`<!-- 单选 | selectionMode 给 single：选中集合最多一个元素，点已选中的那行再点一次就清空，焦点行按空格同理 -->
<div style="width: 100%; max-width: 480px; display: grid; gap: 12px">
  <xh-table id="table-single" selection-mode="single">
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <!-- 单选下全选把手不生效，表头那一格空着即可 -->
          <div data-xh-part="column-header" value="select"></div>
          <div data-xh-part="column-header" value="plan">套餐</div>
          <div data-xh-part="column-header" value="price">价格</div>
        </div>
      </div>
      <div data-xh-part="body">
        <div data-xh-part="row" value="p1">
          <div data-xh-part="cell" value="select">
            <span data-xh-part="row-select-trigger">●</span>
          </div>
          <div data-xh-part="cell" value="plan">入门版</div>
          <div data-xh-part="cell" value="price">¥ 0 / 月</div>
        </div>
        <div data-xh-part="row" value="p2">
          <div data-xh-part="cell" value="select">
            <span data-xh-part="row-select-trigger">●</span>
          </div>
          <div data-xh-part="cell" value="plan">团队版</div>
          <div data-xh-part="cell" value="price">¥ 99 / 月</div>
        </div>
        <div data-xh-part="row" value="p3">
          <div data-xh-part="cell" value="select">
            <span data-xh-part="row-select-trigger">●</span>
          </div>
          <div data-xh-part="cell" value="plan">企业版</div>
          <div data-xh-part="cell" value="price">¥ 399 / 月</div>
        </div>
      </div>
    </div>
  </xh-table>
  <span id="table-single-value"></span>
</div>

<script type="module">
  const table = document.getElementById("table-single");
  const readout = document.getElementById("table-single-value");

  table.columns = [
    { id: "select", width: "3rem" },
    { id: "plan", label: "套餐", width: "8rem" },
    { id: "price", label: "价格" },
  ];
  table.rows = [{ id: "p1" }, { id: "p2" }, { id: "p3" }];

  function apply(selection) {
    table.selection = selection;
    readout.textContent = \`已选：\${selection.length ? selection.join("、") : "（无）"}\`;
  }

  apply(["p2"]);
  table.addEventListener("selection-change", (event) => apply(event.detail.value));
<\/script>
`;export{e as default};

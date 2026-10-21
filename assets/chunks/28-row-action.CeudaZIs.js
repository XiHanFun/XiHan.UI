var e=`<!-- 行主操作 | 点一行报告行与点中的那一列，焦点停在行上按 Enter 报告行：据此下钻或联动 -->
<div style="width: 100%; max-width: 560px; display: grid; gap: 8px">
  <xh-table id="table-row-action">
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="region"><span data-xh-part="column-label">大区</span></div>
          <div data-xh-part="column-header" value="orders"><span data-xh-part="column-label">订单</span></div>
          <div data-xh-part="column-header" value="amount"><span data-xh-part="column-label">金额</span></div>
        </div>
      </div>
      <div data-xh-part="body">
        <div data-xh-part="row" value="north">
          <div data-xh-part="cell" value="region">华北</div>
          <div data-xh-part="cell" value="orders">1,204</div>
          <div data-xh-part="cell" value="amount">¥ 386,200</div>
        </div>
        <div data-xh-part="row" value="east">
          <div data-xh-part="cell" value="region">华东</div>
          <div data-xh-part="cell" value="orders">2,318</div>
          <div data-xh-part="cell" value="amount">¥ 742,900</div>
        </div>
        <div data-xh-part="row" value="south">
          <div data-xh-part="cell" value="region">华南</div>
          <div data-xh-part="cell" value="orders">1,876</div>
          <div data-xh-part="cell" value="amount">¥ 590,400</div>
        </div>
      </div>
    </div>
  </xh-table>
  <span id="table-row-action-output" data-demo-output>点一行，或焦点停在行上按 Enter</span>
</div>

<script type="module">
  // 两份定义都是数组，只能走 property
  const table = document.getElementById("table-row-action");
  table.columns = [
    { id: "region", label: "大区", width: "8rem" },
    { id: "orders", label: "订单", align: "end" },
    { id: "amount", label: "金额", align: "end" },
  ];
  table.rows = [{ id: "north" }, { id: "east" }, { id: "south" }];

  // 指针给出点中的那一列，键盘触发时列为 null
  const output = document.getElementById("table-row-action-output");
  table.addEventListener("action", (event) => {
    const { value, column } = event.detail;
    output.textContent = \`行 \${value}，列 \${column ?? "（键盘）"}\`;
  });
<\/script>
`;export{e as default};
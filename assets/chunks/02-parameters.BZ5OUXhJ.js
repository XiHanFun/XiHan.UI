var e=`<!-- 引用参数 | 给了 parameters 时每个条件可以在「值 / 参数」之间切换，只列类型相容的参数；值写成 { parameter: 名字 } -->
<!-- 不写部件：组、条件行与组尾由元素按值铺在里面 -->
<xh-filter-builder id="filter-builder-parameters" aria-label="订单筛选"></xh-filter-builder>
<p id="filter-builder-parameters-output" data-demo-output></p>

<script type="module">
  const builder = document.getElementById("filter-builder-parameters");
  const output = document.getElementById("filter-builder-parameters-output");

  // 字段、参数与值都是对象，只能经 property 赋值；受控时由宿主写回
  builder.fields = [
    { name: "region", type: "string", label: "区域", options: [{ value: "east", label: "华东" }, { value: "south", label: "华南" }, { value: "north", label: "华北" }] },
    { name: "customer", type: "string", label: "客户" },
    { name: "amount", type: "number", label: "金额" },
    { name: "orderedAt", type: "date", label: "下单日期" },
    { name: "paid", type: "boolean", label: "已付款" },
  ];
  builder.parameters = [
    { name: "minAmount", type: "number", label: "最低金额" },
    { name: "since", type: "date", label: "起始日期" },
    { name: "regions", type: "string", multiple: true, label: "区域列表" },
  ];
  builder.value = {
    logic: "and",
    conditions: [
      { field: "amount", operator: "gte", value: { parameter: "minAmount" } },
      { field: "orderedAt", operator: "gte", value: "2026-01-01" },
    ],
  };
  output.textContent = \`值：\${JSON.stringify(builder.value)}\`;
  builder.addEventListener("value-change", (event) => {
    builder.value = event.detail.value;
    output.textContent = \`值：\${JSON.stringify(event.detail.value)}\`;
  });
<\/script>
`;export{e as default};
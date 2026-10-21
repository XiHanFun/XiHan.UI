var e=`<!-- 插入字段 | 宿主的按钮调用 insert：在选区处插入字段名，焦点回到输入框，光标落在插入内容之后 -->
<div style="display: flex; flex-direction: column; gap: 8px">
  <div id="expression-input-insert-fields" style="display: flex; gap: 8px">
    <xh-button size="sm" variant="outline" data-insert="amount"><button data-xh-part="root">插入报销金额</button></xh-button>
    <xh-button size="sm" variant="outline" data-insert="quantity"><button data-xh-part="root">插入数量</button></xh-button>
  </div>
  <xh-expression-input id="expression-input-insert" label="合计公式"></xh-expression-input>
</div>

<script type="module">
  import { createExpressionCheck, createExpressionEngine } from "@xihan-ui/expression";

  const fields = [
    { label: "amount", kind: "variable", detail: "数字", description: "报销金额" },
    { label: "quantity", kind: "variable", detail: "数字", description: "数量" },
  ];

  const input = document.getElementById("expression-input-insert");

  input.completions = fields;
  input.check = createExpressionCheck(createExpressionEngine(), {
    identifiers: fields.map((field) => field.label),
  });
  // insert 是元素的方法：按钮摆在哪都行，插入后焦点回到输入框
  for (const button of document.getElementById("expression-input-insert-fields").children) {
    button.addEventListener("click", () => input.insert(button.dataset.insert));
  }
<\/script>
`;export{e as default};
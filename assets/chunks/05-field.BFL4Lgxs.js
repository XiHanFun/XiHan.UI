var e=`<!-- 放进表单字段 | 字段的标题与说明接到输入框上；组件自己的问题列表排在字段说明之后进描述链 -->
<xh-field required>
  <div data-xh-part="root">
    <label data-xh-part="label">需要复核的条件</label>
    <xh-expression-input id="expression-input-field" default-value="amount > 5000 || dyas > 7"></xh-expression-input>
    <p data-xh-part="description">条件成立时，报销单转给财务复核</p>
  </div>
</xh-field>

<script type="module">
  import { createExpressionCheck, createExpressionEngine } from "@xihan-ui/expression";

  const fields = [
    { label: "amount", kind: "variable", detail: "数字", description: "报销金额" },
    { label: "days", kind: "variable", detail: "数字", description: "出差天数" },
  ];

  const input = document.getElementById("expression-input-field");

  input.completions = fields;
  input.check = createExpressionCheck(createExpressionEngine(), {
    identifiers: fields.map((field) => field.label),
  });
<\/script>
`;export{e as default};
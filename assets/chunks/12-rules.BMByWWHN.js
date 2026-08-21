const e=`<!-- 声明式规则 | rules 按字段声明 required/min/max/pattern/type，一个字段多条规则首败即停；文案取 rule.message，再退 validateMessages 模板（{name}/{min}/{max} 现场代入）。组里的字段自取校验态：invalid 与必填星号都不用手接 -->
<xh-form id="form-rules">
  <form data-xh-part="root" style="inline-size: 320px; display: grid; gap: 12px">
    <!-- 字段不接任何校验属性：invalid 与必填星号由表单驱动 -->
    <div data-xh-part="field-group" value="username">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">用户名</label>
          <input data-xh-part="control" placeholder="3-12 位，字母开头" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" value="email">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">邮箱</label>
          <input data-xh-part="control" placeholder="you@example.com" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" value="age">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">年龄</label>
          <input data-xh-part="control" placeholder="选填" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <button data-xh-part="submit-trigger">提交</button>
    <p id="form-rules-submitted" style="margin: 0; font-size: 13px">已提交：（还没提交过）</p>
  </form>
</xh-form>

<script type="module">
  const host = document.getElementById("form-rules");
  const submitted = document.getElementById("form-rules-submitted");

  const defaults = { username: "", email: "", age: "" };
  let values = { ...defaults };

  host.rules = {
    username: [
      { required: true, message: "用户名不能为空" },
      { min: 3, max: 12 },
      { pattern: /^[a-z][a-z0-9-]*$/i, message: "只能用字母、数字与连字符，且以字母开头" },
    ],
    email: [
      { required: true, message: "邮箱不能为空" },
      { type: "email", message: "这不是一个合法邮箱" },
    ],
    age: { type: "integer", min: 1, max: 150 },
  };

  // 模板统一改成中文；rule.message 写了的仍然赢过它
  host.validateMessages = {
    minLength: "{name} 至少 {min} 个字符",
    maxLength: "{name} 不能超过 {max} 个字符",
    minNumber: "{name} 不能小于 {min}",
    maxNumber: "{name} 不能大于 {max}",
    type: { integer: "{name} 得是整数" },
  };

  host.defaultValues = defaults;
  host.values = values;

  const groups = [...host.querySelectorAll('[data-xh-part="field-group"]')];
  const nameOf = (el) => el.getAttribute("value");

  for (const group of groups) {
    const input = group.querySelector('[data-xh-part="control"]');
    input.addEventListener("input", () => host.setFieldValue(nameOf(group), input.value));
  }

  host.addEventListener("values-change", (event) => {
    values = event.detail.values;
    host.values = values;
    for (const group of groups) {
      const input = group.querySelector('[data-xh-part="control"]');
      const next = String(values[nameOf(group)] ?? "");
      if (input.value !== next) input.value = next;
    }
  });

  host.addEventListener("errors-change", (event) => {
    for (const group of groups)
      group.querySelector('[data-xh-part="error-text"]').textContent
        = event.detail.errors[nameOf(group)] ?? "";
  });

  host.addEventListener("submit", (event) => {
    submitted.textContent = \`已提交：\${JSON.stringify(event.detail.values)}\`;
  });
<\/script>
`;export{e as default};

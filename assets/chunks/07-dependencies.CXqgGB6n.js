const n=`<!-- 字段联动重验 | 确认密码的规则声明 deps: ['password']：先填确认密码并离开，之后再改密码，确认密码会跟着重新校验 -->
<xh-form id="form-dependencies" validate-on="blur">
  <form data-xh-part="root" style="inline-size: 320px; display: grid; gap: 12px">
    <div data-xh-part="field-group" name="password">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">密码</label>
          <input data-xh-part="control" type="password" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" name="confirm">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">确认密码</label>
          <input data-xh-part="control" type="password" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <button data-xh-part="submit-trigger">提交</button>
  </form>
</xh-form>

<script type="module">
  const host = document.getElementById("form-dependencies");

  host.rules = {
    password: { required: true, message: "请填写密码" },
    // validator 的第二个参数读得到密码的新值；deps 让密码一改就重验这一条
    confirm: {
      validator: (value, values) => (value !== values.password ? "两次输入的密码不一致" : undefined),
      deps: ["password"],
    },
  };
  host.defaultValues = { password: "", confirm: "" };

  const groups = [...host.querySelectorAll('[data-xh-part="field-group"]')];
  const nameOf = (el) => el.getAttribute("name");

  for (const group of groups) {
    const input = group.querySelector('[data-xh-part="control"]');
    input.addEventListener("input", () => host.setFieldValue(nameOf(group), input.value));
  }

  host.addEventListener("errors-change", (event) => {
    for (const group of groups)
      group.querySelector('[data-xh-part="error-text"]').textContent
        = event.detail.errors[nameOf(group)] ?? "";
  });
<\/script>
`;export{n as default};

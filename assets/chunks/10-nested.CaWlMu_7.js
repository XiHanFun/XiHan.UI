const t=`<!-- 嵌套模型与路径字段名 | 字段名直接写成路径，值仍住在宿主自己的嵌套对象里：表单只管错误、id 与摘要跳转，提交时不用把扁平表折回去 -->
<xh-form id="form-nested">
  <form data-xh-part="root" style="inline-size: 320px">
    <!-- 摘要条目按路径名指过去，点一下焦点落进对应的字段容器 -->
    <div data-xh-part="error-summary">
      <span id="form-nested-count">共 0 处需要修改</span>
      <a data-xh-part="error-summary-item" value="user.name"></a>
      <a data-xh-part="error-summary-item" value="user.email"></a>
      <a data-xh-part="error-summary-item" value="hobbies[0].hobby"></a>
      <a data-xh-part="error-summary-item" value="hobbies[1].hobby"></a>
    </div>

    <div data-xh-part="field-group" value="user.name">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">姓名</label>
          <!-- 控件直接绑在嵌套模型上，值不经过表单的值表 -->
          <input data-xh-part="control" data-path="user.name" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" value="user.email">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">邮箱</label>
          <input data-xh-part="control" type="email" data-path="user.email" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" value="hobbies[0].hobby">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">爱好 1</label>
          <input data-xh-part="control" data-path="hobbies[0].hobby" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" value="hobbies[1].hobby">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">爱好 2</label>
          <input data-xh-part="control" data-path="hobbies[1].hobby" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <button data-xh-part="submit-trigger">提交</button>
    <p id="form-nested-submitted" style="margin: 0; font-size: 13px">已提交：（还没提交过）</p>
  </form>
</xh-form>

<script type="module">
  const host = document.getElementById("form-nested");
  const count = document.getElementById("form-nested-count");
  const submitted = document.getElementById("form-nested-submitted");

  const model = {
    user: { name: "", email: "" },
    hobbies: [{ hobby: "" }, { hobby: "" }],
  };

  // 路径名的派生规则只此一处：标记、校验、摘要都读它
  const hobbyName = (index) => \`hobbies[\${index}].hobby\`;

  // 校验不看入参，直接读宿主的嵌套模型；返回的键就是那几条路径
  host.validate = () => {
    const errors = {
      "user.name": model.user.name.trim() ? "" : "姓名不能为空",
      "user.email": model.user.email.includes("@") ? "" : "邮箱要带一个 @",
    };
    model.hobbies.forEach((row, index) => {
      errors[hobbyName(index)] = row.hobby.trim() ? "" : "爱好不能为空";
    });
    return errors;
  };

  const groups = [...host.querySelectorAll('[data-xh-part="field-group"]')];
  const labels = {
    "user.name": "姓名",
    "user.email": "邮箱",
    "hobbies[0].hobby": "爱好 1",
    "hobbies[1].hobby": "爱好 2",
  };

  // 控件写回的是模型上的那一格，不经表单
  for (const group of groups) {
    const input = group.querySelector('[data-xh-part="control"]');
    const path = input.dataset.path;
    input.addEventListener("input", () => {
      if (path.startsWith("user.")) model.user[path.slice(5)] = input.value;
      else model.hobbies[Number(path.slice(8, 9))].hobby = input.value;
    });
  }

  host.addEventListener("errors-change", (event) => {
    const errors = event.detail.errors;
    for (const group of groups)
      group.querySelector('[data-xh-part="error-text"]').textContent
        = errors[group.getAttribute("value")] ?? "";
    for (const item of host.querySelectorAll('[data-xh-part="error-summary-item"]')) {
      const name = item.getAttribute("value");
      item.textContent = errors[name] ? \`\${labels[name]}：\${errors[name]}\` : "";
    }
    count.textContent = \`共 \${Object.keys(errors).length} 处需要修改\`;
  });

  host.addEventListener("submit", () => {
    submitted.textContent = \`已提交：\${JSON.stringify(model)}\`;
  });
<\/script>
`;export{t as default};

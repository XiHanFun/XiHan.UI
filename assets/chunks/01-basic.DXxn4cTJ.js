const t=`<!-- 基础用法 | 默认只在提交时整表校验：过了发 submit，没过发 invalid、摘要显形并把焦点送到第一个出错的字段 -->
<xh-form id="form-basic">
  <form data-xh-part="root" style="inline-size: 320px">
    <!-- 摘要只在提交失败后显形；条目一次全写上，谁露面由当下的错误表决定 -->
    <div data-xh-part="error-summary">
      <span id="form-basic-count">共 0 处需要修改</span>
      <a data-xh-part="error-summary-item" value="email"></a>
      <a data-xh-part="error-summary-item" value="nickname"></a>
    </div>

    <div data-xh-part="field-group" value="email">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">邮箱</label>
          <input data-xh-part="control" type="email" placeholder="you@example.com" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" value="nickname">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">昵称</label>
          <input data-xh-part="control" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div style="display: flex; gap: 8px">
      <button data-xh-part="submit-trigger">提交</button>
      <button data-xh-part="reset-trigger">重置</button>
    </div>

    <p id="form-basic-submitted" hidden style="margin: 0; font-size: 13px"></p>
  </form>
</xh-form>

<script type="module">
  const host = document.getElementById("form-basic");
  const count = document.getElementById("form-basic-count");
  const submitted = document.getElementById("form-basic-submitted");

  const defaults = { email: "", nickname: "" };
  let values = { ...defaults };

  // 校验整表跑一遍，返回「字段名 → 错误文案」；空串表示这条没错
  host.validate = (source) => ({
    email: String(source.email ?? "").includes("@") ? "" : "邮箱要带一个 @",
    nickname: String(source.nickname ?? "").trim() ? "" : "昵称不能为空",
  });
  host.defaultValues = defaults;
  host.values = values;

  const groups = [...host.querySelectorAll('[data-xh-part="field-group"]')];
  const nameOf = (el) => el.getAttribute("value");

  // 控件是作者自己的：敲字写回表单，值表变了再刷回控件
  for (const group of groups) {
    const input = group.querySelector('[data-xh-part="control"]');
    input.addEventListener("input", () => host.setFieldValue(nameOf(group), input.value));
  }

  function syncControls() {
    for (const group of groups) {
      const input = group.querySelector('[data-xh-part="control"]');
      const next = String(values[nameOf(group)] ?? "");
      if (input.value !== next) input.value = next;
    }
  }

  // 错误文案由作者自己写进字段与摘要条目
  function paintErrors(errors) {
    for (const group of groups)
      group.querySelector('[data-xh-part="error-text"]').textContent = errors[nameOf(group)] ?? "";
    for (const item of host.querySelectorAll('[data-xh-part="error-summary-item"]'))
      item.textContent = errors[nameOf(item)] ?? "";
    count.textContent = \`共 \${Object.keys(errors).length} 处需要修改\`;
  }

  // 值给了即受控，写值只发通知，改动由宿主自己写回
  host.addEventListener("values-change", (event) => {
    values = event.detail.values;
    host.values = values;
    syncControls();
  });
  host.addEventListener("errors-change", (event) => paintErrors(event.detail.errors));
  host.addEventListener("submit", (event) => {
    submitted.hidden = false;
    submitted.textContent = \`已提交：\${JSON.stringify(event.detail.values)}\`;
  });

  syncControls();
<\/script>
`;export{t as default};

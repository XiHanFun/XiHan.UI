const t=`<!-- 分步校验 | 校验函数每次提交现读一次：闭住当前这一步，提交就只校验这一步的字段；存草稿走的是普通按钮，一条规则都不跑 -->
<xh-form id="form-steps">
  <form data-xh-part="root" style="inline-size: 320px">
    <strong id="form-steps-title" style="font-size: 13px"></strong>

    <div id="form-steps-actions" style="display: flex; gap: 8px">
      <button data-xh-part="submit-trigger" id="form-steps-next">下一步</button>
      <!-- 普通按钮不是提交键，点了不发提交，也就不跑校验 -->
      <xh-button variant="outline">
        <button data-xh-part="root" id="form-steps-draft">存草稿</button>
      </xh-button>
      <xh-button variant="ghost" id="form-steps-back-host">
        <button data-xh-part="root" id="form-steps-back">上一步</button>
      </xh-button>
    </div>

    <p id="form-steps-draft-out" style="margin: 0; font-size: 13px">草稿：（还没存过）</p>
    <p id="form-steps-done" hidden style="margin: 0; font-size: 13px"></p>
  </form>
</xh-form>

<!-- 一个字段的骨架，脚本按当前这一步克隆出字段容器来 -->
<template id="form-steps-field">
  <div data-xh-part="field-group">
    <xh-field>
      <div data-xh-part="root">
        <label data-xh-part="label"></label>
        <input data-xh-part="control" />
        <p data-xh-part="error-text"></p>
      </div>
    </xh-field>
  </div>
</template>

<script type="module">
  const host = document.getElementById("form-steps");
  const root = host.querySelector('[data-xh-part="root"]');
  const template = document.getElementById("form-steps-field");
  const actions = document.getElementById("form-steps-actions");
  const title = document.getElementById("form-steps-title");
  const next = document.getElementById("form-steps-next");
  const backHost = document.getElementById("form-steps-back-host");
  const draftOut = document.getElementById("form-steps-draft-out");
  const done = document.getElementById("form-steps-done");

  const steps = [
    {
      title: "第 1 步 · 联系人",
      fields: [
        { name: "name", label: "姓名" },
        { name: "phone", label: "手机" },
      ],
    },
    {
      title: "第 2 步 · 任职",
      fields: [
        { name: "company", label: "公司" },
        { name: "title", label: "职位" },
      ],
    },
  ];

  const defaults = { name: "", phone: "", company: "", title: "" };
  let values = { ...defaults };
  let step = 0;

  const current = () => steps[step];
  const isLast = () => step === steps.length - 1;

  function ruleOf(name, text) {
    if (!text.trim()) return "这一项不能为空";
    if (name === "phone" && !/^\\d{11}$/.test(text.trim())) return "手机号要 11 位数字";
    return "";
  }

  host.defaultValues = defaults;
  host.values = values;
  // 只返回当前这一步的字段，别的步骤这一次不参与
  host.validate = (source) => {
    const errors = {};
    for (const field of current().fields)
      errors[field.name] = ruleOf(field.name, String(source[field.name] ?? ""));
    return errors;
  };

  const groups = () => [...root.querySelectorAll('[data-xh-part="field-group"]')];

  // 上一步的字段容器这会儿并没渲染，值仍留在值表里
  function render() {
    for (const group of groups()) group.remove();
    for (const field of current().fields) {
      const group = template.content.firstElementChild.cloneNode(true);
      group.setAttribute("value", field.name);
      group.querySelector('[data-xh-part="label"]').textContent = field.label;
      const input = group.querySelector('[data-xh-part="control"]');
      input.value = String(values[field.name] ?? "");
      input.addEventListener("input", () => host.setFieldValue(field.name, input.value));
      root.insertBefore(group, actions);
    }
    title.textContent = current().title;
    next.textContent = isLast() ? "提交" : "下一步";
    backHost.style.display = step > 0 ? "" : "none";
  }

  host.addEventListener("values-change", (event) => {
    values = event.detail.values;
    host.values = values;
    for (const group of groups()) {
      const input = group.querySelector('[data-xh-part="control"]');
      const text = String(values[group.getAttribute("value")] ?? "");
      if (input.value !== text) input.value = text;
    }
  });

  host.addEventListener("errors-change", (event) => {
    for (const group of groups())
      group.querySelector('[data-xh-part="error-text"]').textContent
        = event.detail.errors[group.getAttribute("value")] ?? "";
  });

  // 这一步过了才走到这里：不是最后一步就往下推一步
  host.addEventListener("submit", (event) => {
    if (!isLast()) {
      step += 1;
      render();
      return;
    }
    done.hidden = false;
    done.textContent = \`已提交：\${JSON.stringify(event.detail.values)}\`;
  });

  document.getElementById("form-steps-draft").addEventListener("click", () => {
    draftOut.textContent = \`草稿：\${JSON.stringify(values)}\`;
  });
  document.getElementById("form-steps-back").addEventListener("click", () => {
    step -= 1;
    render();
  });

  render();
<\/script>
`;export{t as default};

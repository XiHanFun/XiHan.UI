var e=`<!-- 布局 | 设置纵向、横向、行内或网格布局 -->
<div style="display: grid; gap: 16px; justify-items: start">
  <!-- 分段轨道里不排可见标题：label 只作可及名；滑块写在段之前 -->
  <xh-radio-group id="form-layout-picker" variant="segmented" default-value="horizontal">
    <div data-xh-part="root">
      <span data-xh-part="label">排布</span>
      <span data-xh-part="thumb"></span>
      <div data-xh-part="item" value="vertical">
        <span data-xh-part="item-text">vertical</span>
      </div>
      <div data-xh-part="item" value="horizontal">
        <span data-xh-part="item-text">horizontal</span>
      </div>
      <div data-xh-part="item" value="inline">
        <span data-xh-part="item-text">inline</span>
      </div>
      <div data-xh-part="item" value="grid">
        <span data-xh-part="item-text">grid</span>
      </div>
    </div>
  </xh-radio-group>

  <xh-form
    id="form-layout"
    layout="horizontal"
    columns='{"base":1,"md":2}'
    label-width="96px"
  >
    <form data-xh-part="root" style="inline-size: 100%; max-inline-size: 460px">
      <div data-xh-part="field-group" name="username">
        <xh-field>
          <div data-xh-part="root">
            <label data-xh-part="label">用户名</label>
            <input data-xh-part="control" placeholder="字母开头" />
            <p data-xh-part="error-text"></p>
          </div>
        </xh-field>
      </div>

      <div data-xh-part="field-group" name="email">
        <xh-field>
          <div data-xh-part="root">
            <label data-xh-part="label">邮箱</label>
            <input data-xh-part="control" placeholder="you@example.com" />
            <p data-xh-part="error-text"></p>
          </div>
        </xh-field>
      </div>

      <div data-xh-part="field-group" name="city">
        <xh-field>
          <div data-xh-part="root">
            <label data-xh-part="label">所在城市</label>
            <input data-xh-part="control" placeholder="选填" />
            <p data-xh-part="error-text"></p>
          </div>
        </xh-field>
      </div>

      <button data-xh-part="submit-trigger">提交</button>
    </form>
  </xh-form>
</div>

<script type="module">
  const host = document.getElementById("form-layout");
  const picker = document.getElementById("form-layout-picker");

  const defaults = { username: "", email: "", city: "" };
  let values = { ...defaults };

  host.rules = {
    username: { required: true, message: "用户名不能为空" },
    email: { required: true, message: "邮箱不能为空" },
  };
  host.defaultValues = defaults;
  host.values = values;

  const groups = [...host.querySelectorAll('[data-xh-part="field-group"]')];
  const nameOf = (el) => el.getAttribute("name");

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

  // 换一档排布就是换一个属性，字段标记一个字都不用动
  picker.addEventListener("value-change", (event) => {
    host.layout = event.detail.value;
  });
<\/script>
`;export{e as default};
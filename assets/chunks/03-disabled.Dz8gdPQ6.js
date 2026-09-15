const t=`<!-- 状态 | 禁用与只读表单 -->
<xh-form id="form-disabled" disabled>
  <form data-xh-part="root" style="inline-size: 260px">
    <div data-xh-part="field-group" name="token">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">接入令牌</label>
          <input data-xh-part="control" disabled />
          <p data-xh-part="description">整表禁用</p>
        </div>
      </xh-field>
    </div>

    <div style="display: flex; gap: 8px">
      <button data-xh-part="submit-trigger">提交</button>
      <button data-xh-part="reset-trigger">重置</button>
    </div>
  </form>
</xh-form>

<xh-form id="form-readonly" read-only>
  <form data-xh-part="root" style="inline-size: 260px">
    <div data-xh-part="field-group" name="token">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">接入令牌</label>
          <input data-xh-part="control" readonly />
          <p data-xh-part="description">只读：能提交，改不动</p>
        </div>
      </xh-field>
    </div>

    <div style="display: flex; gap: 8px">
      <button data-xh-part="submit-trigger">提交</button>
      <button data-xh-part="reset-trigger">重置</button>
    </div>
  </form>
</xh-form>


<script type="module">

  function wire(id) {
    const host = document.getElementById(id);
    const defaults = { token: "xh-0f2a" };
    let values = { ...defaults };

    host.defaultValues = defaults;
    host.values = values;

    const input = host.querySelector('[data-xh-part="control"]');
    input.addEventListener("input", () => host.setFieldValue("token", input.value));
    host.addEventListener("values-change", (event) => {
      values = event.detail.values;
      host.values = values;
      const next = String(values.token ?? "");
      if (input.value !== next) input.value = next;
    });

    input.value = String(values.token ?? "");
  }

  wire("form-disabled");
  wire("form-readonly");
<\/script>
`;export{t as default};

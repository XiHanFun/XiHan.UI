const n=`<!-- 受控值表 | 传了 values 就由宿主说了算：组件内部不再落值，只发变更通知；页面别处也能直接改这张表 -->
<xh-form id="form-controlled">
  <form data-xh-part="root" style="inline-size: 260px">
    <div data-xh-part="field-group" value="host">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">主机</label>
          <!-- 内容属性上的 value 是原生重置的落点，与 default-values 写同一个值 -->
          <input data-xh-part="control" value="127.0.0.1" />
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" value="port">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">端口</label>
          <input data-xh-part="control" value="5173" />
        </div>
      </xh-field>
    </div>

    <!-- 重置把值送回 default-values，同样经由变更通知落到宿主这张表上 -->
    <button data-xh-part="reset-trigger">重置</button>
  </form>
</xh-form>

<span id="form-controlled-readout" style="font-size: 13px"></span>

<script type="module">
  const host = document.getElementById("form-controlled");
  const readout = document.getElementById("form-controlled-readout");

  const defaults = { host: "127.0.0.1", port: "5173" };
  let values = { ...defaults };

  host.defaultValues = defaults;
  host.values = values;

  const groups = [...host.querySelectorAll('[data-xh-part="field-group"]')];
  const nameOf = (el) => el.getAttribute("value");

  for (const group of groups) {
    const input = group.querySelector('[data-xh-part="control"]');
    input.addEventListener("input", () => host.setFieldValue(nameOf(group), input.value));
  }

  function render() {
    for (const group of groups) {
      const input = group.querySelector('[data-xh-part="control"]');
      const next = String(values[nameOf(group)] ?? "");
      if (input.value !== next) input.value = next;
    }
    readout.textContent = \`宿主持有的值：\${JSON.stringify(values)}\`;
  }

  host.addEventListener("values-change", (event) => {
    values = event.detail.values;
    host.values = values;
    render();
  });

  render();
<\/script>
`;export{n as default};

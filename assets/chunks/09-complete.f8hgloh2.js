const t=`<!-- 填满才可提交 | 每格都有字才算填满，作者据此点亮提交按钮；重填一次清空整组 -->
<form id="pin-input-complete-form">
  <xh-pin-input id="pin-input-complete" length="4" placeholder="·">
    <div data-xh-part="root">
      <label data-xh-part="label">兑换码</label>
      <div style="display: flex">
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
      </div>
      <div style="display: flex; gap: 8px">
        <button type="button" id="pin-input-complete-submit" disabled>提交</button>
        <!-- 重填走原生表单重置，组件认它并把整组清回落点 -->
        <button type="reset">重填</button>
      </div>
      <span id="pin-input-complete-readout">四格都填满才能提交</span>
    </div>
  </xh-pin-input>
</form>

<script type="module">
  const form = document.getElementById("pin-input-complete-form");
  const pin = document.getElementById("pin-input-complete");
  const root = pin.querySelector('[data-xh-part="root"]');
  const submit = document.getElementById("pin-input-complete-submit");
  const readout = document.getElementById("pin-input-complete-readout");
  let code = "";

  // 填满与否由组件写在根上，照它点亮提交按钮
  function sync() {
    submit.disabled = !root.hasAttribute("data-complete");
  }

  new MutationObserver(sync).observe(root, {
    attributes: true,
    attributeFilter: ["data-complete"],
  });
  sync();

  pin.addEventListener("value-change", (event) => (code = event.detail.valueAsString));
  submit.addEventListener("click", () => (readout.textContent = "已提交：" + code));
  form.addEventListener("reset", () => (readout.textContent = "四格都填满才能提交"));
<\/script>
`;export{t as default};

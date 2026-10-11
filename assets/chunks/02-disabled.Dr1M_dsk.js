var e=`<!-- 整组禁用 | disabled 写为原生 fieldset[disabled]，组内每个控件一并禁用，不必逐个写 disabled -->
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 320px">
  <xh-checkbox id="fieldset-lock" default-checked>
    <label data-xh-part="label">
      <button data-xh-part="root">
        <span data-xh-part="indicator"></span>
      </button>
      <span data-xh-part="text">锁定这段设置</span>
    </label>
  </xh-checkbox>
  <xh-fieldset id="fieldset-billing" disabled>
    <fieldset data-xh-part="root">
      <legend data-xh-part="legend">发票抬头</legend>
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">公司名称</label>
          <input data-xh-part="control" type="text" />
        </div>
      </xh-field>
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">纳税人识别号</label>
          <input data-xh-part="control" type="text" />
        </div>
      </xh-field>
      <p data-xh-part="description">锁定期间这两个输入框既不能聚焦，也不参与提交</p>
    </fieldset>
  </xh-fieldset>
</div>

<script type="module">
  const lock = document.getElementById("fieldset-lock");
  const billing = document.getElementById("fieldset-billing");
  lock.addEventListener("checked-change", (event) => {
    billing.disabled = event.detail.checked === true;
  });
<\/script>
`;export{e as default};
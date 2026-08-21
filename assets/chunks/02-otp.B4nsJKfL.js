const t=`<!-- 一次性验证码 | otp 补上 autocomplete=one-time-code，隐藏输入把拼好的整串交给表单，填满那一刻发 value-complete -->
<xh-pin-input id="pin-input-otp" length="6" name="code" placeholder="·" otp>
  <div data-xh-part="root">
    <label data-xh-part="label">短信验证码</label>
    <div style="display: flex">
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
    </div>
    <input data-xh-part="hidden-input" />
  </div>
</xh-pin-input>
<span>填满时拿到：<span id="pin-input-otp-value">（未填满）</span></span>

<script type="module">
  const pin = document.getElementById("pin-input-otp");
  const readout = document.getElementById("pin-input-otp-value");

  pin.addEventListener("value-complete", (event) => {
    readout.textContent = event.detail.valueAsString;
  });
<\/script>
`;export{t as default};

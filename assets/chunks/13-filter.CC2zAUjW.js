const t=`<!-- 限制可输入的字符 | beforeinput 直接写在 input 部件上，非法字符进不了框，值与框里的内容始终一致 -->
<xh-text-field id="text-field-filter-digits" placeholder="只收数字" max-length="11">
  <div data-xh-part="root">
    <label data-xh-part="label">手机号</label>
    <input data-xh-part="input" style="inline-size: 200px" inputmode="numeric" />
  </div>
</xh-text-field>

<xh-text-field id="text-field-filter-space" placeholder="空格进不来">
  <div data-xh-part="root">
    <label data-xh-part="label">账号</label>
    <input data-xh-part="input" style="inline-size: 200px" />
  </div>
</xh-text-field>

<script type="module">
  // 这次要插入的文本：键入与输入法走 data，粘贴与拖入走 dataTransfer
  function incoming(event) {
    return event.data ?? event.dataTransfer?.getData("text/plain") ?? "";
  }

  const digits = document
    .getElementById("text-field-filter-digits")
    .querySelector('[data-xh-part="input"]');
  digits.addEventListener("beforeinput", (event) => {
    const text = incoming(event);
    if (text !== "" && /\\D/.test(text)) {
      event.preventDefault();
    }
  });

  const account = document
    .getElementById("text-field-filter-space")
    .querySelector('[data-xh-part="input"]');
  account.addEventListener("beforeinput", (event) => {
    if (/\\s/.test(incoming(event))) {
      event.preventDefault();
    }
  });
<\/script>
`;export{t as default};

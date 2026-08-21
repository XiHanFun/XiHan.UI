const t=`<!-- 表单 | 给了 name 才带上隐藏输入参与提交；宿主表单点重置，选中值回落到 default-value -->
<form id="segmented-form" style="display: flex; gap: 12px; align-items: center">
  <xh-segmented name="channel" default-value="email">
    <div data-xh-part="root" aria-label="通知渠道">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="email">
        <span data-xh-part="item-text">邮件</span>
      </button>
      <button data-xh-part="item" value="sms">
        <span data-xh-part="item-text">短信</span>
      </button>
      <button data-xh-part="item" value="push">
        <span data-xh-part="item-text">推送</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
  <button type="submit">提交</button>
  <button type="reset">重置</button>
  <span id="segmented-form-readout">已提交：（还没提交）</span>
</form>

<script type="module">
  // 提交读的就是隐藏输入里的值；重置由元素自己接住，值回落到 default-value
  const form = document.getElementById("segmented-form");
  const readout = document.getElementById("segmented-form-readout");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    readout.textContent = \`已提交：\${data.get("channel") ?? ""}\`;
  });
<\/script>
`;export{t as default};

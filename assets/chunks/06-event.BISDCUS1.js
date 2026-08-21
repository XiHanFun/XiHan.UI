const a=`<!-- 受控与拦截 | 传了 value 就由宿主说了算，value-change 只报意图；这里最多留两项 -->
<xh-checkbox-group id="checkbox-group-event" value="email" orientation="horizontal">
  <div data-xh-part="root">
    <span data-xh-part="label">通知渠道（最多两项）</span>
    <div data-xh-part="item" value="email">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">邮件</span>
    </div>
    <div data-xh-part="item" value="sms">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">短信</span>
    </div>
    <div data-xh-part="item" value="push">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">推送</span>
    </div>
    <div data-xh-part="item" value="webhook">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">回调</span>
    </div>
  </div>
</xh-checkbox-group>
<p>已选：<span id="checkbox-group-event-value">email</span></p>

<script type="module">
  // 超过两项就不写回，界面停在原值
  const group = document.getElementById("checkbox-group-event");
  const readout = document.getElementById("checkbox-group-event-value");
  let picked = ["email"];
  group.addEventListener("value-change", (event) => {
    const rejected = event.detail.value.length > 2;
    if (!rejected) picked = event.detail.value;
    group.value = [...picked];
    readout.textContent =
      (picked.join("、") || "（无）") + (rejected ? " · 上一次超额，未写回" : "");
  });
<\/script>
`;export{a as default};

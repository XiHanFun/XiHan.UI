const t=`<!-- 受控 | 传了 value 就由宿主说了算，组件自己不再改选中值；切换意图从 value-change 出来，写回才真的切 -->
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <xh-tabs id="tabs-controlled" value="account">
    <div data-xh-part="root">
      <div data-xh-part="list">
        <button data-xh-part="trigger" value="account">账户</button>
        <button data-xh-part="trigger" value="security">安全</button>
        <button data-xh-part="trigger" value="notice">通知</button>
      </div>

      <div data-xh-part="content" value="account">账户面板</div>
      <div data-xh-part="content" value="security">安全面板</div>
      <div data-xh-part="content" value="notice">通知面板</div>
    </div>
  </xh-tabs>

  <div style="display: flex; align-items: center; gap: 8px">
    <xh-button id="tabs-controlled-jump" variant="outline">
      <button data-xh-part="root">跳到安全</button>
    </xh-button>
    <span>当前：<span id="tabs-controlled-value">account</span></span>
  </div>
</div>

<script type="module">
  // 选中值只在这里写，标签栏与下面那行文字都跟着它走
  const tabs = document.getElementById("tabs-controlled");
  const readout = document.getElementById("tabs-controlled-value");
  const jump = document.getElementById("tabs-controlled-jump");

  function setValue(next) {
    tabs.value = next;
    readout.textContent = next;
  }

  tabs.addEventListener("value-change", (event) => setValue(event.detail.value));
  jump.addEventListener("click", () => setValue("security"));
<\/script>
`;export{t as default};

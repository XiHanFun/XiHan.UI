const t=`<!-- 受控 | 值与明暗都能受控：传了就由宿主说了算，组件只把意图报出来，写不写回由宿主定 -->
<xh-password-input id="password-input-controlled" value="hunter2" visible="false">
  <div data-xh-part="root">
    <label data-xh-part="label">密码</label>
    <div data-xh-part="control">
      <input data-xh-part="input" style="inline-size: 200px" />
      <!-- 图标随宿主那份状态换，切换钮自己的名字由组件管 -->
      <button data-xh-part="visibility-trigger" id="password-input-controlled-icon">○</button>
    </div>
  </div>
</xh-password-input>
<span>当前：<span id="password-input-controlled-value">•••••••</span></span>
<button type="button" id="password-input-controlled-hide">收起明文</button>

<script type="module">
  // 值与明暗都由外面这份状态持有，组件报上来才写回去
  const field = document.getElementById("password-input-controlled");
  const icon = document.getElementById("password-input-controlled-icon");
  const readout = document.getElementById("password-input-controlled-value");
  const hide = document.getElementById("password-input-controlled-hide");

  const state = { value: "hunter2", visible: false };

  function apply(next) {
    Object.assign(state, next);
    field.value = state.value;
    field.visible = state.visible;
    icon.textContent = state.visible ? "◉" : "○";
    readout.textContent = state.visible ? state.value : "•".repeat(state.value.length);
  }

  field.addEventListener("value-change", (event) => apply({ value: event.detail.value }));
  field.addEventListener("visibility-change", (event) => apply({ visible: event.detail.visible }));
  hide.addEventListener("click", () => apply({ visible: false }));
<\/script>
`;export{t as default};

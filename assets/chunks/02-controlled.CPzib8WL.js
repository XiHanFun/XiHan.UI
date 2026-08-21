const e=`<!-- 受控 | 传了 value 就由宿主说了算，组件自己不再改状态；变化经 value-change 报出来，写不写回由宿主定 -->
<xh-text-field id="text-field-controlled" value="曦寒" placeholder="请输入昵称">
  <div data-xh-part="root">
    <label data-xh-part="label">昵称</label>
    <input data-xh-part="input" style="inline-size: 200px" />
  </div>
</xh-text-field>
<span>当前：<span id="text-field-controlled-value">曦寒</span></span>
<button type="button" id="text-field-controlled-reset">重置</button>

<script type="module">
  // 值由外面这份状态持有，组件报上来才写回去
  const field = document.getElementById("text-field-controlled");
  const readout = document.getElementById("text-field-controlled-value");
  const reset = document.getElementById("text-field-controlled-reset");

  function apply(next) {
    field.value = next;
    readout.textContent = next || "（空）";
  }

  field.addEventListener("value-change", (event) => apply(event.detail.value));
  reset.addEventListener("click", () => apply("曦寒"));
<\/script>
`;export{e as default};

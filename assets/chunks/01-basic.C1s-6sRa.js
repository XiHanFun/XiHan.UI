const a=`<!-- 基础用法 | 值是字符串数组，各选各的，再点一次即取消；组内有几项就有几个 Tab 停靠点 -->
<xh-checkbox-group id="checkbox-group-basic" default-value="cheese" name="topping">
  <div data-xh-part="root">
    <span data-xh-part="label">配料</span>
    <div data-xh-part="item" value="cheese">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">芝士</span>
    </div>
    <div data-xh-part="item" value="bacon">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">培根</span>
    </div>
    <div data-xh-part="item" value="corn">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">玉米</span>
    </div>
  </div>
</xh-checkbox-group>
<span>当前：<span id="checkbox-group-basic-value">cheese</span></span>

<script type="module">
  // 选中值回显在后面那行文字里
  const group = document.getElementById("checkbox-group-basic");
  const readout = document.getElementById("checkbox-group-basic-value");
  group.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
<\/script>
`;export{a as default};

const a=`<!-- 数据驱动 | 自家字段叫什么由数据定，映射成条目的值、文本与禁用即可 -->
<!-- 数据里的 code 落成条目的 value，text 落成 item-text，locked 落成 aria-disabled -->
<xh-radio-group id="radio-options" value="p1" name="level" orientation="horizontal">
  <div data-xh-part="root">
    <span data-xh-part="label">优先级</span>
    <div data-xh-part="item" value="p0">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">紧急</span>
    </div>
    <div data-xh-part="item" value="p1">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">高</span>
    </div>
    <div data-xh-part="item" value="p2">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">普通</span>
    </div>
    <div data-xh-part="item" value="p3" aria-disabled="true">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">低</span>
    </div>
  </div>
</xh-radio-group>
<span id="radio-options-readout">当前：p1</span>

<script type="module">
  // 选中值由宿主写回元素，下面那行文字跟着走
  const group = document.getElementById("radio-options");
  const readout = document.getElementById("radio-options-readout");
  group.addEventListener("value-change", (event) => {
    group.value = event.detail.value;
    readout.textContent = \`当前：\${group.value ?? "（未选）"}\`;
  });
<\/script>
`;export{a as default};

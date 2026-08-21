const t=`<!-- 受控 | 选中值与展开态都由外部持有：组件只发意图，写不写回由你决定 -->
<xh-popselect
  id="popselect-controlled"
  value="normal"
  open="false"
  placement="bottom-start"
>
  <div data-xh-part="root">
    <button data-xh-part="trigger">优先级：中</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="low">
          <span data-xh-part="item-text">低</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="normal">
          <span data-xh-part="item-text">中</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="high">
          <span data-xh-part="item-text">高</span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
    </div>
  </div>
</xh-popselect>
<p>
  <xh-button variant="ghost" size="sm">
    <button data-xh-part="root" id="popselect-controlled-toggle">从外部开合</button>
  </xh-button>
  <xh-button variant="ghost" size="sm">
    <button data-xh-part="root" id="popselect-controlled-high">从外部设为「高」</button>
  </xh-button>
</p>
<p>
  展开：<span id="popselect-controlled-open">否</span>；当前值：<span
    id="popselect-controlled-value"
    >normal</span
  >
</p>

<script type="module">
  // 展开态与选中值都存在这份脚本里，元素发来的意图由它决定写不写回
  const popselect = document.getElementById("popselect-controlled");
  const trigger = popselect.querySelector('[data-xh-part="trigger"]');
  const openText = document.getElementById("popselect-controlled-open");
  const valueText = document.getElementById("popselect-controlled-value");

  function labelOf(value) {
    const item = popselect.querySelector(\`[data-xh-part="item"][value="\${value}"]\`);
    return item.querySelector('[data-xh-part="item-text"]').textContent;
  }

  function setOpen(open) {
    popselect.open = open;
    openText.textContent = open ? "是" : "否";
  }

  function setValue(value) {
    popselect.value = value;
    trigger.textContent = \`优先级：\${value.length ? labelOf(value[0]) : "未设置"}\`;
    valueText.textContent = value.join("、") || "（未选）";
  }

  popselect.addEventListener("open-change", (event) => setOpen(event.detail.open));
  popselect.addEventListener("value-change", (event) => setValue(event.detail.value));
  document
    .getElementById("popselect-controlled-toggle")
    .addEventListener("click", () => setOpen(!popselect.open));
  document
    .getElementById("popselect-controlled-high")
    .addEventListener("click", () => setValue(["high"]));
<\/script>
`;export{t as default};

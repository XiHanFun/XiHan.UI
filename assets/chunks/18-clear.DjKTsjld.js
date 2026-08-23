const t=`<!-- 清空按钮 | 清空钮是触发器的兄弟节点，一起收在盒里并排（Vue 的 collection 自动渲染加 clearable 即带上它）；有选中才出现、出现即顶替下拉箭头，不占 Tab 位（键盘清空走 Delete / Backspace）；点按清空全部选中、不展开浮层，焦点回到触发器；可及名走 translations.clearTrigger -->
<xh-select id="select-clear" default-value="design" placeholder="选一个组">
  <div data-xh-part="root" style="inline-size: 240px">
    <span data-xh-part="label">所属小组</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <div data-xh-part="item" value="design">
            <span data-xh-part="item-text">设计组</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="frontend">
            <span data-xh-part="item-text">前端组</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="server">
            <span data-xh-part="item-text">服务端组</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-select>
<p style="margin: 8px 0 0; font-size: 13px">
  选中：<span id="select-clear-value">design</span>
</p>

<script type="module">
  const select = document.getElementById("select-clear");
  const readout = document.getElementById("select-clear-value");

  // 读屏文案是对象，只能走 property
  select.translations = { clearTrigger: "清空所选" };

  select.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value.join(", ") || "（空）";
  });
<\/script>
`;export{t as default};

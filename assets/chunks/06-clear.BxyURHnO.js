const t=`<!-- 清空按钮 | 清空钮与触发器一起收在盒里，是它的兄弟节点：有选中才显出，点按清空全部选中、焦点送回触发器；焦点在触发器上按 Delete 清空全部、Backspace 多选去掉最后一个；可及名走 translations.clearTrigger -->
<xh-popselect id="popselect-clear" multiple placement="bottom-start">
  <div data-xh-part="root">
    <div data-xh-part="control">
      <button data-xh-part="trigger">北京、上海</button>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="bj">
          <span data-xh-part="item-text">北京</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="sh">
          <span data-xh-part="item-text">上海</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="gz">
          <span data-xh-part="item-text">广州</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="sz">
          <span data-xh-part="item-text">深圳</span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
    </div>
  </div>
</xh-popselect>
<p>已选 <span id="popselect-clear-count">2</span> 个</p>

<script type="module">
  // 多选初值与文案对象只走 property：受控给值、收到意图再写回；触发器把各项文本连起来显示
  const popselect = document.getElementById("popselect-clear");
  const count = document.getElementById("popselect-clear-count");
  const trigger = popselect.querySelector('[data-xh-part="trigger"]');
  popselect.value = ["bj", "sh"];
  popselect.translations = { clearTrigger: "清空所选" };

  function labelOf(value) {
    const item = popselect.querySelector(\`[data-xh-part="item"][value="\${value}"]\`);
    return item.querySelector('[data-xh-part="item-text"]').textContent;
  }

  popselect.addEventListener("value-change", (event) => {
    const picked = event.detail.value;
    popselect.value = picked;
    trigger.textContent = picked.length ? picked.map(labelOf).join("、") : "请选择城市";
    count.textContent = String(picked.length);
  });
<\/script>
`;export{t as default};

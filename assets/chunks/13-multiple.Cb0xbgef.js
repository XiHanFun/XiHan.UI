const t=`<!-- 多选成标签 | selectionMode="multiple" 时各列拼出的是草稿，按「添加」收进值、浮层不收，可以接着添；选中的时刻在输入行里排成标签，点叉或在展开钮上按退格摘掉 -->
<xh-time-picker id="time-picker-multiple" name="reminders" selection-mode="multiple" time-step='{"minute":15}'>
  <div data-xh-part="root">
    <label data-xh-part="label">提醒时刻</label>
    <div data-xh-part="control">
      <span data-xh-part="tag-list"></span>
      <button data-xh-part="clear-trigger"></button>
      <button data-xh-part="trigger"></button>
    </div>
    <input data-xh-part="hidden-input" />
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="column" unit="hour">
          <div data-xh-part="item" value="00"></div>
          <div data-xh-part="item" value="01"></div>
          <div data-xh-part="item" value="02"></div>
          <div data-xh-part="item" value="03"></div>
          <div data-xh-part="item" value="04"></div>
          <div data-xh-part="item" value="05"></div>
          <div data-xh-part="item" value="06"></div>
          <div data-xh-part="item" value="07"></div>
          <div data-xh-part="item" value="08"></div>
          <div data-xh-part="item" value="09"></div>
          <div data-xh-part="item" value="10"></div>
          <div data-xh-part="item" value="11"></div>
          <div data-xh-part="item" value="12"></div>
          <div data-xh-part="item" value="13"></div>
          <div data-xh-part="item" value="14"></div>
          <div data-xh-part="item" value="15"></div>
          <div data-xh-part="item" value="16"></div>
          <div data-xh-part="item" value="17"></div>
          <div data-xh-part="item" value="18"></div>
          <div data-xh-part="item" value="19"></div>
          <div data-xh-part="item" value="20"></div>
          <div data-xh-part="item" value="21"></div>
          <div data-xh-part="item" value="22"></div>
          <div data-xh-part="item" value="23"></div>
        </div>
        <div data-xh-part="column" unit="minute">
          <div data-xh-part="item" value="00"></div>
          <div data-xh-part="item" value="15"></div>
          <div data-xh-part="item" value="30"></div>
          <div data-xh-part="item" value="45"></div>
        </div>
        <button data-xh-part="confirm-trigger">添加</button>
      </div>
    </div>
  </div>
</xh-time-picker>

<span aria-live="polite" style="font-size: 13px">
  当前值：<span id="time-picker-multiple-value">09:00、14:30</span>
</span>

<script type="module">
  const picker = document.getElementById("time-picker-multiple");
  const readout = document.getElementById("time-picker-multiple-value");

  const tagList = picker.querySelector('[data-xh-part="tag-list"]');

  // 标签按 tags 铺：一个选中值一枚，带删除钮；放不下的那些合成一枚 +N，文字由元素填
  function paintTags() {
    const overflow = document.createElement("span");
    overflow.dataset.xhPart = "overflow-tag";
    tagList.replaceChildren(
      ...picker.tags.map((tag) => {
        const node = document.createElement("span");
        node.dataset.xhPart = "tag";
        node.setAttribute("value", tag.value);
        const label = document.createElement("span");
        label.dataset.xhPart = "tag-label";
        label.textContent = tag.label;
        const remove = document.createElement("button");
        remove.dataset.xhPart = "item-delete-trigger";
        node.append(label, remove);
        return node;
      }),
      overflow,
    );
  }

  // 多选的值是数组，只走 property：设初值、每次变更写回
  function apply(next) {
    picker.value = next;
    readout.textContent = next.join("、") || "（空）";
    paintTags();
  }

  apply(["09:00", "14:30"]);
  picker.addEventListener("value-change", (event) => apply(event.detail.value));
<\/script>
`;export{t as default};

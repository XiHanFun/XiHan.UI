const a=`<!-- 多选成标签 | selectionMode="multiple" 时浮层里调出的颜色是草稿，按「添加」收进值、浮层不收，可以接着添；预设色板点一下切换选中。选中的颜色在输入行里排成带色点的标签，点叉或在展开钮上按退格摘掉 -->
<xh-color-picker
  id="color-picker-multiple"
  name="palette"
  selection-mode="multiple"
  swatches="#00a98e,#3b82f6,#f59e0b,#ef4444,#8b5cf6"
>
  <div data-xh-part="root">
    <label data-xh-part="label">配色</label>
    <div data-xh-part="control">
      <span data-xh-part="tag-list"></span>
      <button data-xh-part="trigger">
        <span data-xh-part="swatch"></span>
        <span data-xh-part="value-text"></span>
      </button>
    </div>
    <input data-xh-part="hidden-input" />
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="saturation-area">
          <div data-xh-part="area-thumb"></div>
        </div>
        <div data-xh-part="hue-slider">
          <div data-xh-part="control">
            <div data-xh-part="track"></div>
            <div data-xh-part="thumb"></div>
          </div>
        </div>
        <div data-xh-part="swatch-picker">
          <div data-xh-part="item" value="#00a98e">
            <span data-xh-part="swatch"></span>
            <span data-xh-part="indicator"></span>
          </div>
          <div data-xh-part="item" value="#3b82f6">
            <span data-xh-part="swatch"></span>
            <span data-xh-part="indicator"></span>
          </div>
          <div data-xh-part="item" value="#f59e0b">
            <span data-xh-part="swatch"></span>
            <span data-xh-part="indicator"></span>
          </div>
          <div data-xh-part="item" value="#ef4444">
            <span data-xh-part="swatch"></span>
            <span data-xh-part="indicator"></span>
          </div>
          <div data-xh-part="item" value="#8b5cf6">
            <span data-xh-part="swatch"></span>
            <span data-xh-part="indicator"></span>
          </div>
        </div>
        <button data-xh-part="confirm-trigger">添加</button>
      </div>
    </div>
  </div>
</xh-color-picker>

<span aria-live="polite" style="font-size: 13px">
  当前值：<span id="color-picker-multiple-value">#00a98e、#3b82f6</span>
</span>

<script type="module">
  const picker = document.getElementById("color-picker-multiple");
  const readout = document.getElementById("color-picker-multiple-value");

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

  apply(["#00a98e", "#3b82f6"]);
  picker.addEventListener("value-change", (event) => apply(event.detail.value));
<\/script>
`;export{a as default};

var e=`<!-- 多选 | 已选项在触发器里排成标签 -->
<xh-select
  id="select-multiple"
  multiple
  default-value="apple"
  placeholder="请选择"
>
  <div data-xh-part="root">
    <span data-xh-part="label">水果（多选）</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <!-- 标签行：可见的几枚由脚本按 tags 渲染，+N 那一枚常挂、由元素填字；触发器里的标签只作展示 -->
        <span data-xh-part="tag-list">
          <span data-xh-part="overflow-tag"></span>
        </span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <div data-xh-part="item" value="apple">
            <span data-xh-part="item-text">苹果</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="banana">
            <span data-xh-part="item-text">香蕉</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="blueberry">
            <span data-xh-part="item-text">蓝莓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="durian">
            <span data-xh-part="item-text">榴莲</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-select>
<p>已选：<span id="select-multiple-value">apple</span></p>

<script type="module">
  const select = document.getElementById("select-multiple");
  const overflow = select.querySelector('[data-xh-part="overflow-tag"]');
  const readout = document.getElementById("select-multiple-value");

  // 摆得下几枚由组件按 max-tag-count 算好：按值复用已有的节点，只增删变了的那几枚
  function renderTags() {
    const current = new Map(
      [...select.querySelectorAll('[data-xh-part="tag-list"] > [data-xh-part="tag"]')].map((el) => [el.getAttribute("value"), el]),
    );
    const next = select.tags.map((tag) => {
      if (current.has(tag.value))
        return current.get(tag.value);
      const el = document.createElement("span");
      el.setAttribute("data-xh-part", "tag");
      el.setAttribute("value", tag.value);
      el.textContent = tag.label;
      return el;
    });
    for (const el of current.values()) {
      if (!next.includes(el))
        el.remove();
    }
    overflow.before(...next);
  }

  // 选中集合回显在标签行与下面那行文字里；等元素把这一轮更新落定再按 tags 重排
  select.addEventListener("value-change", async (event) => {
    readout.textContent = event.detail.value.join("、") || "（无）";
    await select.updateComplete;
    renderTags();
  });
  select.updateComplete.then(renderTags);
<\/script>
`;export{e as default};
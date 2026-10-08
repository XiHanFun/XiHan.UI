var e=`<!-- 多选 | multiple 下已选路径在触发器里排成标签，文字是整条路径；超出 maxTagCount（默认 3）的折进 +N，触发器里的标签只作展示 -->
<xh-cascader id="cascader-multiple" multiple placeholder="可以多挑几条">
  <div data-xh-part="root">
    <span data-xh-part="label">采购清单</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <!-- 标签行：可见的几枚由脚本按 tags 渲染，+N 那一枚常挂、由元素填字；标签身份写路径的比较键 -->
        <span data-xh-part="tag-list">
          <span data-xh-part="overflow-tag"></span>
        </span>
        <span data-xh-part="indicator"></span>
      </button>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="column" level="0">
          <div data-xh-part="item" value="fruit">
            <span data-xh-part="item-text">水果</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="vegetable">
            <span data-xh-part="item-text">蔬菜</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
        <div data-xh-part="column" level="1">
          <div data-xh-part="item" value="apple">
            <span data-xh-part="item-text">苹果</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="banana">
            <span data-xh-part="item-text">香蕉</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="tomato">
            <span data-xh-part="item-text">番茄</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="potato">
            <span data-xh-part="item-text">土豆</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-cascader>

<script type="module">
  const cascader = document.getElementById("cascader-multiple");
  cascader.collection = [
    {
      value: "fruit",
      label: "水果",
      children: [
        { value: "apple", label: "苹果" },
        { value: "banana", label: "香蕉" },
      ],
    },
    {
      value: "vegetable",
      label: "蔬菜",
      children: [
        { value: "tomato", label: "番茄" },
        { value: "potato", label: "土豆" },
      ],
    },
  ];

  cascader.value = [["fruit", "apple"], ["vegetable", "tomato"]];

  const overflow = cascader.querySelector('[data-xh-part="overflow-tag"]');

  // 摆得下几枚由组件按 max-tag-count 算好：按比较键复用已有的节点，只增删变了的那几枚
  function renderTags() {
    const current = new Map(
      [...cascader.querySelectorAll('[data-xh-part="tag-list"] > [data-xh-part="tag"]')].map((el) => [el.getAttribute("value"), el]),
    );
    const next = cascader.tags.map((tag) => {
      if (current.has(tag.key))
        return current.get(tag.key);
      const el = document.createElement("span");
      el.setAttribute("data-xh-part", "tag");
      el.setAttribute("value", tag.key);
      el.textContent = tag.label;
      return el;
    });
    for (const el of current.values()) {
      if (!next.includes(el))
        el.remove();
    }
    overflow.before(...next);
  }

  // 受控：写回选中值，等元素把这一轮更新落定再按 tags 重排标签
  cascader.addEventListener("value-change", async (event) => {
    cascader.value = event.detail.value;
    await cascader.updateComplete;
    renderTags();
  });
  cascader.updateComplete.then(renderTags);
<\/script>
`;export{e as default};
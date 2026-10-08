var e=`<!-- 多选 | 已选城市在输入框前排成标签 -->
<xh-combobox id="combobox-multiple" multiple placeholder="搜索城市">
  <div data-xh-part="root">
    <label data-xh-part="label">常去城市</label>
    <div data-xh-part="control">
      <!-- 标签行排在输入框之前：可见的几枚由脚本按 tags 渲染，+N 那一枚常挂、由元素填字 -->
      <span data-xh-part="tag-list">
        <span data-xh-part="overflow-tag"></span>
      </span>
      <input data-xh-part="input" />
      <button data-xh-part="trigger"></button>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="beijing">
          <span data-xh-part="item-text">Beijing 北京</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="berlin">
          <span data-xh-part="item-text">Berlin 柏林</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="chengdu">
          <span data-xh-part="item-text">Chengdu 成都</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="london">
          <span data-xh-part="item-text">London 伦敦</span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
      <div data-xh-part="empty">无匹配城市</div>
    </div>
  </div>
</xh-combobox>

<script type="module">
  const combobox = document.getElementById("combobox-multiple");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const overflow = combobox.querySelector('[data-xh-part="overflow-tag"]');
  const all = [...content.children];
  const labelOf = (item) => item.querySelector('[data-xh-part="item-text"]').textContent.toLowerCase();

  // 一枚带删除钮的标签：文字包在 tag-label 里，长名字在这一层截断
  function tagOf(tag) {
    const el = document.createElement("span");
    el.setAttribute("data-xh-part", "tag");
    el.setAttribute("value", tag.value);
    const label = document.createElement("span");
    label.setAttribute("data-xh-part", "tag-label");
    label.textContent = tag.label;
    const remove = document.createElement("button");
    remove.setAttribute("data-xh-part", "item-delete-trigger");
    el.append(label, remove);
    return el;
  }

  // 摆得下几枚由组件按 max-tag-count 算好；+N 那一枚常挂，标签插在它前面。
  // 按值复用已有的节点，只增删变了的那几枚，标签行的进场与退场才落在真正变了的标签上
  function renderTags() {
    const current = new Map(
      [...combobox.querySelectorAll('[data-xh-part="tag-list"] > [data-xh-part="tag"]')].map((el) => [el.getAttribute("value"), el]),
    );
    const next = combobox.tags.map((tag) => current.get(tag.value) ?? tagOf(tag));
    for (const el of current.values()) {
      if (!next.includes(el))
        el.remove();
    }
    overflow.before(...next);
  }

  // 受控：写回选中值，等元素把这一轮更新落定再按 tags 重排标签
  async function select(value) {
    combobox.value = value;
    await combobox.updateComplete;
    renderTags();
  }

  combobox.addEventListener("value-change", (event) => select(event.detail.value));
  combobox.addEventListener("input-value-change", (event) => {
    const q = event.detail.inputValue.trim().toLowerCase();
    content.replaceChildren(...all.filter((item) => labelOf(item).includes(q)));
  });

  select(["beijing", "chengdu"]);
<\/script>
`;export{e as default};
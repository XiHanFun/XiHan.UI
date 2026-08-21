const e=`<!-- 多种前缀 | @ 提人、# 打标签共用一个输入框，query-change 会报回是哪个前缀触发的 -->
<xh-mention id="mention-multi-prefix" placeholder="@ 提及同事，# 打标签">
  <div data-xh-part="root">
    <textarea data-xh-part="input"></textarea>
    <div data-xh-part="positioner">
      <div data-xh-part="content"></div>
    </div>
  </div>
</xh-mention>
<p>当前前缀：<span id="mention-multi-prefix-active">（无触发）</span></p>

<script type="module">
  const people = [
    { value: "lilei", label: "李雷" },
    { value: "hanmeimei", label: "韩梅梅" },
    { value: "poly", label: "Poly" },
  ];

  const topics = [
    { value: "bug", label: "缺陷" },
    { value: "release", label: "发版" },
    { value: "design", label: "设计评审" },
  ];

  const mention = document.getElementById("mention-multi-prefix");
  const content = mention.querySelector('[data-xh-part="content"]');
  const readout = document.getElementById("mention-multi-prefix-active");

  // 前缀数组与可及名字都进不了属性，经 property 交给元素
  mention.triggerPrefix = ["@", "#"];
  mention.translations = { input: "正文", content: "候选" };

  function itemNode(node) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", node.value);
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = node.label;
    item.append(text);
    return item;
  }

  // 按前缀选数据源，再按查询串筛一遍
  function render(query, prefix) {
    const pool = prefix === "#" ? topics : people;
    const q = (query ?? "").trim().toLowerCase();
    const matched =
      q === ""
        ? pool
        : pool.filter((item) => item.value.includes(q) || item.label.toLowerCase().includes(q));
    content.replaceChildren(...matched.map(itemNode));
  }

  render("", "@");
  mention.addEventListener("query-change", (event) => {
    render(event.detail.query, event.detail.prefix);
    readout.textContent = event.detail.prefix ?? "（无触发）";
  });
<\/script>
`;export{e as default};

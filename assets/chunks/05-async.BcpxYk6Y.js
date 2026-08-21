const n=`<!-- 异步候选 | 查询串每变一次就重新去远端查一遍，等结果的这段时间浮层里空着 -->
<xh-mention id="mention-async" placeholder="输入 @ 再打两个字试试">
  <div data-xh-part="root">
    <textarea data-xh-part="input"></textarea>
    <div data-xh-part="positioner">
      <div data-xh-part="content"></div>
    </div>
  </div>
</xh-mention>
<p id="mention-async-status">候选 0 条</p>

<script type="module">
  const pool = [
    { value: "lilei", label: "李雷" },
    { value: "hanmeimei", label: "韩梅梅" },
    { value: "poly", label: "Poly" },
    { value: "linfeng", label: "林枫" },
  ];

  const mention = document.getElementById("mention-async");
  const content = mention.querySelector('[data-xh-part="content"]');
  const status = document.getElementById("mention-async-status");
  let timer = 0;

  mention.translations = { input: "正文", content: "提及谁" };

  function itemNode(person) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", person.value);
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = person.label;
    item.append(text);
    return item;
  }

  function show(options, loading) {
    content.replaceChildren(...options.map(itemNode));
    status.textContent = loading ? "查询中…" : \`候选 \${options.length} 条\`;
  }

  // 每次查询串变化都重开一轮查询，上一轮未落地的先撤掉
  mention.addEventListener("query-change", (event) => {
    clearTimeout(timer);
    if (event.detail.query === null) {
      show([], false);
      return;
    }
    const q = event.detail.query.trim().toLowerCase();
    show([], true);
    timer = setTimeout(() => {
      show(
        pool.filter((p) => p.value.includes(q) || p.label.toLowerCase().includes(q)),
        false,
      );
    }, 500);
  });
<\/script>
`;export{n as default};

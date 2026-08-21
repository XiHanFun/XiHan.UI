const e=`<!-- 基础用法 | 在正文里敲 @ 才开候选，选中的那条被插到光标处，前后文一字不动 -->
<xh-mention id="mention-basic" placeholder="写点什么，输入 @ 提及同事">
  <div data-xh-part="root">
    <textarea data-xh-part="input"></textarea>
    <div data-xh-part="positioner">
      <div data-xh-part="content"></div>
    </div>
  </div>
</xh-mention>
<p>正文：<span id="mention-basic-value">（空）</span></p>

<script type="module">
  const people = [
    { value: "lilei", label: "李雷" },
    { value: "hanmeimei", label: "韩梅梅" },
    { value: "poly", label: "Poly" },
    { value: "ghost", label: "幽灵（已离职）", disabled: true },
  ];

  const mention = document.getElementById("mention-basic");
  const content = mention.querySelector('[data-xh-part="content"]');
  const readout = document.getElementById("mention-basic-value");

  // 可及名字是对象，只能经 property 交给元素
  mention.translations = { input: "正文", content: "提及谁" };

  function itemNode(person) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", person.value);
    if (person.disabled) item.setAttribute("aria-disabled", "true");
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = person.label;
    item.append(text);
    return item;
  }

  // 过滤是调用方的活儿：组件只把 @ 到光标之间那段交出来
  function render(query) {
    const q = query.trim().toLowerCase();
    const matched =
      q === ""
        ? people
        : people.filter((p) => p.value.includes(q) || p.label.toLowerCase().includes(q));
    content.replaceChildren(...matched.map(itemNode));
  }

  render("");
  mention.addEventListener("query-change", (event) => render(event.detail.query ?? ""));
  mention.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value || "（空）";
  });
<\/script>
`;export{e as default};

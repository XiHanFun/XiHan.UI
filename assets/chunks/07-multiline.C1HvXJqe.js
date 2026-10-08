var e=`<!-- 多行正文 | 输入框写成 textarea，评论可以换行；插入的引用是一个整体，Backspace 整条删掉 -->
<xh-mention id="mention-multiline" placeholder="输入 @ 提及同事，Enter 换行">
  <div data-xh-part="root">
    <label data-xh-part="label">评论</label>
    <!-- 作者摆 textarea 即多行形态：元素读标签名，撤掉单行才有的 type、combobox 角色与 aria-expanded -->
    <textarea data-xh-part="input" rows="3"></textarea>
    <div data-xh-part="positioner">
      <div data-xh-part="content"></div>
    </div>
  </div>
</xh-mention>

<script type="module">
  const people = [
    { value: "lilei", label: "李雷" },
    { value: "hanmeimei", label: "韩梅梅" },
    { value: "poly", label: "Poly" },
  ];

  const mention = document.getElementById("mention-multiline");
  const content = mention.querySelector('[data-xh-part="content"]');

  mention.translations = { content: "提及谁" };

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

  function render(query) {
    const q = (query ?? "").trim().toLowerCase();
    const matched =
      q === ""
        ? people
        : people.filter((p) => p.value.includes(q) || p.label.toLowerCase().includes(q));
    content.replaceChildren(...matched.map(itemNode));
  }

  render("");
  mention.addEventListener("query-change", (event) => render(event.detail.query));
<\/script>
`;export{e as default};
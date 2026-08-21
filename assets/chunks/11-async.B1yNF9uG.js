const t=`<!-- 异步候选 | 输入串每变一次就重新去远端查一遍，等结果的这段时间候选为空、由空态节点顶上 -->
<xh-combobox id="combobox-async" placeholder="输入城市名查询">
  <div data-xh-part="root">
    <label data-xh-part="label">城市</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="trigger"></button>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content"></div>
      <div data-xh-part="empty" id="combobox-async-empty">无匹配城市</div>
    </div>
  </div>
</xh-combobox>
<p>当前值：<span id="combobox-async-value">（未选）</span></p>

<script type="module">
  const combobox = document.getElementById("combobox-async");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const empty = document.getElementById("combobox-async-empty");
  const readout = document.getElementById("combobox-async-value");
  const pool = [
    { value: "beijing", label: "Beijing 北京" },
    { value: "berlin", label: "Berlin 柏林" },
    { value: "bern", label: "Bern 伯尔尼" },
    { value: "chengdu", label: "Chengdu 成都" },
    { value: "london", label: "London 伦敦" },
  ];
  let timer = 0;

  function makeItem(city) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", city.value);
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = city.label;
    const indicator = document.createElement("span");
    indicator.dataset.xhPart = "item-indicator";
    item.append(text, indicator);
    return item;
  }

  // 每次输入都重开一轮查询，上一轮未落地的先撤掉
  combobox.addEventListener("input-value-change", (event) => {
    window.clearTimeout(timer);
    const q = event.detail.inputValue.trim().toLowerCase();
    content.replaceChildren();
    if (q === "") {
      empty.textContent = "无匹配城市";
      return;
    }
    empty.textContent = "查询中…";
    timer = window.setTimeout(() => {
      content.replaceChildren(
        ...pool.filter((c) => c.label.toLowerCase().includes(q)).map(makeItem),
      );
      empty.textContent = "无匹配城市";
    }, 600);
  });

  combobox.addEventListener("value-change", (event) => {
    combobox.value = event.detail.value;
    readout.textContent = event.detail.value[0] ?? "（未选）";
  });
<\/script>
`;export{t as default};

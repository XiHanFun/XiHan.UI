const t=`<!-- 分组 | 候选分段展示；整段被筛空时连同段标题一起不渲染，列表里不留空壳 -->
<xh-combobox id="combobox-group" open-on-click placeholder="按大洲分组">
  <div data-xh-part="root">
    <label data-xh-part="label">城市</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="trigger">▾</button>
      <button data-xh-part="clear-trigger">✕</button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item-group" value="asia">
          <span data-xh-part="item-group-label">亚洲</span>
          <div data-xh-part="item" value="beijing">
            <span data-xh-part="item-text">Beijing 北京</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <div data-xh-part="item" value="chengdu">
            <span data-xh-part="item-text">Chengdu 成都</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
        </div>
        <div data-xh-part="item-group" value="europe">
          <span data-xh-part="item-group-label">欧洲</span>
          <div data-xh-part="item" value="berlin">
            <span data-xh-part="item-text">Berlin 柏林</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <div data-xh-part="item" value="london">
            <span data-xh-part="item-text">London 伦敦</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
        </div>
      </div>
      <div data-xh-part="empty">无匹配城市</div>
    </div>
  </div>
</xh-combobox>
<p>当前值：<span id="combobox-group-value">（未选）</span></p>

<script type="module">
  const combobox = document.getElementById("combobox-group");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const readout = document.getElementById("combobox-group-value");
  // 分段与段内候选整份留在手上，输入串一变就按它重铺
  const labelOf = (item) => item.querySelector('[data-xh-part="item-text"]').textContent.toLowerCase();
  const groups = [...content.children].map((node) => ({
    node,
    label: node.querySelector('[data-xh-part="item-group-label"]'),
    items: [...node.querySelectorAll('[data-xh-part="item"]')],
  }));

  combobox.addEventListener("input-value-change", (event) => {
    const q = event.detail.inputValue.trim().toLowerCase();
    const shown = [];
    for (const group of groups) {
      const matched = group.items.filter((item) => labelOf(item).includes(q));
      if (matched.length === 0)
        continue;
      group.node.replaceChildren(group.label, ...matched);
      shown.push(group.node);
    }
    content.replaceChildren(...shown);
  });

  combobox.addEventListener("value-change", (event) => {
    combobox.value = event.detail.value;
    readout.textContent = event.detail.value[0] ?? "（未选）";
  });
<\/script>
`;export{t as default};

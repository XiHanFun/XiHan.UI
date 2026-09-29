const t=`<!-- 候选虚拟化 | 过滤后的完整 collection 与 count 同步，高亮仍可跨窗口移动 -->
<xh-combobox id="combobox-virtualized" open-on-click placeholder="搜索城市">
  <div data-xh-part="root">
    <label data-xh-part="label">城市</label>
    <div data-xh-part="control"><input data-xh-part="input"><button data-xh-part="trigger"></button></div>
    <div data-xh-part="positioner"><div data-xh-part="content" style="overflow: visible; max-block-size: none">
      <xh-virtualizer id="combobox-virtualizer" count="1000" estimate-size="36" viewport-tab-index="-1">
        <div data-xh-part="root"><div data-xh-part="viewport" style="block-size: 240px"><div data-xh-part="content"></div></div></div>
      </xh-virtualizer>
    </div><div data-xh-part="empty">无匹配城市</div></div>
  </div>
</xh-combobox>

<script type="module">
  const combobox = document.getElementById("combobox-virtualized");
  const virtualizer = document.getElementById("combobox-virtualizer");
  const content = virtualizer.querySelector('[data-xh-part="content"]');
  const cities = Array.from({ length: 1000 }, (_, index) => ({ value: \`city-\${index + 1}\`, label: \`城市 \${index + 1}\` }));
  combobox.collection = cities;
  function render(virtualItems) {
    content.replaceChildren(...virtualItems.map((virtualItem) => {
      const shell = document.createElement("div"); shell.dataset.xhPart = "item"; shell.setAttribute("value", virtualItem.index); shell.style.blockSize = "36px";
      const option = document.createElement("div"); option.dataset.xhPart = "item"; option.dataset.xhPartOwner = "combobox"; option.setAttribute("value", cities[virtualItem.index].value);
      const text = document.createElement("span"); text.dataset.xhPart = "item-text"; text.textContent = cities[virtualItem.index].label;
      const indicator = document.createElement("span"); indicator.dataset.xhPart = "item-indicator";
      option.append(text, indicator); shell.append(option); return shell;
    }));
    virtualizer.requestUpdate(); combobox.virtualizer = virtualizer.collectionVirtualizer; combobox.requestUpdate();
  }
  render(virtualizer.virtualItems);
  virtualizer.addEventListener("range-change", event => render(event.detail.virtualItems));
<\/script>
`;export{t as default};

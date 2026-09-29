const t=`<!-- 长选项虚拟化 | 完整 collection 负责选择语义，Virtualizer 负责浮层中的窗口 -->
<xh-select id="select-virtualized" placeholder="请选择">
  <div data-xh-part="root">
    <span data-xh-part="label">长列表</span>
    <div data-xh-part="control"><button data-xh-part="trigger"><span data-xh-part="value-text"></span><span data-xh-part="indicator"></span></button></div>
    <div data-xh-part="positioner"><div data-xh-part="content">
      <div data-xh-part="list" style="overflow: visible; max-block-size: none">
        <xh-virtualizer id="select-virtualizer" count="1000" estimate-size="36" viewport-tab-index="-1">
          <div data-xh-part="root"><div data-xh-part="viewport" style="block-size: 240px"><div data-xh-part="content"></div></div></div>
        </xh-virtualizer>
      </div>
    </div></div>
  </div>
</xh-select>

<script type="module">
  const select = document.getElementById("select-virtualized");
  const virtualizer = document.getElementById("select-virtualizer");
  const content = virtualizer.querySelector('[data-xh-part="content"]');
  const options = Array.from({ length: 1000 }, (_, index) => ({ value: \`option-\${index + 1}\`, label: \`选项 \${index + 1}\` }));
  select.collection = options;
  function render(virtualItems) {
    content.replaceChildren(...virtualItems.map((virtualItem) => {
      const shell = document.createElement("div"); shell.dataset.xhPart = "item"; shell.setAttribute("value", virtualItem.index); shell.style.blockSize = "36px";
      const option = document.createElement("div"); option.dataset.xhPart = "item"; option.dataset.xhPartOwner = "select"; option.setAttribute("value", options[virtualItem.index].value);
      const text = document.createElement("span"); text.dataset.xhPart = "item-text"; text.textContent = options[virtualItem.index].label;
      const indicator = document.createElement("span"); indicator.dataset.xhPart = "item-indicator";
      option.append(text, indicator); shell.append(option); return shell;
    }));
    virtualizer.requestUpdate(); select.virtualizer = virtualizer.collectionVirtualizer; select.requestUpdate();
  }
  render(virtualizer.virtualItems);
  virtualizer.addEventListener("range-change", event => render(event.detail.virtualItems));
<\/script>
`;export{t as default};

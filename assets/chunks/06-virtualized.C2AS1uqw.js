const t=`<!-- 集合虚拟化 | collection 保留完整语义，Virtualizer 只决定当前挂载哪些 option -->
<xh-listbox id="listbox-virtualized">
  <div data-xh-part="root">
    <span data-xh-part="label">团队成员</span>
    <div data-xh-part="content" style="overflow: visible; max-block-size: none">
      <xh-virtualizer id="listbox-virtualizer" count="1000" estimate-size="36" viewport-tab-index="-1">
        <div data-xh-part="root">
          <div data-xh-part="viewport" style="block-size: 240px">
            <div data-xh-part="content"></div>
          </div>
        </div>
      </xh-virtualizer>
    </div>
  </div>
</xh-listbox>

<script type="module">
  const listbox = document.getElementById("listbox-virtualized");
  const virtualizer = document.getElementById("listbox-virtualizer");
  const content = virtualizer.querySelector('[data-xh-part="content"]');
  const items = Array.from({ length: 1000 }, (_, index) => ({
    value: \`member-\${index + 1}\`,
    label: \`成员 \${index + 1}\`,
  }));
  listbox.collection = items;

  function render(virtualItems) {
    content.replaceChildren(...virtualItems.map((virtualItem) => {
      const shell = document.createElement("div");
      shell.dataset.xhPart = "item";
      shell.setAttribute("value", virtualItem.index);
      shell.style.blockSize = "36px";
      const option = document.createElement("div");
      option.dataset.xhPart = "item";
      option.dataset.xhPartOwner = "listbox";
      option.setAttribute("value", items[virtualItem.index].value);
      const text = document.createElement("span");
      text.dataset.xhPart = "item-text";
      text.textContent = items[virtualItem.index].label;
      const indicator = document.createElement("span");
      indicator.dataset.xhPart = "item-indicator";
      option.append(text, indicator);
      shell.append(option);
      return shell;
    }));
    virtualizer.requestUpdate();
    listbox.virtualizer = virtualizer.collectionVirtualizer;
    listbox.requestUpdate();
  }

  render(virtualizer.virtualItems);
  virtualizer.addEventListener("range-change", event => render(event.detail.virtualItems));
<\/script>
`;export{t as default};

var e=`<!-- 大树虚拟化 | 完整树数据负责层级与键盘语义，窗口只挂载当前可见行 -->
<xh-tree id="tree-virtualized">
  <div data-xh-part="root">
    <span data-xh-part="label">项目文件</span>
    <div data-xh-part="tree" style="overflow: visible; max-block-size: none">
      <xh-virtualizer id="tree-virtualizer" count="1000" estimate-size="36" viewport-tab-index="-1">
        <div data-xh-part="root"><div data-xh-part="viewport" style="block-size: 240px"><div data-xh-part="content"></div></div></div>
      </xh-virtualizer>
    </div>
  </div>
</xh-tree>

<script type="module">
  const tree = document.getElementById("tree-virtualized");
  const virtualizer = document.getElementById("tree-virtualizer");
  const content = virtualizer.querySelector('[data-xh-part="content"]');
  const nodes = Array.from({ length: 1000 }, (_, index) => ({ value: \`file-\${index + 1}\`, label: \`文件 \${index + 1}.ts\` }));
  tree.collection = nodes;
  function render(virtualItems) {
    content.replaceChildren(...virtualItems.map((virtualItem) => {
      const shell = document.createElement("div");
      shell.dataset.xhPart = "item";
      shell.setAttribute("value", virtualItem.index);
      shell.style.blockSize = "36px";
      const item = document.createElement("div");
      item.dataset.xhPart = "item";
      item.dataset.xhPartOwner = "tree";
      item.setAttribute("value", nodes[virtualItem.index].value);
      const text = document.createElement("span");
      text.dataset.xhPart = "item-text";
      text.textContent = nodes[virtualItem.index].label;
      const indicator = document.createElement("span");
      indicator.dataset.xhPart = "item-indicator";
      item.append(text, indicator);
      shell.append(item);
      return shell;
    }));
    virtualizer.requestUpdate();
    tree.virtualizer = virtualizer.collectionVirtualizer;
    tree.requestUpdate();
  }
  render(virtualizer.virtualItems);
  virtualizer.addEventListener("range-change", event => render(event.detail.virtualItems));
<\/script>
`;export{e as default};
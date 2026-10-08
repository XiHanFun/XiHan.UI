var e=`<!-- 双侧虚拟化 | 每个面板拥有独立窗口，搬运与搜索仍按该侧完整可见集合计算 -->
<div style="inline-size: 100%; max-inline-size: 640px">
  <xh-transfer id="transfer-virtualized" searchable>
    <div data-xh-part="root">
      <div data-xh-part="source-panel">
        <div data-xh-part="panel-header"><span data-xh-part="panel-title">待选权限</span><span data-xh-part="panel-count"></span><button data-xh-part="select-all-trigger">全选</button></div>
        <input data-xh-part="search" placeholder="搜索待选权限" />
        <div data-xh-part="list"><xh-virtualizer id="transfer-source-virtualizer" estimate-size="36" viewport-tab-index="-1" style="display: contents"><div data-xh-part="root"><div data-xh-part="viewport"><div data-xh-part="content"></div></div></div></xh-virtualizer></div>
        <div data-xh-part="empty">暂无待选权限</div>
      </div>
      <button data-xh-part="to-target-trigger"></button><button data-xh-part="to-source-trigger"></button>
      <div data-xh-part="target-panel">
        <div data-xh-part="panel-header"><span data-xh-part="panel-title">已选权限</span><span data-xh-part="panel-count"></span><button data-xh-part="select-all-trigger">全选</button></div>
        <input data-xh-part="search" placeholder="搜索已选权限" />
        <div data-xh-part="list"><xh-virtualizer id="transfer-target-virtualizer" estimate-size="36" viewport-tab-index="-1" style="display: contents"><div data-xh-part="root"><div data-xh-part="viewport"><div data-xh-part="content"></div></div></div></xh-virtualizer></div>
        <div data-xh-part="empty">暂无已选权限</div>
      </div>
    </div>
  </xh-transfer>
</div>

<script type="module">
  const transfer = document.getElementById("transfer-virtualized");
  const items = Array.from({ length: 500 }, (_, index) => ({ value: \`permission-\${index + 1}\`, label: \`权限 \${index + 1}\` }));
  transfer.collection = items; transfer.value = items.slice(0, 20).map(item => item.value);
  const hosts = { source: document.getElementById("transfer-source-virtualizer"), target: document.getElementById("transfer-target-virtualizer") };
  function sideItems(side) { const targets = new Set(transfer.value ?? []); return items.filter(item => side === "target" ? targets.has(item.value) : !targets.has(item.value)); }
  function render(side, virtualItems) {
    const host = hosts[side]; const visible = sideItems(side); const content = host.querySelector('[data-xh-part="content"]');
    content.replaceChildren(...virtualItems.map((virtualItem) => {
      const shell = document.createElement("div"); shell.dataset.xhPart = "item"; shell.setAttribute("value", virtualItem.index); shell.style.blockSize = "36px";
      const item = document.createElement("div"); item.dataset.xhPart = "item"; item.dataset.xhPartOwner = "transfer"; item.setAttribute("value", visible[virtualItem.index].value);
      const checkbox = document.createElement("span"); checkbox.dataset.xhPart = "item-checkbox";
      const text = document.createElement("span"); text.dataset.xhPart = "item-text"; text.textContent = visible[virtualItem.index].label;
      item.append(checkbox, text); shell.append(item); return shell;
    }));
    host.requestUpdate();
    transfer.virtualizers = { source: hosts.source.collectionVirtualizer, target: hosts.target.collectionVirtualizer };
    transfer.requestUpdate();
  }
  for (const side of ["source", "target"]) {
    const host = hosts[side]; host.count = sideItems(side).length;
    render(side, host.virtualItems); host.addEventListener("range-change", event => render(side, event.detail.virtualItems));
  }
  transfer.addEventListener("value-change", event => { transfer.value = event.detail.value; for (const side of ["source", "target"]) { hosts[side].count = sideItems(side).length; hosts[side].requestUpdate(); } });
<\/script>
`;export{e as default};
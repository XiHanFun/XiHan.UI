const e=`<!-- 随整页滚动 | scrollContainer 设为 window：列表铺在页面里，不另开滚动框，列表上方的内容不必再算 scrollMargin -->
<!-- root 不定高：视口随内容撑开，滚的是整页 -->
<xh-virtualizer id="virtualizer-window" count="200" estimate-size="36" scroll-container="window">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 420px">
    <div data-xh-part="viewport">
      <div data-xh-part="content"></div>
    </div>
  </div>
</xh-virtualizer>

<script type="module">
  const host = document.getElementById("virtualizer-window");
  const content = host.querySelector('[data-xh-part="content"]');
  const nodes = new Map();

  function render(items) {
    const live = new Set();
    for (const item of items) {
      live.add(item.index);
      if (nodes.has(item.index)) continue;
      const el = document.createElement("div");
      el.dataset.xhPart = "item";
      el.setAttribute("value", String(item.index));
      el.style.cssText = "display: flex; align-items: center; height: 36px; padding-inline: 12px; border-block-end: 1px solid var(--xh-border-subtle)";
      el.textContent = \`第 \${item.index + 1} 条\`;
      nodes.set(item.index, el);
      content.append(el);
    }
    for (const [index, el] of nodes) {
      if (live.has(index)) continue;
      el.remove();
      nodes.delete(index);
    }
  }

  render(host.virtualItems);
  host.addEventListener("range-change", event => render(event.detail.virtualItems));
<\/script>
`;export{e as default};

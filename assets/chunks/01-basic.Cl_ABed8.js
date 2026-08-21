const e=`<!-- 基础用法 | 一万条只渲可视区那几条，root 要有确定高度，条目的主轴尺寸由作者按 estimateSize 自己写 -->
<div style="display: grid; gap: 8px; inline-size: 100%; max-inline-size: 420px">
  <xh-virtualizer id="virtualizer-basic" count="10000" estimate-size="36">
    <div data-xh-part="root" style="block-size: 260px">
      <div data-xh-part="viewport">
        <div data-xh-part="content"></div>
      </div>
    </div>
  </xh-virtualizer>
  <span>可视区：<span id="virtualizer-basic-range">—</span></span>
</div>

<script type="module">
  // 条目节点由作者渲：该渲的建出来，走掉的摘掉
  const host = document.getElementById("virtualizer-basic");
  const content = host.querySelector('[data-xh-part="content"]');
  const range = document.getElementById("virtualizer-basic-range");
  const nodes = new Map();

  function render(items) {
    const live = new Set();
    for (const item of items) {
      live.add(item.index);
      if (nodes.has(item.index)) continue;
      const el = document.createElement("div");
      el.dataset.xhPart = "item";
      el.setAttribute("value", String(item.index));
      el.style.cssText =
        "display: flex; align-items: center; height: 36px; padding-inline: 12px; border-block-end: 1px solid var(--xh-border-subtle)";
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

  // 首批在监听挂上之前就算好了，直接从元素上取
  render(host.virtualItems);
  host.addEventListener("change", (event) => {
    render(event.detail.virtualItems);
    range.textContent = \`\${event.detail.startIndex} – \${event.detail.endIndex}\`;
  });
<\/script>
`;export{e as default};

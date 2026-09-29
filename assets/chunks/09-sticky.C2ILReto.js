const e=`<!-- 分组标题 | stickyIndices 登记标题的下标：滚过它之后它钉在起点，下一组的标题滚上来时接替 -->
<!-- 钉住的条目自带实底（--xh-virtualizer-sticky-bg），滚过去的条目从它下面穿过 -->
<xh-virtualizer id="virtualizer-sticky" estimate-size="36">
  <div data-xh-part="root" style="block-size: 260px; inline-size: 100%; max-inline-size: 420px">
    <div data-xh-part="viewport">
      <div data-xh-part="content"></div>
    </div>
  </div>
</xh-virtualizer>

<script type="module">
  const groups = ["A", "B", "C", "D", "E", "F"];
  const rows = groups.flatMap(letter => [
    { header: true, text: letter },
    ...Array.from({ length: 12 }, (_, i) => ({ header: false, text: \`\${letter}\${i + 1} 联系人\` })),
  ]);
  const stickyIndices = rows.flatMap((row, index) => (row.header ? [index] : []));

  const host = document.getElementById("virtualizer-sticky");
  const content = host.querySelector('[data-xh-part="content"]');
  const nodes = new Map();

  function render(items) {
    const live = new Set();
    for (const item of items) {
      live.add(item.index);
      if (nodes.has(item.index)) continue;
      const row = rows[item.index];
      const el = document.createElement("div");
      el.dataset.xhPart = "item";
      el.setAttribute("value", String(item.index));
      el.style.cssText = row.header
        ? "display: flex; align-items: center; height: 36px; padding-inline: 12px; font-weight: 600; color: var(--xh-fg-muted)"
        : "display: flex; align-items: center; height: 36px; padding-inline: 12px; border-block-end: 1px solid var(--xh-border-subtle)";
      el.textContent = row.text;
      nodes.set(item.index, el);
      content.append(el);
    }
    for (const [index, el] of nodes) {
      if (live.has(index)) continue;
      el.remove();
      nodes.delete(index);
    }
  }

  host.stickyIndices = stickyIndices;
  host.count = rows.length;
  host.addEventListener("range-change", event => render(event.detail.virtualItems));
<\/script>
`;export{e as default};

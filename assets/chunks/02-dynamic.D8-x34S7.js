const e=`<!-- 动态高度 | 条目开了 measure 就把真实尺寸回喂给内核，estimateSize 只是首帧的起点，滚过一遍就收敛 -->
<xh-virtualizer id="virtualizer-dynamic" count="500" estimate-size="64">
  <div
    data-xh-part="root"
    style="block-size: 260px; inline-size: 100%; max-inline-size: 420px"
  >
    <div data-xh-part="viewport">
      <div data-xh-part="content"></div>
    </div>
  </div>
</xh-virtualizer>

<script type="module">
  // 每条的文字长度不同，渲出来的高度自然也不同
  const rows = Array.from(
    { length: 500 },
    (_, i) =>
      \`第 \${i + 1} 条 —— \${"这一段是用来把行撑高的占位文字。".repeat((i % 4) + 1)}\`,
  );

  const host = document.getElementById("virtualizer-dynamic");
  const content = host.querySelector('[data-xh-part="content"]');
  const nodes = new Map();

  function render(items, totalSize) {
    const live = new Set();
    for (const item of items) {
      live.add(item.index);
      let el = nodes.get(item.index);
      if (!el) {
        el = document.createElement("div");
        el.dataset.xhPart = "item";
        el.setAttribute("value", String(item.index));
        // 开了 measure 才把实测尺寸回喂给内核
        el.setAttribute("measure", "");
        // 不给主轴尺寸：给了就把测量钉死在估算值上，measure 再也收敛不了
        el.style.cssText =
          "padding: 8px 12px; border-block-end: 1px solid var(--xh-border-subtle); line-height: 20px";
        el.append(rows[item.index], " ", document.createElement("small"));
        nodes.set(item.index, el);
        content.append(el);
      }
      el.lastElementChild.textContent = \`（实测 \${Math.round(item.size)}px · 总长 \${Math.round(totalSize)}px）\`;
    }
    for (const [index, el] of nodes) {
      if (live.has(index)) continue;
      el.remove();
      nodes.delete(index);
    }
  }

  // 首批在监听挂上之前就算好了，直接从元素上取
  render(host.virtualItems, host.totalSize);
  host.addEventListener("change", (event) => {
    render(event.detail.virtualItems, event.detail.totalSize);
  });
<\/script>
`;export{e as default};

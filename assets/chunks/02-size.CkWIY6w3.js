const t=`<!-- 尺寸 | 适配不同的界面密度 -->
<div id="pagination-size" style="inline-size: min(720px, 100%); display: grid; gap: 16px">
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 40px; flex: none; color: var(--xh-fg-muted)">小</span>
    <xh-pagination count="200" page-size="10" default-page="4" size="sm">
      <nav data-xh-part="root">
        <button data-xh-part="prev-trigger"></button>
        <button data-xh-part="item" value="1">1</button>
        <button data-xh-part="item" value="2">2</button>
        <button data-xh-part="item" value="3">3</button>
        <button data-xh-part="item" value="4">4</button>
        <button data-xh-part="item" value="5">5</button>
        <button data-xh-part="ellipsis-trigger" side="end"></button>
        <button data-xh-part="item" value="20">20</button>
        <button data-xh-part="next-trigger"></button>
      </nav>
    </xh-pagination>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 40px; flex: none; color: var(--xh-fg-muted)">中</span>
    <xh-pagination count="200" page-size="10" default-page="4">
      <nav data-xh-part="root">
        <button data-xh-part="prev-trigger"></button>
        <button data-xh-part="item" value="1">1</button>
        <button data-xh-part="item" value="2">2</button>
        <button data-xh-part="item" value="3">3</button>
        <button data-xh-part="item" value="4">4</button>
        <button data-xh-part="item" value="5">5</button>
        <button data-xh-part="ellipsis-trigger" side="end"></button>
        <button data-xh-part="item" value="20">20</button>
        <button data-xh-part="next-trigger"></button>
      </nav>
    </xh-pagination>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 40px; flex: none; color: var(--xh-fg-muted)">大</span>
    <xh-pagination count="200" page-size="10" default-page="4" size="lg">
      <nav data-xh-part="root">
        <button data-xh-part="prev-trigger"></button>
        <button data-xh-part="item" value="1">1</button>
        <button data-xh-part="item" value="2">2</button>
        <button data-xh-part="item" value="3">3</button>
        <button data-xh-part="item" value="4">4</button>
        <button data-xh-part="item" value="5">5</button>
        <button data-xh-part="ellipsis-trigger" side="end"></button>
        <button data-xh-part="item" value="20">20</button>
        <button data-xh-part="next-trigger"></button>
      </nav>
    </xh-pagination>
  </div>
</div>

<script type="module">
  for (const host of document.querySelectorAll(
    "#pagination-size xh-pagination",
  )) {
    const root = host.querySelector('[data-xh-part="root"]');
    const next = root.querySelector('[data-xh-part="next-trigger"]');

    host.addEventListener("page-change", () => {
      for (const node of root.querySelectorAll(
        '[data-xh-part="item"], [data-xh-part="ellipsis-trigger"]',
      ))
        node.remove();
      for (const item of host.pageItems) {
        const el = document.createElement("button");
        if (item.type === "ellipsis") {
          el.dataset.xhPart = "ellipsis-trigger";
          el.setAttribute("side", item.side);
        } else {
          el.dataset.xhPart = "item";
          el.setAttribute("value", String(item.value));
          el.textContent = String(item.value);
        }
        root.insertBefore(el, next);
      }
    });
  }
<\/script>
`;export{t as default};

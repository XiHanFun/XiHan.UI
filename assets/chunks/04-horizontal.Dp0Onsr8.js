const e=`<!-- 横向列表 | horizontal 把主轴换成行内轴：位移改写进行首侧，条目宽度由作者写，gap 由内核直接算进位移 -->
<xh-virtualizer
  id="virtualizer-horizontal"
  count="500"
  estimate-size="120"
  gap="8"
  horizontal
>
  <div
    data-xh-part="root"
    style="block-size: 96px; inline-size: 100%; max-inline-size: 420px"
  >
    <div data-xh-part="viewport">
      <div data-xh-part="content"></div>
    </div>
  </div>
</xh-virtualizer>

<script type="module">
  // 条目节点由作者渲：该渲的建出来，走掉的摘掉
  const host = document.getElementById("virtualizer-horizontal");
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
      el.style.cssText =
        "display: flex; align-items: center; justify-content: center; inline-size: 120px; block-size: 68px; border: 1px solid var(--xh-border-subtle); border-radius: 8px";
      el.textContent = \`第 \${item.index + 1} 张\`;
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
  host.addEventListener("change", (event) => render(event.detail.virtualItems));
<\/script>
`;export{e as default};

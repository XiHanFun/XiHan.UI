const n=`<!-- 与无限滚动合成一条长列表 | 哨兵摆在内容层之后而不是条目之间：窗口外的条目根本没渲染，摆进去的哨兵永远进不了可视区 -->
<style>
  #virtualizer-composed-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--xh-space-2);
    padding: var(--xh-space-3);
    color: var(--xh-fg-muted);
    font-size: var(--xh-font-size-sm);
  }
</style>

<xh-virtualizer id="virtualizer-composed" count="100" estimate-size="36">
  <div data-xh-part="root" style="block-size: 260px; inline-size: 100%; max-inline-size: 420px">
    <div data-xh-part="viewport">
      <div data-xh-part="content"></div>

      <!-- 内容层撑的是已取到的这几页的总长，哨兵紧跟其后，正好落在列表末尾 -->
      <xh-infinite-scroll id="virtualizer-composed-scroll" style="display: contents">
        <div data-xh-part="root" id="virtualizer-composed-more">
          <span id="virtualizer-composed-status" hidden></span>
          <!-- 读屏在虚拟光标模式下不产生滚动事件，这颗按钮是哨兵那条路的键盘等价通路 -->
          <button data-xh-part="load-more-trigger">取下一页</button>
          <div data-xh-part="sentinel"></div>
        </div>
      </xh-infinite-scroll>
    </div>
  </div>
</xh-virtualizer>

<script type="module">
  const PAGE = 100;
  const TOTAL = 400;

  const host = document.getElementById("virtualizer-composed");
  const scroll = document.getElementById("virtualizer-composed-scroll");
  const content = host.querySelector('[data-xh-part="content"]');
  const viewport = host.querySelector('[data-xh-part="viewport"]');
  const trigger = scroll.querySelector('[data-xh-part="load-more-trigger"]');
  const status = document.getElementById("virtualizer-composed-status");

  // 滚动的是视口那一层，提前量按它算；哨兵在同一层里才量得到自己进没进可视区
  scroll.target = viewport;

  let loaded = PAGE;
  let done = false;
  const nodes = new Map();

  // 条目节点由作者渲：该渲的建出来，走掉的摘掉
  function render(items) {
    const live = new Set();
    for (const item of items) {
      live.add(item.index);
      if (nodes.has(item.index)) continue;
      const el = document.createElement("div");
      el.dataset.xhPart = "item";
      el.setAttribute("value", String(item.index));
      el.style.cssText
        = "display: flex; align-items: center; height: 36px; padding-inline: var(--xh-space-3); border-block-end: 1px solid var(--xh-border-subtle)";
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

  function say(text) {
    status.hidden = text === "";
    status.textContent = text;
    trigger.hidden = text !== "";
  }

  // 首批在监听挂上之前就算好了，直接从元素上取
  render(host.virtualItems);
  host.addEventListener("change", (event) => render(event.detail.virtualItems));

  // 取下一页；这里用定时器代替真实请求
  scroll.addEventListener("load", () => {
    if (done) return;
    scroll.loading = true;
    say("正在取下一页…");
    setTimeout(() => {
      loaded = Math.min(loaded + PAGE, TOTAL);
      done = loaded >= TOTAL;
      host.count = loaded;
      scroll.loading = false;
      scroll.disabled = done;
      say(done ? \`没有更多了，共 \${TOTAL} 条\` : "");
    }, 600);
  });
<\/script>
`;export{n as default};

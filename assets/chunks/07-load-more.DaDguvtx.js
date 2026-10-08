var e=`<!-- 加载更多 | 列表末尾放一个按钮追加下一批：取数时按钮转圈、不能重复点，取完了换成提示 -->
<div style="display: grid; gap: var(--xh-space-3); justify-items: center; max-inline-size: 360px">
  <!-- 宿主设 display: contents，列表落在 root 上 -->
  <xh-list split style="display: contents">
    <ul id="list-load-more-root" data-xh-part="root" style="inline-size: 100%"></ul>
  </xh-list>
  <xh-button id="list-load-more-button" variant="subtle">
    <button data-xh-part="root">
      <span data-xh-part="indicator">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
      </span>
      <span data-xh-part="label">加载更多</span>
    </button>
  </xh-button>
</div>

<script type="module">
  const list = document.getElementById("list-load-more-root");
  const button = document.getElementById("list-load-more-button");
  const label = button.querySelector('[data-xh-part="label"]');
  // 模拟分批取数：每次 4 条，共 11 条
  const TOTAL = 11;
  const BATCH = 4;
  function rowsFrom(from) {
    return Array.from({ length: Math.min(BATCH, TOTAL - from) }, (_, i) => ({
      id: from + i,
      name: \`通知 \${from + i + 1}\`,
      desc: \`系统消息 · \${from + i + 1} 小时前\`,
    }));
  }
  function fetchBatch(from) {
    return new Promise(resolve => setTimeout(resolve, 800, rowsFrom(from)));
  }

  // 条目的节点由作者建：写上 data-xh-part，元素看到新节点自动接上
  function itemOf(row) {
    const item = document.createElement("li");
    item.dataset.xhPart = "item";
    const content = document.createElement("div");
    content.dataset.xhPart = "item-content";
    const title = document.createElement("div");
    title.dataset.xhPart = "item-title";
    title.textContent = row.name;
    const desc = document.createElement("div");
    desc.dataset.xhPart = "item-description";
    desc.textContent = row.desc;
    content.append(title, desc);
    item.append(content);
    return item;
  }

  async function loadMore() {
    button.loading = true;
    const rows = await fetchBatch(list.children.length);
    list.append(...rows.map(itemOf));
    button.loading = false;
    if (list.children.length >= TOTAL) {
      button.disabled = true;
      label.textContent = "没有更多了";
    }
  }

  // 第一批随页面一起到
  list.append(...rowsFrom(0).map(itemOf));
  button.addEventListener("click", loadMore);
<\/script>
`;export{e as default};
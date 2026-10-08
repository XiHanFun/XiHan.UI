var e=`<!-- 分页 | 列表只画当前页的条目，末尾接分页：换页时换一段数据，条目与页码各管各的 -->
<div style="display: grid; gap: var(--xh-space-3); max-inline-size: 360px">
  <!-- 宿主设 display: contents，列表落在 root 上 -->
  <xh-list split style="display: contents">
    <ul id="list-pagination-root" data-xh-part="root"></ul>
  </xh-list>
  <!-- 23 条每页 5 条：5 页全部写出，不出省略号 -->
  <xh-pagination id="list-pagination-pages" count="23" page-size="5">
    <nav data-xh-part="root">
      <button data-xh-part="prev-trigger"></button>
      <button data-xh-part="item" value="1">1</button>
      <button data-xh-part="item" value="2">2</button>
      <button data-xh-part="item" value="3">3</button>
      <button data-xh-part="item" value="4">4</button>
      <button data-xh-part="item" value="5">5</button>
      <button data-xh-part="next-trigger"></button>
    </nav>
  </xh-pagination>
</div>

<script type="module">
  const list = document.getElementById("list-pagination-root");
  const pages = document.getElementById("list-pagination-pages");
  // 23 张工单，每页 5 张
  const STATUS = ["待处理", "处理中", "已解决"];
  const tickets = Array.from({ length: 23 }, (_, i) => ({
    id: 1001 + i,
    title: \`工单 #\${1001 + i}\`,
    desc: \`\${STATUS[i % 3]} · 华东区\`,
  }));
  const PAGE_SIZE = 5;

  // 条目的节点由作者建：写上 data-xh-part，元素看到新节点自动接上
  function render(page) {
    list.replaceChildren(...tickets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((t) => {
      const item = document.createElement("li");
      item.dataset.xhPart = "item";
      const content = document.createElement("div");
      content.dataset.xhPart = "item-content";
      const title = document.createElement("div");
      title.dataset.xhPart = "item-title";
      title.textContent = t.title;
      const desc = document.createElement("div");
      desc.dataset.xhPart = "item-description";
      desc.textContent = t.desc;
      content.append(title, desc);
      item.append(content);
      return item;
    }));
  }

  render(1);
  pages.addEventListener("page-change", event => render(event.detail.page));
<\/script>
`;export{e as default};
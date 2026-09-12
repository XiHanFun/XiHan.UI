const t=`<!-- 每页条数 | 控制器就是库里的下拉：档位从 page-size-options 来、档位文字取 translations.pageSizeOption，换档时页码跟着换算，改档前第一条仍留在页内 -->
<xh-pagination
  id="pagination-page-size"
  count="196"
  default-page-size="10"
  default-page="8"
  style="inline-size: 100%"
>
  <nav data-xh-part="root">
    <!-- 挂载点写一个空 div 就够：里头那套下拉的角色节点由元素自己建 -->
    <div data-xh-part="page-size-select"></div>

    <button data-xh-part="prev-trigger"></button>
    <button data-xh-part="item" value="1">1</button>
    <button data-xh-part="ellipsis-trigger" side="start"></button>
    <button data-xh-part="item" value="7">7</button>
    <button data-xh-part="item" value="8">8</button>
    <button data-xh-part="item" value="9">9</button>
    <button data-xh-part="ellipsis-trigger" side="end"></button>
    <button data-xh-part="item" value="20">20</button>
    <button data-xh-part="next-trigger"></button>
    <span id="pagination-page-size-readout" style="flex-basis: 100%">
      第 8 页 · 第 71-80 条，共 196 条
    </span>
  </nav>
</xh-pagination>

<script type="module">
  const host = document.getElementById("pagination-page-size");
  const root = host.querySelector('[data-xh-part="root"]');
  const next = root.querySelector('[data-xh-part="next-trigger"]');
  const readout = document.getElementById("pagination-page-size-readout");

  // 档位表只做取值来源，每一档的文字归文案桶
  host.pageSizeOptions = [10, 20, 50];
  host.translations = { pageSizeOption: (size) => \`\${size} 条 / 页\` };

  // 换档之后总页数与页码都变了，两样都从元素上重读；
  // 条目区间也是它给的，末页不满时右端已经收成实际条数
  function render() {
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
    const { start, end } = host.pageRange;
    readout.textContent = \`第 \${host.currentPage} 页 · 第 \${start}-\${end} 条，共 \${host.count} 条\`;
  }

  // 两条事件都意味着这一页的内容换了，重读一遍取数口就是同一份新状态
  host.addEventListener("page-change", render);
  host.addEventListener("page-size-change", render);
<\/script>
`;export{t as default};

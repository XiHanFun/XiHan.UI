var e=`<!-- 分页 | page-size 让每侧只渲染当前这一页，两侧各翻各的；翻页器用分页组件拼进面板，页码、页数与条数取自面板插槽。全选、计数与搬运仍按整侧算，搜索串一变回到第 1 页 -->
<div id="transfer-paged" style="inline-size: 100%; max-inline-size: 560px">
  <xh-transfer searchable page-size="6">
    <div data-xh-part="root">
      <div data-xh-part="source-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">全部成员</span>
          <button data-xh-part="select-all-trigger">全选</button>
          <span data-xh-part="panel-count"></span>
        </div>
        <input data-xh-part="search" placeholder="搜索成员" />
        <div data-xh-part="list"></div>
        <xh-pagination page-size="6" size="sm" page="1">
          <nav data-xh-part="root">
            <button data-xh-part="prev-trigger"></button>
            <button data-xh-part="item" value="1">1</button>
            <span data-page-total>/ 1</span>
            <button data-xh-part="next-trigger"></button>
          </nav>
        </xh-pagination>
      </div>

      <button data-xh-part="to-target-trigger"></button>
      <button data-xh-part="to-source-trigger"></button>

      <div data-xh-part="target-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">项目成员</span>
          <button data-xh-part="select-all-trigger">全选</button>
          <span data-xh-part="panel-count"></span>
        </div>
        <input data-xh-part="search" placeholder="搜索成员" />
        <div data-xh-part="list"></div>
        <xh-pagination page-size="6" size="sm" page="1">
          <nav data-xh-part="root">
            <button data-xh-part="prev-trigger"></button>
            <button data-xh-part="item" value="1">1</button>
            <span data-page-total>/ 1</span>
            <button data-xh-part="next-trigger"></button>
          </nav>
        </xh-pagination>
      </div>
    </div>
  </xh-transfer>
</div>

<script type="module">
  const stage = document.getElementById("transfer-paged");
  const transfer = stage.querySelector("xh-transfer");

  transfer.collection = Array.from({ length: 40 }, (_, i) => ({
    value: \`member-\${i + 1}\`,
    label: \`成员 \${String(i + 1).padStart(2, "0")}\`,
  }));

  let value = [];
  transfer.value = value;

  const sides = ["source", "target"].map((side) => {
    const panel = stage.querySelector(\`[data-xh-part="\${side}-panel"]\`);
    const state = {
      side,
      list: panel.querySelector('[data-xh-part="list"]'),
      pager: panel.querySelector("xh-pagination"),
      current: panel.querySelector('xh-pagination [data-xh-part="item"]'),
      total: panel.querySelector("[data-page-total]"),
    };
    // 翻页器只报意图，页码由穿梭框收下再回填，两边才对得上
    state.pager.addEventListener("page-change", (event) => {
      transfer.setPage(side, event.detail.page);
      render(state);
    });
    return state;
  });

  function itemNode(item) {
    const el = document.createElement("div");
    el.dataset.xhPart = "item";
    el.setAttribute("value", item.value);
    el.innerHTML =
      '<span data-xh-part="item-checkbox"></span><span data-xh-part="item-text"></span>';
    el.querySelector('[data-xh-part="item-text"]').textContent = item.label;
    return el;
  }

  // 这一页铺哪些条目、共几页、第几页都问组件要：分侧、搜索与分页都在它里面算完了
  function render(state) {
    state.list.replaceChildren(...transfer.visibleItems(state.side).map(itemNode));
    const page = transfer.currentPage(state.side);
    state.pager.count = transfer.filteredItems(state.side).length;
    state.pager.page = page;
    // 简洁翻页器只摆当前这一页：页码按钮跟着换值
    state.current.setAttribute("value", String(page));
    state.current.textContent = String(page);
    state.total.textContent = \`/ \${transfer.pageCount(state.side)}\`;
  }

  function renderAll() {
    for (const state of sides) render(state);
  }

  transfer.addEventListener("value-change", (event) => {
    value = event.detail.value;
    transfer.value = value;
    renderAll();
  });
  // 搜索串住在组件里、不对外派事件；这一条挂在宿主上，跑在组件写给搜索框的处理器之后
  transfer.addEventListener("input", renderAll);

  renderAll();
<\/script>
`;export{e as default};
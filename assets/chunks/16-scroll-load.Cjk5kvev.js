const a=`<!-- 滚动加载 | list 承担选项滚动：滚到底追加下一页，独立加载状态不会混入可选项 -->
<xh-select id="select-scroll" placeholder="请选择">
  <div data-xh-part="root">
    <span data-xh-part="label">工单</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <div data-xh-part="item" value="no-1">
            <span data-xh-part="item-text">第 1 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-2">
            <span data-xh-part="item-text">第 2 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-3">
            <span data-xh-part="item-text">第 3 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-4">
            <span data-xh-part="item-text">第 4 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-5">
            <span data-xh-part="item-text">第 5 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-6">
            <span data-xh-part="item-text">第 6 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-7">
            <span data-xh-part="item-text">第 7 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-8">
            <span data-xh-part="item-text">第 8 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-9">
            <span data-xh-part="item-text">第 9 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-10">
            <span data-xh-part="item-text">第 10 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-11">
            <span data-xh-part="item-text">第 11 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-12">
            <span data-xh-part="item-text">第 12 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-13">
            <span data-xh-part="item-text">第 13 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-14">
            <span data-xh-part="item-text">第 14 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-15">
            <span data-xh-part="item-text">第 15 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-16">
            <span data-xh-part="item-text">第 16 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-17">
            <span data-xh-part="item-text">第 17 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-18">
            <span data-xh-part="item-text">第 18 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-19">
            <span data-xh-part="item-text">第 19 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-20">
            <span data-xh-part="item-text">第 20 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
        <div data-xh-part="loading">加载中…</div>
      </div>
    </div>
  </div>
</xh-select>
<p>已加载 <span id="select-scroll-count">20</span> / 80 条</p>

<script type="module">
  const select = document.getElementById("select-scroll");
  const list = select.querySelector('[data-xh-part="list"]');
  const count = document.getElementById("select-scroll-count");
  const PAGE_SIZE = 20;
  const TOTAL = 80;
  let loaded = PAGE_SIZE;
  let loading = false;

  function makeItem(value, text) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", value);
    const label = document.createElement("span");
    label.dataset.xhPart = "item-text";
    label.textContent = text;
    item.append(label);
    const indicator = document.createElement("span");
    indicator.dataset.xhPart = "item-indicator";
    item.append(indicator);
    return item;
  }

  // 距底不足 8px 视为触底，取下一页
  list.addEventListener("scroll", () => {
    if (loading || loaded >= TOTAL) return;
    if (list.scrollTop + list.clientHeight < list.scrollHeight - 8) return;
    loading = true;
    select.loading = true;
    window.setTimeout(() => {
      for (let i = 0; i < PAGE_SIZE; i += 1)
        list.append(makeItem(\`no-\${loaded + i + 1}\`, \`第 \${loaded + i + 1} 号工单\`));
      loaded += PAGE_SIZE;
      count.textContent = String(loaded);
      loading = false;
      select.loading = false;
    }, 500);
  });
<\/script>
`;export{a as default};

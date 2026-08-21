const n=`<!-- 取到没有了 | 最后一页取完把 disabled 打开，哨兵不再被观察，load 也不再派 -->
<style>
  #infinite-scroll-disabled [data-row] {
    padding: 8px 12px;
  }
  #infinite-scroll-disabled [data-hint] {
    margin: 0;
    padding: 8px 12px;
    color: var(--xh-fg-muted);
  }
</style>

<div id="infinite-scroll-disabled" style="display: grid; gap: 12px; inline-size: 100%">
  <div
    data-shell
    style="
      block-size: 220px;
      overflow: auto;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <!-- 宿主设 display: contents，列表外壳落在 root 上 -->
    <xh-infinite-scroll data-host style="display: contents">
      <div data-xh-part="root">
        <div data-list>
          <div data-row>第 1 条</div>
          <div data-row>第 2 条</div>
          <div data-row>第 3 条</div>
          <div data-row>第 4 条</div>
          <div data-row>第 5 条</div>
          <div data-row>第 6 条</div>
          <div data-row>第 7 条</div>
          <div data-row>第 8 条</div>
          <div data-row>第 9 条</div>
          <div data-row>第 10 条</div>
        </div>
        <p data-loading-hint hidden>正在取下一页…</p>
        <p data-done-hint hidden>没有更多了</p>
        <div data-xh-part="sentinel"></div>
      </div>
    </xh-infinite-scroll>
  </div>

  <span data-readout>第 1 / 3 页 · 共 10 条</span>
</div>

<script type="module">
  const scope = document.getElementById("infinite-scroll-disabled");
  const host = scope.querySelector("[data-host]");
  const shell = scope.querySelector("[data-shell]");
  const list = scope.querySelector("[data-list]");
  const loadingHint = scope.querySelector("[data-loading-hint]");
  const doneHint = scope.querySelector("[data-done-hint]");
  const readout = scope.querySelector("[data-readout]");

  const maxPage = 3;
  let page = 1;

  host.target = shell;

  function append(count) {
    const base = list.childElementCount;
    for (let i = 1; i <= count; i += 1) {
      const row = document.createElement("div");
      row.setAttribute("data-row", "");
      row.textContent = \`第 \${base + i} 条\`;
      list.append(row);
    }
  }

  function render() {
    host.disabled = page >= maxPage;
    doneHint.hidden = page < maxPage;
    readout.textContent = \`第 \${page} / \${maxPage} 页 · 共 \${list.childElementCount} 条\`;
  }

  host.addEventListener("load", () => {
    host.loading = true;
    loadingHint.hidden = false;
    setTimeout(() => {
      append(6);
      page += 1;
      host.loading = false;
      loadingHint.hidden = true;
      render();
    }, 400);
  });

  render();
<\/script>
`;export{n as default};

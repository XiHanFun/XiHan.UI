const n=`<!-- 基础用法 | 哨兵滚进可视区就派 load，取完把 loading 写回 false -->
<style>
  #infinite-scroll-basic-shell [data-row] {
    padding: 8px 12px;
  }
  #infinite-scroll-basic-shell [data-hint] {
    margin: 0;
    padding: 8px 12px;
    color: var(--xh-fg-muted);
  }
</style>

<div
  id="infinite-scroll-basic-shell"
  style="
    block-size: 240px;
    overflow: auto;
    border: 1px solid var(--xh-border-default);
    border-radius: 8px;
  "
>
  <!-- 宿主设 display: contents，列表外壳落在 root 上 -->
  <xh-infinite-scroll id="infinite-scroll-basic" style="display: contents">
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
        <div data-row>第 11 条</div>
        <div data-row>第 12 条</div>
      </div>
      <p data-hint hidden>正在取下一页…</p>
      <!-- 哨兵摆在列表最后一条之后 -->
      <div data-xh-part="sentinel"></div>
    </div>
  </xh-infinite-scroll>
</div>

<script type="module">
  const host = document.getElementById("infinite-scroll-basic");
  const shell = document.getElementById("infinite-scroll-basic-shell");
  const list = host.querySelector("[data-list]");
  const hint = host.querySelector("[data-hint]");

  // target 指向真正在滚的那层；不给就以窗口视口为准。它是 DOM 句柄，只走属性
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

  // 取下一页；这里用定时器代替真实请求
  host.addEventListener("load", () => {
    host.loading = true;
    hint.hidden = false;
    setTimeout(() => {
      append(8);
      host.loading = false;
      hint.hidden = true;
    }, 500);
  });
<\/script>
`;export{n as default};

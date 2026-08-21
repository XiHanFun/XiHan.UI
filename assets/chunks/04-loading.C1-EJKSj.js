const n=`<!-- 取行中 | loading 让日志区报 aria-busy 并把指针换成忙碌态；「正在拉取」那一行是作者自己渲的 -->
<div id="log-loading" style="width: 100%; display: grid; gap: 12px">
  <xh-log id="log-loading-view" rows="7">
    <div data-xh-part="root">
      <div data-xh-part="viewport">
        <div data-xh-part="content" id="log-loading-content">
          <div data-xh-part="line">12:00:01  boot   服务已启动</div>
          <div data-xh-part="line">12:00:02  db     连接池就绪</div>
          <div data-xh-part="line">12:00:03  http   GET /health  200</div>
        </div>
      </div>
    </div>
  </xh-log>

  <div>
    <xh-button id="log-loading-fetch" variant="solid">
      <button data-xh-part="root">再取 5 行</button>
    </xh-button>
  </div>
</div>

<script type="module">
  const stage = document.getElementById("log-loading");
  const view = stage.querySelector("#log-loading-view");
  const content = stage.querySelector("#log-loading-content");
  const fetchMore = stage.querySelector("#log-loading-fetch");

  // 「正在拉取」那一行由作者自己建，取完就撤掉
  const pending = document.createElement("div");
  pending.dataset.xhPart = "line";
  pending.style.color = "var(--xh-fg-muted)";
  pending.textContent = "正在拉取下一批…";

  let loading = false;

  function setLoading(next) {
    loading = next;
    view.loading = next;
    fetchMore.disabled = next;
    if (next) content.append(pending);
    else pending.remove();
  }

  fetchMore.querySelector("button").addEventListener("click", () => {
    if (loading) return;
    setLoading(true);
    window.setTimeout(() => {
      const base = content.children.length - 1;
      for (let i = 1; i <= 5; i += 1) {
        const line = document.createElement("div");
        line.dataset.xhPart = "line";
        line.textContent = \`12:00:0\${base + i}  http   GET /api/items/\${1000 + base + i}  200\`;
        content.insertBefore(line, pending);
      }
      setLoading(false);
    }, 1200);
  });
<\/script>
`;export{n as default};

const n=`<!-- 往前翻历史 | edge 设为 start：哨兵摆在列表开头，更早的消息插在前面，取数期间视口不跳 -->
<style>
  #infinite-scroll-edge-shell [data-row] {
    padding: 8px 12px;
  }
  #infinite-scroll-edge-shell [data-hint] {
    margin: 0;
    padding: 8px 12px;
    color: var(--xh-fg-muted);
  }
</style>

<div
  id="infinite-scroll-edge-shell"
  data-xh-scroll
  style="
    block-size: 240px;
    overflow: auto;
    border: 1px solid var(--xh-border-default);
    border-radius: 8px;
  "
>
  <xh-infinite-scroll id="infinite-scroll-edge" edge="start" style="display: contents">
    <div data-xh-part="root">
      <!-- 哨兵摆在第一条之前 -->
      <div data-xh-part="sentinel"></div>
      <p data-hint>往上翻取更早的消息</p>
      <div data-list></div>
    </div>
  </xh-infinite-scroll>
</div>

<script type="module">
  const host = document.getElementById("infinite-scroll-edge");
  const shell = document.getElementById("infinite-scroll-edge-shell");
  const list = host.querySelector("[data-list]");
  const hint = host.querySelector("[data-hint]");
  let oldest = 100;

  function row(text) {
    const el = document.createElement("div");
    el.setAttribute("data-row", "");
    el.textContent = text;
    return el;
  }

  for (let i = 0; i < 12; i += 1) list.append(row(\`消息 \${oldest + i}\`));
  host.target = shell;
  // 从最新一条看起
  shell.scrollTop = shell.scrollHeight;

  // 取更早的一页；这里用定时器代替真实请求。loading 要如实写：组件靠它知道什么时候守住视口
  host.addEventListener("load", () => {
    host.loading = true;
    hint.textContent = "正在取更早的消息…";
    window.setTimeout(() => {
      oldest -= 8;
      list.prepend(...Array.from({ length: 8 }, (_, i) => row(\`消息 \${oldest + i}\`)));
      host.loading = false;
      host.disabled = oldest <= 60;
      hint.textContent = host.disabled ? "没有更早的消息了" : "往上翻取更早的消息";
    }, 500);
  });
<\/script>
`;export{n as default};

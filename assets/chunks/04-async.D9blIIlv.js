const t=`<!-- 远程检索 | filter 关掉：交进来的 collection 就是此刻该显示的那几条，筛选归服务端；取数期间 loading 让在途占位顶上来、列表压暗一档，空态让位 -->
<div style="display: flex; align-items: center; gap: 12px">
  <xh-command id="command-async" placeholder="搜同事…" filter="false">
    <button data-xh-part="trigger">找一个人</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <input data-xh-part="input" />
        <!-- 交进来的就是该显示的那几条，条目由脚本照单铺开 -->
        <div data-xh-part="list"></div>
        <div data-xh-part="empty">名册里没有这个人</div>
        <div data-xh-part="loading">正在从服务端取…</div>
        <footer data-xh-part="footer">不输字时给的是最近协作过的三位</footer>
      </div>
    </div>
  </xh-command>
  <span id="command-async-picked">还没选过人</span>
</div>

<script type="module">
  const host = document.getElementById("command-async");
  const list = host.querySelector('[data-xh-part="list"]');
  const picked = document.getElementById("command-async-picked");

  // 站在服务端那一头的整份名册，示例里用一次延迟冒充网络
  const roster = [
    { value: "zhangsan", label: "张三 · 平台组" },
    { value: "lisi", label: "李四 · 平台组" },
    { value: "wangwu", label: "王五 · 交易组" },
    { value: "zhaoliu", label: "赵六 · 交易组" },
    { value: "sunqi", label: "孙七 · 风控组" },
  ];

  let timer = 0;
  // 回来的顺序不保证与发出的顺序一致，只认最后一次请求的结果
  let latest = 0;

  function paint(results) {
    host.collection = results;
    list.replaceChildren(
      ...results.map((one) => {
        const item = document.createElement("div");
        item.dataset.xhPart = "item";
        item.setAttribute("value", one.value);
        const text = document.createElement("span");
        text.dataset.xhPart = "item-text";
        text.textContent = one.label;
        item.append(text);
        return item;
      }),
    );
  }

  paint(roster.slice(0, 3));

  host.addEventListener("input-value-change", (event) => {
    clearTimeout(timer);
    host.loading = true;
    const seq = ++latest;
    const keyword = event.detail.inputValue.trim();
    timer = setTimeout(() => {
      if (seq !== latest) return;
      paint(keyword ? roster.filter((one) => one.label.includes(keyword)) : roster.slice(0, 3));
      host.loading = false;
    }, 400);
  });

  host.addEventListener("select", (event) => {
    picked.textContent = \`选了：\${event.detail.label}\`;
  });
<\/script>
`;export{t as default};

const t=`<!-- 三种相位 | 空、在途、还有更多各有部件：给了 collection 时前两者的收放归组件，取下一页那颗钮点了做什么归你 -->
<div style="display: flex; flex-direction: column; gap: 8px; max-inline-size: 320px">
  <xh-listbox id="listbox-phases">
    <div data-xh-part="root">
      <span data-xh-part="label">成员</span>
      <div data-xh-part="content">
        <div data-xh-part="item" value="liuyi">
          <span data-xh-part="item-text">刘一</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="chener">
          <span data-xh-part="item-text">陈二</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="zhangsan">
          <span data-xh-part="item-text">张三</span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
      <div data-xh-part="empty">还没有成员，先取一页试试</div>
      <div data-xh-part="loading">正在取成员…</div>
      <button data-xh-part="load-more-trigger">取下一页</button>
    </div>
  </xh-listbox>
  <button id="listbox-phases-reset" type="button">清空</button>
</div>
<p>已选：<span id="listbox-phases-value">（无）</span></p>

<script type="module">
  const pool = [
    { value: "liuyi", label: "刘一" },
    { value: "chener", label: "陈二" },
    { value: "zhangsan", label: "张三" },
    { value: "lisi", label: "李四" },
    { value: "wangwu", label: "王五" },
    { value: "zhaoliu", label: "赵六" },
  ];

  const list = document.getElementById("listbox-phases");
  const content = list.querySelector('[data-xh-part="content"]');
  const trigger = list.querySelector('[data-xh-part="load-more-trigger"]');
  const readout = document.getElementById("listbox-phases-value");

  // 受控：条目由 collection 铺开，标记里那三条是首屏
  list.value = [];
  list.collection = pool.slice(0, 3);

  // 条目节点跟着 collection 重铺：身份只报 value，文本与禁用都在数据里
  function render() {
    content.replaceChildren();
    for (const node of list.collection) {
      const item = document.createElement("div");
      item.dataset.xhPart = "item";
      item.setAttribute("value", node.value);
      const text = document.createElement("span");
      text.dataset.xhPart = "item-text";
      text.textContent = node.label;
      const mark = document.createElement("span");
      mark.dataset.xhPart = "item-indicator";
      item.append(text, mark);
      content.append(item);
    }
    trigger.hidden = list.collection.length >= pool.length;
  }

  trigger.addEventListener("click", () => {
    list.loading = true;
    window.setTimeout(() => {
      list.collection = pool.slice(0, list.collection.length + 3);
      list.loading = false;
      render();
    }, 600);
  });

  document
    .getElementById("listbox-phases-reset")
    .addEventListener("click", () => {
      list.collection = [];
      render();
    });

  list.addEventListener("value-change", (event) => {
    list.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
<\/script>
`;export{t as default};

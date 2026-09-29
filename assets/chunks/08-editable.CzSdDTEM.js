const t=`<!-- 增删标签 | 关闭钮或 Delete 键关掉标签，新建按钮追加一枚；标签序由数据源持有 -->
<div style="display: grid; gap: var(--xh-space-3); inline-size: 420px; max-inline-size: 100%">
  <xh-button id="tabs-editable-add" variant="outline" style="justify-self: start">
    <button data-xh-part="root">新建草稿</button>
  </xh-button>
  <xh-tabs id="tabs-editable" value="draft-1" closable>
    <div data-xh-part="root">
      <div data-xh-part="list" aria-label="草稿">
        <button data-xh-part="trigger" value="draft-1">草稿 1</button>
        <button data-xh-part="close-trigger" value="draft-1"></button>
        <button data-xh-part="trigger" value="draft-2">草稿 2</button>
        <button data-xh-part="close-trigger" value="draft-2"></button>
        <button data-xh-part="trigger" value="draft-3">草稿 3</button>
        <button data-xh-part="close-trigger" value="draft-3"></button>
        <div data-xh-part="indicator"></div>
      </div>

      <div data-xh-part="content" value="draft-1">草稿 1的正文。</div>
      <div data-xh-part="content" value="draft-2">草稿 2的正文。</div>
      <div data-xh-part="content" value="draft-3">草稿 3的正文。</div>
    </div>
  </xh-tabs>
</div>

<script type="module">
  // 标签序由页面持有：元素只发 tab-close，删不删、选中挪到哪由这里决定
  const tabs = document.getElementById("tabs-editable");
  const root = tabs.querySelector('[data-xh-part="root"]');
  const list = tabs.querySelector('[data-xh-part="list"]');
  const indicator = tabs.querySelector('[data-xh-part="indicator"]');
  const values = () => [...list.querySelectorAll('[data-xh-part="trigger"]')].map((el) => ({ value: el.getAttribute("value") }));
  let next = 4;
  tabs.collection = values();

  tabs.addEventListener("value-change", (event) => {
    tabs.value = event.detail.value;
  });
  // 关掉的是选中标签时，选中挪到原位置上的下一枚（没有就是上一枚）
  tabs.addEventListener("tab-close", (event) => {
    const { value, values: rest } = event.detail;
    const index = tabs.collection.findIndex((node) => node.value === value);
    tabs.querySelectorAll(\`[value="\${value}"]\`).forEach((el) => el.remove());
    tabs.collection = values();
    if (tabs.value === value) tabs.value = rest[Math.min(index, rest.length - 1)] ?? "";
  });
  document.getElementById("tabs-editable-add").addEventListener("click", () => {
    const value = \`draft-\${next}\`;
    const label = \`草稿 \${next}\`;
    next += 1;
    const trigger = document.createElement("button");
    trigger.dataset.xhPart = "trigger";
    trigger.setAttribute("value", value);
    trigger.textContent = label;
    const close = document.createElement("button");
    close.dataset.xhPart = "close-trigger";
    close.setAttribute("value", value);
    list.insertBefore(trigger, indicator);
    list.insertBefore(close, indicator);
    const content = document.createElement("div");
    content.dataset.xhPart = "content";
    content.setAttribute("value", value);
    content.textContent = \`\${label}的正文。\`;
    root.append(content);
    tabs.collection = values();
    tabs.value = value;
  });
<\/script>
`;export{t as default};

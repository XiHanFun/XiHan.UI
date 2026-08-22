const n=`<!-- 拖放换父 | 树从不拥有数据：把 draggable 与拖放监听补在节点上，落点判定与数组搬运都在宿主这边，改完 collection 树自己重推层级 -->
<div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
  <xh-tree id="tree-drag">
    <div data-xh-part="root">
      <span data-xh-part="label">邮箱目录</span>
      <div data-xh-part="tree">
        <div data-xh-part="branch" value="inbox">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-text">收件箱</span>
            <span data-count style="margin-inline-start: auto">2</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="f1">
              <span aria-hidden="true">📄</span>
              <span data-xh-part="item-text">报价单.pdf</span>
            </div>
            <div data-xh-part="item" value="f2">
              <span aria-hidden="true">📄</span>
              <span data-xh-part="item-text">周报.md</span>
            </div>
          </div>
        </div>

        <div data-xh-part="branch" value="archive">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-text">归档</span>
            <span data-count style="margin-inline-start: auto">1</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="f3">
              <span aria-hidden="true">📄</span>
              <span data-xh-part="item-text">去年总结.docx</span>
            </div>
          </div>
        </div>

        <div data-xh-part="branch" value="trash">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-text">回收站</span>
            <span data-count style="margin-inline-start: auto">0</span>
          </div>
          <div data-xh-part="branch-content"></div>
        </div>
      </div>
    </div>
  </xh-tree>
  <span id="tree-drag-log">把文件拖到别的目录上放开</span>
</div>

<script type="module">
  const tree = document.getElementById("tree-drag");
  const log = document.getElementById("tree-drag-log");

  const folders = [
    {
      value: "inbox",
      label: "收件箱",
      children: [
        { value: "f1", label: "报价单.pdf" },
        { value: "f2", label: "周报.md" },
      ],
    },
    {
      value: "archive",
      label: "归档",
      children: [{ value: "f3", label: "去年总结.docx" }],
    },
    { value: "trash", label: "回收站", children: [] },
  ];

  tree.collection = folders;
  tree.expandedValue = ["inbox", "archive", "trash"];
  tree.addEventListener(
    "expanded-change",
    (event) => (tree.expandedValue = event.detail.value),
  );

  let dragging = null;

  function createItem(file) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", file.value);
    item.draggable = true;
    const icon = document.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "📄";
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = file.label;
    item.append(icon, text);

    item.addEventListener("dragstart", (event) => {
      dragging = file.value;
      item.style.opacity = "0.5";
      // 不写载荷有些浏览器不认这次拖拽
      event.dataTransfer.setData("text/plain", file.value);
    });
    item.addEventListener("dragend", () => {
      dragging = null;
      item.style.opacity = "";
    });
    return item;
  }

  function branchOf(value) {
    return tree.querySelector(\`[data-xh-part="branch"][value="\${value}"]\`);
  }

  // 这一支的行数与子层标记照当下的数据重铺
  function renderFolder(folder) {
    const branch = branchOf(folder.value);
    branch.querySelector("[data-count]").textContent = String(folder.children.length);
    branch
      .querySelector(':scope > [data-xh-part="branch-content"]')
      .replaceChildren(...folder.children.map(createItem));
  }

  function move(target) {
    const value = dragging;
    dragging = null;
    if (value == null) return;
    const from = folders.find((f) => f.children.some((c) => c.value === value));
    const to = folders.find((f) => f.value === target);
    // 同一个目录里放开不算搬家
    if (!from || !to || from === to) return;
    const index = from.children.findIndex((c) => c.value === value);
    const [moved] = from.children.splice(index, 1);
    to.children.push(moved);
    renderFolder(from);
    renderFolder(to);
    tree.collection = [...folders];
    log.textContent = \`\${moved.label} 移到了 \${to.label}\`;
  }

  // 落点是目录那一行：拖过去时描一圈虚线，放开就搬
  for (const folder of folders) {
    const control = branchOf(folder.value).querySelector(
      '[data-xh-part="branch-control"]',
    );
    const mark = (on) => {
      control.style.outline = on ? "2px dashed var(--xh-border-strong)" : "";
      control.style.outlineOffset = on ? "-2px" : "";
    };
    control.addEventListener("dragover", (event) => {
      event.preventDefault();
      mark(true);
    });
    control.addEventListener("dragleave", () => mark(false));
    control.addEventListener("drop", (event) => {
      event.preventDefault();
      mark(false);
      move(folder.value);
    });
    renderFolder(folder);
  }
<\/script>
`;export{n as default};

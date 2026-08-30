const n=`<!-- 拖拽搬家 | 整个节点都是拖动源：按住拖到别处松手，也可以 Tab 进树里用 Alt + 上下键在同层挪、Alt + 左右键改层级。三档落点（插在前 / 插在后 / 放进目录里）连同指示线、自我后代守卫与读屏播报都归库；树仍不拥有数据，宿主只管按库报的 value、parent、index 把数组搬一下，外加一条 allowDrop 说这次许不许 -->
<div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
  <!-- 属性名让开 HTML 全局的 draggable：写那个的话浏览器会拿它接管原生拖放 -->
  <xh-tree id="tree-drag-move" node-draggable>
    <span data-xh-part="label">邮箱目录</span>
    <div data-xh-part="tree">
      <div data-xh-part="branch" value="inbox">
        <div data-xh-part="branch-control">
          <button data-xh-part="branch-trigger"></button>
          <span data-xh-part="branch-text">收件箱</span>
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
          <div data-xh-part="item" value="f3">
            <span aria-hidden="true">📄</span>
            <span data-xh-part="item-text">会议纪要.md</span>
          </div>
        </div>
      </div>
      <div data-xh-part="branch" value="archive">
        <div data-xh-part="branch-control">
          <button data-xh-part="branch-trigger"></button>
          <span data-xh-part="branch-text">归档</span>
        </div>
        <div data-xh-part="branch-content">
          <div data-xh-part="item" value="f4">
            <span aria-hidden="true">📄</span>
            <span data-xh-part="item-text">去年总结.docx</span>
          </div>
        </div>
      </div>
      <div data-xh-part="branch" value="trash">
        <div data-xh-part="branch-control">
          <button data-xh-part="branch-trigger"></button>
          <span data-xh-part="branch-text">回收站</span>
        </div>
        <div data-xh-part="branch-content"></div>
      </div>
    </div>
    <!-- 播报区视觉隐藏，必须在拖动开始之前就在 DOM 上 -->
    <div data-xh-part="live-region"></div>
  </xh-tree>
  <span id="tree-drag-log">按住任意一行拖走，或 Tab 进树里按 Alt + 方向键搬</span>
</div>

<script type="module">
  const el = document.getElementById("tree-drag-move");
  const log = document.getElementById("tree-drag-log");

  // 层级数据是数组，只走属性
  const collection = [
    {
      value: "inbox",
      label: "收件箱",
      children: [
        { value: "f1", label: "报价单.pdf" },
        { value: "f2", label: "周报.md" },
        { value: "f3", label: "会议纪要.md" },
      ],
    },
    { value: "archive", label: "归档", children: [{ value: "f4", label: "去年总结.docx" }] },
    { value: "trash", label: "回收站", children: [] },
  ];
  el.collection = collection;
  el.defaultExpandedValue = ["inbox", "archive", "trash"];

  const isFolder = (entry) => Array.isArray(entry.children);
  const folderOf = (value) => collection.filter(isFolder).find((f) => f.value === value);
  const levelOf = (parent) => (parent == null ? collection : folderOf(parent)?.children);

  // 这一次搬家许不许。库自己兜住的是「落进自己的后代」与「落在禁用节点上」，
  // 剩下的是这份数据的规矩：只有目录收得下东西，而且只收文件
  el.allowDrop = (move) => {
    if (move.parent == null) return true;
    return folderOf(move.parent) != null && folderOf(move.value) == null;
  };

  // 树从不拥有数据：库只说搬到哪个父下面的第几位，改数组这一下归宿主。
  // index 已经算过「先摘后插」，照着先摘再插即可
  el.addEventListener("node-move", (event) => {
    const move = event.detail;
    const levels = [collection, ...collection.filter(isFolder).map((f) => f.children)];
    const from = levels.find((level) => level.some((node) => node.value === move.value));
    const into = levelOf(move.parent);
    if (!from || !into) return;
    const [moved] = from.splice(
      from.findIndex((node) => node.value === move.value),
      1,
    );
    if (!moved) return;
    into.splice(move.index, 0, moved);
    // 数组是就地改的，把同一份重新赋回去让元素重推层级
    el.collection = [...collection];
    const where = move.parent == null ? "根层" : (folderOf(move.parent)?.label ?? move.parent);
    log.textContent = \`\${moved.label} 搬到了\${where}第 \${move.index + 1} 位\`;
  });
<\/script>
`;export{n as default};

const n=`<!-- 只挑文件不挑目录 | 选中值与展开态双受控：目录的值不写回，紧跟着那一次收起意图也一并吞掉，点目录就只剩展开收起 -->
<xh-tree-select id="tree-select-file-picker" open="false" placeholder="选一个文件">
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">附件</span>
    <button data-xh-part="trigger">
      <span data-xh-part="value-text"></span>
      <span data-xh-part="indicator">▾</span>
    </button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="tree">
          <div data-xh-part="branch" value="docs">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger">▸</span>
              <span data-xh-part="branch-text">docs</span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="guide">
                <span data-xh-part="item-indicator">✓</span>
                <span data-xh-part="item-text">guide.md</span>
              </div>
              <div data-xh-part="branch" value="i18n">
                <div data-xh-part="branch-control">
                  <span data-xh-part="branch-trigger">▸</span>
                  <span data-xh-part="branch-text">i18n</span>
                </div>
                <div data-xh-part="branch-content">
                  <div data-xh-part="item" value="zh">
                    <span data-xh-part="item-indicator">✓</span>
                    <span data-xh-part="item-text">zh-CN.md</span>
                  </div>
                  <div data-xh-part="item" value="en">
                    <span data-xh-part="item-indicator">✓</span>
                    <span data-xh-part="item-text">en-US.md</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div data-xh-part="branch" value="assets">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger">▸</span>
              <span data-xh-part="branch-text">assets</span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="logo">
                <span data-xh-part="item-indicator">✓</span>
                <span data-xh-part="item-text">logo.svg</span>
              </div>
            </div>
          </div>

          <div data-xh-part="item" value="readme">
            <span data-xh-part="item-indicator">✓</span>
            <span data-xh-part="item-text">README.md</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-tree-select>
<p>已选：<span id="tree-select-file-picker-value">（无）</span></p>

<script type="module">
  const treeSelect = document.getElementById("tree-select-file-picker");
  const files = [
    {
      value: "docs",
      label: "docs",
      children: [
        { value: "guide", label: "guide.md" },
        {
          value: "i18n",
          label: "i18n",
          children: [
            { value: "zh", label: "zh-CN.md" },
            { value: "en", label: "en-US.md" },
          ],
        },
      ],
    },
    {
      value: "assets",
      label: "assets",
      children: [{ value: "logo", label: "logo.svg" }],
    },
    { value: "readme", label: "README.md" },
  ];
  treeSelect.collection = files;
  treeSelect.value = [];
  treeSelect.expandedValue = ["docs"];

  // 目录的值集合：判定这次选中该不该写回
  const dirs = new Set();
  const collectDirs = (nodes) => {
    for (const node of nodes) {
      if (!node.children) continue;
      dirs.add(node.value);
      collectDirs(node.children);
    }
  };
  collectDirs(files);

  const readout = document.getElementById("tree-select-file-picker-value");
  let swallowClose = false;

  treeSelect.addEventListener("value-change", (event) => {
    if (event.detail.value.some((v) => dirs.has(v))) {
      // 目录不进选中值；单选下紧跟着的那次收起随之作废
      swallowClose = true;
      return;
    }
    treeSelect.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });

  treeSelect.addEventListener("open-change", (event) => {
    if (!event.detail.open && swallowClose) {
      swallowClose = false;
      return;
    }
    treeSelect.open = event.detail.open;
  });

  treeSelect.addEventListener(
    "expanded-change",
    (event) => (treeSelect.expandedValue = event.detail.value),
  );
<\/script>
`;export{n as default};

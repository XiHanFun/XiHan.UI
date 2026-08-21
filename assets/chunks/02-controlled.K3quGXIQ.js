const e=`<!-- 选中与展开双受控 | 两份集合都由宿主持有：组件只发事件，宿主写回它才动，回显的就是写回的那两份 -->
<xh-tree-select id="tree-select-controlled" value="guide" placeholder="选一个文件">
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">文档</span>
    <button data-xh-part="trigger">
      <span data-xh-part="value-text"></span>
      <span data-xh-part="indicator">▾</span>
    </button>
    <button data-xh-part="clear-trigger">✕</button>
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
              <div data-xh-part="item" value="draft">
                <span data-xh-part="item-indicator">✓</span>
                <span data-xh-part="item-text">draft.md（禁用）</span>
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
        </div>
      </div>
    </div>
  </div>
</xh-tree-select>
<p>已选：<span id="tree-select-controlled-value">guide</span> · 展开：<span id="tree-select-controlled-expanded">docs</span></p>

<script type="module">
  // draft.md 是禁用叶子：方向键与连打检索跳过它，确认键也不认它
  const treeSelect = document.getElementById("tree-select-controlled");
  treeSelect.collection = [
    {
      value: "docs",
      label: "docs",
      children: [
        { value: "guide", label: "guide.md" },
        { value: "draft", label: "draft.md（禁用）", disabled: true },
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
  ];
  treeSelect.expandedValue = ["docs"];

  const valueOut = document.getElementById("tree-select-controlled-value");
  const expandedOut = document.getElementById("tree-select-controlled-expanded");
  treeSelect.addEventListener("value-change", (event) => {
    treeSelect.value = event.detail.value;
    valueOut.textContent = event.detail.value.join("、") || "（无）";
  });
  treeSelect.addEventListener("expanded-change", (event) => {
    treeSelect.expandedValue = event.detail.value;
    expandedOut.textContent = event.detail.value.join("、") || "（无）";
  });
<\/script>
`;export{e as default};

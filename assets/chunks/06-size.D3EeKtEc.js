const a=`<!-- 尺寸 | size 换掉行高、内边距与字号，不写就是缺省档 -->
<div id="tree-select-size" style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start">
  <xh-tree-select size="sm" placeholder="选一个文件">
    <div data-xh-part="root" style="inline-size: 220px">
      <span data-xh-part="label">sm</span>
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
                <div data-xh-part="item" value="api">
                  <span data-xh-part="item-indicator">✓</span>
                  <span data-xh-part="item-text">api.md</span>
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

  <xh-tree-select placeholder="选一个文件">
    <div data-xh-part="root" style="inline-size: 220px">
      <span data-xh-part="label">缺省</span>
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
                <div data-xh-part="item" value="api">
                  <span data-xh-part="item-indicator">✓</span>
                  <span data-xh-part="item-text">api.md</span>
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

  <xh-tree-select size="lg" placeholder="选一个文件">
    <div data-xh-part="root" style="inline-size: 220px">
      <span data-xh-part="label">lg</span>
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
                <div data-xh-part="item" value="api">
                  <span data-xh-part="item-indicator">✓</span>
                  <span data-xh-part="item-text">api.md</span>
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
</div>

<script type="module">
  // 三份控件共用同一份树数据与同一套展开写回；中间那份不写 size，走皮肤的缺省尺寸
  const files = [
    {
      value: "docs",
      label: "docs",
      children: [
        { value: "guide", label: "guide.md" },
        { value: "api", label: "api.md" },
      ],
    },
    { value: "readme", label: "README.md" },
  ];
  for (const el of document.getElementById("tree-select-size").children) {
    el.collection = files;
    el.expandedValue = ["docs"];
    el.addEventListener("expanded-change", (event) => (el.expandedValue = event.detail.value));
  }
<\/script>
`;export{a as default};

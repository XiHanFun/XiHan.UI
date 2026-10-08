var e=`<!-- 大树虚拟化 | 完整树数据负责层级、选中与键盘语义，窗口只挂载可见行；Virtualizer 的 count 取展开后的可见行数，窗口里的行平铺渲染，缩进按层级由作者给 -->
<xh-tree-select id="tree-select-virtualized" placeholder="选一位成员">
  <div data-xh-part="root">
    <span data-xh-part="label">负责人</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="tree" style="overflow: visible">
          <xh-virtualizer id="tree-select-virtualizer" estimate-size="36" viewport-tab-index="-1">
            <div data-xh-part="root">
              <div data-xh-part="viewport" style="block-size: 240px">
                <div data-xh-part="content"></div>
              </div>
            </div>
          </xh-virtualizer>
        </div>
      </div>
    </div>
  </div>
</xh-tree-select>

<script type="module">
  const treeSelect = document.getElementById("tree-select-virtualized");
  const virtualizer = document.getElementById("tree-select-virtualizer");
  const content = virtualizer.querySelector('[data-xh-part="content"]');

  // 二十个部门，每个部门五十位成员
  const departments = Array.from({ length: 20 }, (_, d) => ({
    value: \`dept-\${d + 1}\`,
    label: \`部门 \${d + 1}\`,
    children: Array.from({ length: 50 }, (_, m) => ({
      value: \`dept-\${d + 1}-\${m + 1}\`,
      label: \`成员 \${d + 1}-\${m + 1}\`,
    })),
  }));

  // 可见行随展开集合现算：count 与窗口里渲染哪一行都按它
  function flatten(nodes, expanded, level = 1, out = []) {
    for (const node of nodes) {
      out.push({ value: node.value, label: node.label, branch: Array.isArray(node.children), level });
      if (node.children && expanded.includes(node.value)) flatten(node.children, expanded, level + 1, out);
    }
    return out;
  }

  let rows = flatten(departments, ["dept-1"]);
  treeSelect.collection = departments;
  treeSelect.expandedValue = ["dept-1"];
  virtualizer.count = rows.length;

  function part(tag, name, text) {
    const node = document.createElement(tag);
    node.dataset.xhPart = name;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // 平铺的行没有子层容器顶出缩进，按层级补上
  function renderRow(row) {
    const node = part("div", row.branch ? "branch" : "item");
    node.dataset.xhPartOwner = "tree-select";
    node.setAttribute("value", row.value);
    node.style.marginInlineStart = \`calc(var(--xh-tree-select-indent, var(--xh-space-4)) * \${row.level - 1})\`;
    if (row.branch) {
      const control = part("div", "branch-control");
      control.append(
        part("span", "branch-trigger"),
        part("span", "branch-text", row.label),
        part("span", "item-indicator"),
      );
      node.append(control);
    } else {
      node.append(part("span", "item-indicator"), part("span", "item-text", row.label));
    }
    return node;
  }

  function render(virtualItems) {
    content.replaceChildren(...virtualItems.map((virtualItem) => {
      const shell = part("div", "item");
      shell.setAttribute("value", virtualItem.index);
      shell.style.blockSize = "36px";
      shell.append(renderRow(rows[virtualItem.index]));
      return shell;
    }));
    virtualizer.requestUpdate();
    treeSelect.virtualizer = virtualizer.collectionVirtualizer;
    treeSelect.requestUpdate();
  }

  virtualizer.addEventListener("range-change", event => render(event.detail.virtualItems));
  // 展开收起：先换可见行与 count，再把展开集合写回元素
  treeSelect.addEventListener("expanded-value-change", (event) => {
    rows = flatten(departments, event.detail.value);
    virtualizer.count = rows.length;
    treeSelect.expandedValue = event.detail.value;
    virtualizer.updateComplete.then(() => render(virtualizer.virtualItems));
  });
  virtualizer.updateComplete.then(() => render(virtualizer.virtualItems));
<\/script>
`;export{e as default};
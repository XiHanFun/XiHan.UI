const t=`<!-- 装不下就收进「更多」 | 宿主自己观测容器宽度，一次收起一个入口直到这排不再溢出；收起来的那几张菜单在「更多」里各占一组 -->
<div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
  <div id="menubar-overflow-widths" style="display: flex; flex-wrap: wrap; gap: 8px">
    <xh-button size="sm" variant="solid" data-width="560">
      <button data-xh-part="root">560 像素</button>
    </xh-button>
    <xh-button size="sm" variant="outline" data-width="380">
      <button data-xh-part="root">380 像素</button>
    </xh-button>
    <xh-button size="sm" variant="outline" data-width="240">
      <button data-xh-part="root">240 像素</button>
    </xh-button>
  </div>

  <!-- 溢出裁在这一层，量的也是这一层 -->
  <div id="menubar-overflow-box" style="inline-size: 560px; max-inline-size: 100%; overflow: hidden">
    <xh-menubar id="menubar-overflow">
      <div data-xh-part="root">
        <button data-xh-part="trigger" value="file">文件</button>
        <button data-xh-part="trigger" value="edit">编辑</button>
        <button data-xh-part="trigger" value="view">视图</button>
        <button data-xh-part="trigger" value="insert">插入</button>
        <button data-xh-part="trigger" value="format">格式</button>
        <button data-xh-part="trigger" value="tools">工具</button>
        <button data-xh-part="trigger" value="help">帮助</button>
        <button data-xh-part="trigger" value="more">更多</button>

        <div data-xh-part="positioner" value="file">
          <div data-xh-part="content" value="file">
            <div data-xh-part="item" value="new">
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="open">
              <span data-xh-part="item-text">打开</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="edit">
          <div data-xh-part="content" value="edit">
            <div data-xh-part="item" value="undo">
              <span data-xh-part="item-text">撤销</span>
            </div>
            <div data-xh-part="item" value="redo">
              <span data-xh-part="item-text">重做</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="view">
          <div data-xh-part="content" value="view">
            <div data-xh-part="item" value="zoom-in">
              <span data-xh-part="item-text">放大</span>
            </div>
            <div data-xh-part="item" value="zoom-out">
              <span data-xh-part="item-text">缩小</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="insert">
          <div data-xh-part="content" value="insert">
            <div data-xh-part="item" value="image">
              <span data-xh-part="item-text">图片</span>
            </div>
            <div data-xh-part="item" value="table">
              <span data-xh-part="item-text">表格</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="format">
          <div data-xh-part="content" value="format">
            <div data-xh-part="item" value="bold">
              <span data-xh-part="item-text">加粗</span>
            </div>
            <div data-xh-part="item" value="italic">
              <span data-xh-part="item-text">倾斜</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="tools">
          <div data-xh-part="content" value="tools">
            <div data-xh-part="item" value="spell">
              <span data-xh-part="item-text">拼写检查</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="help">
          <div data-xh-part="content" value="help">
            <div data-xh-part="item" value="about">
              <span data-xh-part="item-text">关于</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="more">
          <div data-xh-part="content" value="more">
            <div data-xh-part="group" value="file">
              <span data-xh-part="group-label">文件</span>
              <div data-xh-part="item" value="file:new">
                <span data-xh-part="item-text">新建</span>
              </div>
              <div data-xh-part="item" value="file:open">
                <span data-xh-part="item-text">打开</span>
              </div>
            </div>
            <div data-xh-part="group" value="edit">
              <span data-xh-part="group-label">编辑</span>
              <div data-xh-part="item" value="edit:undo">
                <span data-xh-part="item-text">撤销</span>
              </div>
              <div data-xh-part="item" value="edit:redo">
                <span data-xh-part="item-text">重做</span>
              </div>
            </div>
            <div data-xh-part="group" value="view">
              <span data-xh-part="group-label">视图</span>
              <div data-xh-part="item" value="view:zoom-in">
                <span data-xh-part="item-text">放大</span>
              </div>
              <div data-xh-part="item" value="view:zoom-out">
                <span data-xh-part="item-text">缩小</span>
              </div>
            </div>
            <div data-xh-part="group" value="insert">
              <span data-xh-part="group-label">插入</span>
              <div data-xh-part="item" value="insert:image">
                <span data-xh-part="item-text">图片</span>
              </div>
              <div data-xh-part="item" value="insert:table">
                <span data-xh-part="item-text">表格</span>
              </div>
            </div>
            <div data-xh-part="group" value="format">
              <span data-xh-part="group-label">格式</span>
              <div data-xh-part="item" value="format:bold">
                <span data-xh-part="item-text">加粗</span>
              </div>
              <div data-xh-part="item" value="format:italic">
                <span data-xh-part="item-text">倾斜</span>
              </div>
            </div>
            <div data-xh-part="group" value="tools">
              <span data-xh-part="group-label">工具</span>
              <div data-xh-part="item" value="tools:spell">
                <span data-xh-part="item-text">拼写检查</span>
              </div>
            </div>
            <div data-xh-part="group" value="help">
              <span data-xh-part="group-label">帮助</span>
              <div data-xh-part="item" value="help:about">
                <span data-xh-part="item-text">关于</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </xh-menubar>
  </div>

  <span>
    在场入口 <span id="menubar-overflow-shown">7</span> / 7；最近选中：<span id="menubar-overflow-picked">（无）</span>
  </span>
</div>

<script type="module">
  const menubar = document.getElementById("menubar-overflow");
  const box = document.getElementById("menubar-overflow-box");
  const root = menubar.querySelector('[data-xh-part="root"]');
  const moreContent = menubar.querySelector('[data-xh-part="content"][value="more"]');
  const moreTrigger = root.querySelector('[data-xh-part="trigger"][value="more"]');
  // 入口一律插在首个浮层之前，方向键的行程才与视觉顺序一致
  const anchor = root.querySelector('[data-xh-part="positioner"]');
  const order = ["file", "edit", "view", "insert", "format", "tools", "help"];

  const pick = (selector) => menubar.querySelector(selector);
  const triggers = order.map((v) => pick(\`[data-xh-part="trigger"][value="\${v}"]\`));
  const groups = order.map((v) => pick(\`[data-xh-part="group"][value="\${v}"]\`));
  const shownReadout = document.getElementById("menubar-overflow-shown");

  // 前 count 个入口留在这一排，其余各自的那一组进「更多」
  function show(count) {
    for (const node of [...triggers, moreTrigger, ...groups]) node.remove();
    for (let i = 0; i < count; i++) root.insertBefore(triggers[i], anchor);
    for (let i = count; i < order.length; i++) moreContent.append(groups[i]);
    if (count < order.length) root.insertBefore(moreTrigger, anchor);
    shownReadout.textContent = String(count);
  }

  // 先全铺开，再一次收一个，直到这排不再溢出
  function reflow() {
    show(order.length);
    let count = order.length;
    while (count > 1 && box.scrollWidth > box.clientWidth + 1) {
      count -= 1;
      show(count);
    }
  }

  new ResizeObserver(reflow).observe(box);

  const widths = document.getElementById("menubar-overflow-widths");
  for (const button of widths.querySelectorAll("[data-width]")) {
    button.addEventListener("click", () => {
      box.style.inlineSize = \`\${button.dataset.width}px\`;
      for (const other of widths.querySelectorAll("[data-width]")) {
        other.variant = other === button ? "solid" : "outline";
      }
    });
  }

  const picked = document.getElementById("menubar-overflow-picked");
  menubar.addEventListener("select", (event) => {
    picked.textContent = \`\${event.detail.menu} / \${event.detail.value}\`;
  });
<\/script>
`;export{t as default};

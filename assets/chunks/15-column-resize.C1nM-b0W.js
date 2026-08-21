const e=`<!-- 拖拽调列宽 | 列宽的事实源是 columns[].width，把手只是列标题里的一段标记：按下量起点，移动改宽度，连接层随即写进列标题与整列单元格 -->
<div id="table-resize" style="width: 100%; max-width: 560px; display: grid; gap: 12px">
  <xh-table id="table-resize-table">
    <div data-xh-part="root">
      <div data-xh-part="caption">拖动列标题右侧那条竖线</div>
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="name">
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis">姓名</span>
            <!-- 把手与排序把手是兄弟节点，拖它不会连带触发排序 -->
            <span aria-hidden="true" data-handle style="flex: none; align-self: stretch; inline-size: 6px; cursor: col-resize; background: var(--xh-border-default); touch-action: none"></span>
          </div>
          <div data-xh-part="column-header" value="dept">
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis">部门</span>
            <span aria-hidden="true" data-handle style="flex: none; align-self: stretch; inline-size: 6px; cursor: col-resize; background: var(--xh-border-default); touch-action: none"></span>
          </div>
          <div data-xh-part="column-header" value="city">
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis">城市</span>
            <span aria-hidden="true" data-handle style="flex: none; align-self: stretch; inline-size: 6px; cursor: col-resize; background: var(--xh-border-default); touch-action: none"></span>
          </div>
        </div>
      </div>
      <div data-xh-part="body">
        <div data-xh-part="row" value="u1">
          <div data-xh-part="cell" value="name">赵一</div>
          <div data-xh-part="cell" value="dept">平台研发</div>
          <div data-xh-part="cell" value="city">杭州</div>
        </div>
        <div data-xh-part="row" value="u2">
          <div data-xh-part="cell" value="name">钱二</div>
          <div data-xh-part="cell" value="dept">前端体验</div>
          <div data-xh-part="cell" value="city">上海</div>
        </div>
        <div data-xh-part="row" value="u3">
          <div data-xh-part="cell" value="name">孙三</div>
          <div data-xh-part="cell" value="dept">基础架构</div>
          <div data-xh-part="cell" value="city">北京</div>
        </div>
        <div data-xh-part="row" value="u4">
          <div data-xh-part="cell" value="name">李四</div>
          <div data-xh-part="cell" value="dept">质量保障</div>
          <div data-xh-part="cell" value="city">成都</div>
        </div>
      </div>
    </div>
  </xh-table>
  <span id="table-resize-value"></span>
</div>

<script type="module">
  const stage = document.getElementById("table-resize");
  const table = stage.querySelector("#table-resize-table");
  const readout = stage.querySelector("#table-resize-value");

  // 列宽写成数字即按 px 处理
  const columns = [
    { id: "name", label: "姓名", width: 120 },
    { id: "dept", label: "部门", width: 150 },
    { id: "city", label: "城市", width: 120 },
  ];

  table.rows = [{ id: "u1" }, { id: "u2" }, { id: "u3" }, { id: "u4" }];

  const MIN_WIDTH = 72;
  let grabbed = null;

  function apply() {
    table.columns = [...columns];
    readout.textContent = \`列宽：\${columns.map((c) => \`\${c.label} \${c.width}px\`).join(" · ")}\`;
  }

  for (const handle of stage.querySelectorAll("[data-handle]")) {
    const id = handle.closest('[data-xh-part="column-header"]').getAttribute("value");

    handle.addEventListener("pointerdown", (event) => {
      const col = columns.find((c) => c.id === id);
      grabbed = { id, startX: event.clientX, startWidth: col.width };
      // 捕获指针：手滑出把手后的 move / up 仍送到这里
      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    handle.addEventListener("pointermove", (event) => {
      if (!grabbed) return;
      const col = columns.find((c) => c.id === grabbed.id);
      col.width = Math.max(
        MIN_WIDTH,
        grabbed.startWidth + event.clientX - grabbed.startX,
      );
      apply();
    });

    handle.addEventListener("pointerup", () => (grabbed = null));
    handle.addEventListener("pointercancel", () => (grabbed = null));
  }

  apply();
<\/script>
`;export{e as default};

const t=`<!-- 空态与加载态 | 两个状态节点常挂着只靠 hidden 显隐：表体为空且在取数时露加载态，取数完了没有行才露空态 -->
<div id="table-states" style="width: 100%; max-width: 480px; display: grid; gap: 12px">
  <div style="display: flex; gap: 8px">
    <button type="button" id="table-states-load">取数</button>
    <button type="button" id="table-states-reset">清空</button>
  </div>

  <xh-table id="table-states-table">
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="name">任务</div>
          <div data-xh-part="column-header" value="owner">负责人</div>
        </div>
      </div>
      <div data-xh-part="body"></div>
      <div data-xh-part="loading-state">正在取数…</div>
      <div data-xh-part="empty">还没有任务，点「取数」拉一份。</div>
    </div>
  </xh-table>
</div>

<script type="module">
  const source = [
    { id: "t1", name: "构建流水线", owner: "赵一" },
    { id: "t2", name: "组件回归", owner: "钱二" },
    { id: "t3", name: "文档校订", owner: "孙三" },
  ];

  const stage = document.getElementById("table-states");
  const table = stage.querySelector("#table-states-table");
  const body = table.querySelector('[data-xh-part="body"]');

  table.columns = [
    { id: "name", label: "任务", width: "10rem" },
    { id: "owner", label: "负责人" },
  ];

  // 表体为空与否按 rows 推导，不必另写 empty
  function setTasks(tasks) {
    body.replaceChildren(
      ...tasks.map((task) => {
        const row = document.createElement("div");
        row.dataset.xhPart = "row";
        row.setAttribute("value", task.id);
        for (const [id, text] of [
          ["name", task.name],
          ["owner", task.owner],
        ]) {
          const cell = document.createElement("div");
          cell.dataset.xhPart = "cell";
          cell.setAttribute("value", id);
          cell.textContent = text;
          row.append(cell);
        }
        return row;
      }),
    );
    table.rows = tasks.map((task) => ({ id: task.id }));
  }

  let timer = 0;

  stage.querySelector("#table-states-load").addEventListener("click", () => {
    window.clearTimeout(timer);
    setTasks([]);
    table.loading = true;
    timer = window.setTimeout(() => {
      setTasks(source);
      table.loading = false;
    }, 1200);
  });

  stage.querySelector("#table-states-reset").addEventListener("click", () => {
    window.clearTimeout(timer);
    setTasks([]);
    table.loading = false;
  });

  setTasks([]);
<\/script>
`;export{t as default};

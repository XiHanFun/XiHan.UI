const e=`<!-- 列过滤 | 过滤把手是列标题里的一段内容，过滤结果就是宿主算好后传进来的那份 rows；表头是表体的兄弟，把手上的按键不会被表体收走 -->
<div id="table-filter" style="width: 100%; max-width: 560px; display: grid; gap: 12px">
  <xh-table id="table-filter-table">
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="name">姓名</div>
          <div data-xh-part="column-header" value="dept">
            部门
            <xh-popover placement="bottom-start" size="sm">
              <button data-xh-part="trigger" aria-label="按部门过滤" data-mark>▾</button>
              <div data-xh-part="positioner">
                <div data-xh-part="content">
                  <h2 data-xh-part="title">按部门过滤</h2>
                  <div style="display: grid; gap: 6px; min-inline-size: 8rem">
                    <label style="display: flex; align-items: center; gap: 6px">
                      <input type="checkbox" data-filter="dept" value="平台研发" />
                      平台研发
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px">
                      <input type="checkbox" data-filter="dept" value="前端体验" />
                      前端体验
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px">
                      <input type="checkbox" data-filter="dept" value="基础架构" />
                      基础架构
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px">
                      <input type="checkbox" data-filter="dept" value="质量保障" />
                      质量保障
                    </label>
                    <button type="button" data-clear="dept">不限</button>
                  </div>
                </div>
              </div>
            </xh-popover>
          </div>
          <div data-xh-part="column-header" value="city">
            城市
            <xh-popover placement="bottom-start" size="sm">
              <button data-xh-part="trigger" aria-label="按城市过滤" data-mark>▾</button>
              <div data-xh-part="positioner">
                <div data-xh-part="content">
                  <h2 data-xh-part="title">按城市过滤</h2>
                  <div style="display: grid; gap: 6px; min-inline-size: 8rem">
                    <label style="display: flex; align-items: center; gap: 6px">
                      <input type="checkbox" data-filter="city" value="杭州" />
                      杭州
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px">
                      <input type="checkbox" data-filter="city" value="上海" />
                      上海
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px">
                      <input type="checkbox" data-filter="city" value="北京" />
                      北京
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px">
                      <input type="checkbox" data-filter="city" value="成都" />
                      成都
                    </label>
                    <button type="button" data-clear="city">不限</button>
                  </div>
                </div>
              </div>
            </xh-popover>
          </div>
        </div>
      </div>
      <div data-xh-part="body"></div>
      <div data-xh-part="empty">这组条件下没有人。</div>
    </div>
  </xh-table>
  <span id="table-filter-value"></span>
</div>

<script type="module">
  const members = [
    { id: "u1", name: "赵一", dept: "平台研发", city: "杭州" },
    { id: "u2", name: "钱二", dept: "前端体验", city: "上海" },
    { id: "u3", name: "孙三", dept: "基础架构", city: "北京" },
    { id: "u4", name: "李四", dept: "前端体验", city: "杭州" },
    { id: "u5", name: "周五", dept: "质量保障", city: "成都" },
    { id: "u6", name: "吴六", dept: "平台研发", city: "上海" },
  ];

  const stage = document.getElementById("table-filter");
  const table = stage.querySelector("#table-filter-table");
  const body = table.querySelector('[data-xh-part="body"]');
  const readout = stage.querySelector("#table-filter-value");

  table.columns = [
    { id: "name", label: "姓名", width: "7rem" },
    { id: "dept", label: "部门", width: "9rem" },
    { id: "city", label: "城市" },
  ];

  // 行节点建一次，过滤只决定谁留在表体里
  const nodes = new Map(
    members.map((m) => {
      const row = document.createElement("div");
      row.dataset.xhPart = "row";
      row.setAttribute("value", m.id);
      for (const id of ["name", "dept", "city"]) {
        const cell = document.createElement("div");
        cell.dataset.xhPart = "cell";
        cell.setAttribute("value", id);
        cell.textContent = m[id];
        row.append(cell);
      }
      return [m.id, row];
    }),
  );

  const boxes = [...stage.querySelectorAll("input[data-filter]")];

  // 过滤态由宿主持有，一个都没勾就是不过滤
  function picked(field) {
    return boxes.filter((b) => b.dataset.filter === field && b.checked).map((b) => b.value);
  }

  function render() {
    const dept = picked("dept");
    const city = picked("city");
    const visible = members.filter(
      (m) =>
        (dept.length === 0 || dept.includes(m.dept)) &&
        (city.length === 0 || city.includes(m.city)),
    );

    // 行序的事实源跟着过滤结果走
    table.rows = visible.map((m) => ({ id: m.id }));
    body.replaceChildren(...visible.map((m) => nodes.get(m.id)));

    for (const mark of stage.querySelectorAll("[data-mark]")) {
      const field = mark.closest('[data-xh-part="column-header"]').getAttribute("value");
      mark.textContent = picked(field).length ? "▾●" : "▾";
    }

    readout.textContent = \`命中 \${visible.length} / \${members.length} 人 · 部门：\${
      dept.length ? dept.join("、") : "不限"
    } · 城市：\${city.length ? city.join("、") : "不限"}\`;
  }

  for (const box of boxes) box.addEventListener("change", render);

  for (const clear of stage.querySelectorAll("[data-clear]")) {
    clear.addEventListener("click", () => {
      for (const box of boxes) {
        if (box.dataset.filter === clear.dataset.clear) box.checked = false;
      }
      render();
    });
  }

  render();
<\/script>
`;export{e as default};

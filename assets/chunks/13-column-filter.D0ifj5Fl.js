var e=`<!-- 列过滤 | 过滤按钮是列标题中的一段内容，过滤结果就是宿主计算后传入的 rows；表头是表体的兄弟，按钮上的按键不会被表体接管 -->
<div id="table-filter" style="width: 100%; max-width: 560px; display: grid; gap: 12px">
  <xh-table id="table-filter-table">
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="name"><span data-xh-part="column-label">姓名</span></div>
          <div data-xh-part="column-header" value="dept">
            <span data-xh-part="column-label">部门</span>
            <xh-popover placement="bottom-start" size="sm">
              <button data-xh-part="trigger" aria-label="按部门过滤" data-mark><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 5h17L14 12.5V19l-4 2v-8.5L3.5 5Z"/></svg></button>
              <div data-xh-part="positioner">
                <div data-xh-part="content">
                  <h2 data-xh-part="title">按部门过滤</h2>
                  <div style="display: grid; gap: 6px; min-inline-size: 8rem">
                    <xh-checkbox-group id="table-filter-dept" size="sm">
                      <div data-xh-part="root" aria-label="部门">
                        <div data-xh-part="item" value="平台研发">
                          <input data-xh-part="hidden-input" />
                          <span data-xh-part="indicator"></span>
                          <span data-xh-part="item-text">平台研发</span>
                        </div>
                        <div data-xh-part="item" value="前端体验">
                          <input data-xh-part="hidden-input" />
                          <span data-xh-part="indicator"></span>
                          <span data-xh-part="item-text">前端体验</span>
                        </div>
                        <div data-xh-part="item" value="基础架构">
                          <input data-xh-part="hidden-input" />
                          <span data-xh-part="indicator"></span>
                          <span data-xh-part="item-text">基础架构</span>
                        </div>
                        <div data-xh-part="item" value="质量保障">
                          <input data-xh-part="hidden-input" />
                          <span data-xh-part="indicator"></span>
                          <span data-xh-part="item-text">质量保障</span>
                        </div>
                      </div>
                    </xh-checkbox-group>
                    <xh-button id="table-filter-dept-clear" size="sm" variant="outline">
                      <button data-xh-part="root">不限</button>
                    </xh-button>
                  </div>
                </div>
              </div>
            </xh-popover>
          </div>
          <div data-xh-part="column-header" value="city">
            <span data-xh-part="column-label">城市</span>
            <xh-popover placement="bottom-start" size="sm">
              <button data-xh-part="trigger" aria-label="按城市过滤" data-mark><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 5h17L14 12.5V19l-4 2v-8.5L3.5 5Z"/></svg></button>
              <div data-xh-part="positioner">
                <div data-xh-part="content">
                  <h2 data-xh-part="title">按城市过滤</h2>
                  <div style="display: grid; gap: 6px; min-inline-size: 8rem">
                    <xh-checkbox-group id="table-filter-city" size="sm">
                      <div data-xh-part="root" aria-label="城市">
                        <div data-xh-part="item" value="杭州">
                          <input data-xh-part="hidden-input" />
                          <span data-xh-part="indicator"></span>
                          <span data-xh-part="item-text">杭州</span>
                        </div>
                        <div data-xh-part="item" value="上海">
                          <input data-xh-part="hidden-input" />
                          <span data-xh-part="indicator"></span>
                          <span data-xh-part="item-text">上海</span>
                        </div>
                        <div data-xh-part="item" value="北京">
                          <input data-xh-part="hidden-input" />
                          <span data-xh-part="indicator"></span>
                          <span data-xh-part="item-text">北京</span>
                        </div>
                        <div data-xh-part="item" value="成都">
                          <input data-xh-part="hidden-input" />
                          <span data-xh-part="indicator"></span>
                          <span data-xh-part="item-text">成都</span>
                        </div>
                      </div>
                    </xh-checkbox-group>
                    <xh-button id="table-filter-city-clear" size="sm" variant="outline">
                      <button data-xh-part="root">不限</button>
                    </xh-button>
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
  <span id="table-filter-value" data-demo-output></span>
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

  // 过滤态由宿主持有，一个都没勾就是不过滤
  const picked = { dept: [], city: [] };

  function render() {
    const { dept, city } = picked;
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
      mark.innerHTML = \`<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 5h17L14 12.5V19l-4 2v-8.5L3.5 5Z"/></svg>\`;
      mark.style.color = picked[field].length ? "var(--xh-fg-brand)" : "";
    }

    readout.textContent = \`命中 \${visible.length} / \${members.length} 人 · 部门：\${
      dept.length ? dept.join("、") : "不限"
    } · 城市：\${city.length ? city.join("、") : "不限"}\`;
  }

  // 两组勾选受控：勾选与「不限」都经这里写回
  for (const field of Object.keys(picked)) {
    const group = document.getElementById(\`table-filter-\${field}\`);
    const apply = (next) => {
      picked[field] = next;
      group.value = next;
      render();
    };
    group.value = picked[field];
    group.addEventListener("value-change", (event) => apply(event.detail.value));
    document.getElementById(\`table-filter-\${field}-clear\`).addEventListener("click", () => apply([]));
  }

  render();
<\/script>
`;export{e as default};
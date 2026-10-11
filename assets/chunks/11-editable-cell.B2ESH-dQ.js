var e=`<!-- 单元格就地编辑 | 表体的方向键与 Home/End 是挂在 body 上的冒泡监听，可编辑控件上阻止冒泡后这些键就回归输入框自身 -->
<div id="table-edit" style="width: 100%; max-width: 560px; display: grid; gap: 12px">
  <xh-table id="table-edit-table">
    <div data-xh-part="root">
      <div data-xh-part="caption">采购清单</div>
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="item"><span data-xh-part="column-label">条目</span></div>
          <div data-xh-part="column-header" value="count"><span data-xh-part="column-label">数量</span></div>
          <div data-xh-part="column-header" value="note"><span data-xh-part="column-label">备注</span></div>
        </div>
      </div>
      <div data-xh-part="body">
        <div data-xh-part="row" value="l1">
          <div data-xh-part="cell" value="item">键盘</div>
          <div data-xh-part="cell" value="count">
            <xh-number-field default-value="2" min="0" size="sm">
              <div data-xh-part="root">
                <div data-xh-part="control">
                  <input data-xh-part="input" aria-label="键盘 数量" />
                </div>
              </div>
            </xh-number-field>
          </div>
          <div data-xh-part="cell" value="note">
            <xh-text-field default-value="机械轴" placeholder="可以打空格" size="sm">
              <div data-xh-part="root">
                <div data-xh-part="control">
                  <input data-xh-part="input" aria-label="键盘 备注" />
                </div>
              </div>
            </xh-text-field>
          </div>
        </div>
        <div data-xh-part="row" value="l2">
          <div data-xh-part="cell" value="item">鼠标</div>
          <div data-xh-part="cell" value="count">
            <xh-number-field default-value="3" min="0" size="sm">
              <div data-xh-part="root">
                <div data-xh-part="control">
                  <input data-xh-part="input" aria-label="鼠标 数量" />
                </div>
              </div>
            </xh-number-field>
          </div>
          <div data-xh-part="cell" value="note">
            <xh-text-field default-value="无线" placeholder="可以打空格" size="sm">
              <div data-xh-part="root">
                <div data-xh-part="control">
                  <input data-xh-part="input" aria-label="鼠标 备注" />
                </div>
              </div>
            </xh-text-field>
          </div>
        </div>
        <div data-xh-part="row" value="l3">
          <div data-xh-part="cell" value="item">显示器支架</div>
          <div data-xh-part="cell" value="count">
            <xh-number-field default-value="1" min="0" size="sm">
              <div data-xh-part="root">
                <div data-xh-part="control">
                  <input data-xh-part="input" aria-label="显示器支架 数量" />
                </div>
              </div>
            </xh-number-field>
          </div>
          <div data-xh-part="cell" value="note">
            <xh-text-field placeholder="可以打空格" size="sm">
              <div data-xh-part="root">
                <div data-xh-part="control">
                  <input data-xh-part="input" aria-label="显示器支架 备注" />
                </div>
              </div>
            </xh-text-field>
          </div>
        </div>
      </div>
    </div>
  </xh-table>
  <span id="table-edit-total" data-demo-output></span>
</div>

<script type="module">
  const stage = document.getElementById("table-edit");
  const table = stage.querySelector("#table-edit-table");
  const total = stage.querySelector("#table-edit-total");

  table.columns = [
    { id: "item", label: "条目", width: "9rem" },
    { id: "count", label: "数量", width: "6rem" },
    { id: "note", label: "备注" },
  ];
  // 行序不随编辑变化，rows 给一次即可
  table.rows = [{ id: "l1" }, { id: "l2" }, { id: "l3" }];

  // 每个数字框的当前数量各记一份，合计从这里读
  const counts = new Map();

  function sum() {
    let n = 0;
    for (const count of counts.values()) n += count || 0;
    total.textContent = \`合计 \${n} 件\`;
  }

  for (const field of table.querySelectorAll("xh-number-field")) {
    counts.set(field, Number(field.getAttribute("default-value")));
    field.addEventListener("value-change", (event) => {
      counts.set(field, event.detail.valueAsNumber);
      sum();
    });
  }

  for (const field of table.querySelectorAll("xh-number-field, xh-text-field")) {
    // 掐断冒泡：不然上下键与 Home/End 会被表体收走去搬焦点行
    field.addEventListener("keydown", (event) => {
      event.stopPropagation();
      // Escape 把焦点交还所在行，表体的方向键随即恢复
      if (event.key === "Escape")
        field.closest('[data-xh-part="row"]').focus();
    });
  }

  sum();
<\/script>
`;export{e as default};
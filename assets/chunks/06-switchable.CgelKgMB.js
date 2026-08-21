const t=`<!-- 整表进出编辑态 | edit 受控就由宿主统一调度：一个开关把整张表切进编辑，放弃时宿主拿自己留的底稿还原 -->
<div id="editable-switchable" style="width: 100%; max-width: 460px; display: grid; gap: 12px">
  <div style="display: flex; gap: 8px">
    <div id="editable-switchable-idle" style="display: flex; gap: 8px">
      <xh-button size="sm">
        <button data-xh-part="root" id="editable-switchable-start">编辑整表</button>
      </xh-button>
    </div>
    <div id="editable-switchable-busy" style="display: none; gap: 8px">
      <xh-button size="sm">
        <button data-xh-part="root" id="editable-switchable-save">完成</button>
      </xh-button>
      <xh-button size="sm">
        <button data-xh-part="root" id="editable-switchable-discard">放弃</button>
      </xh-button>
    </div>
  </div>

  <table style="width: 100%; border-collapse: collapse">
    <thead>
      <tr>
        <th
          style="
            padding: 6px 10px;
            border-block-end: 1px solid var(--xh-border-subtle);
            text-align: start;
            font-weight: 500;
            color: var(--xh-fg-muted);
          "
        >
          区域
        </th>
        <th
          style="
            padding: 6px 10px;
            border-block-end: 1px solid var(--xh-border-subtle);
            text-align: start;
            font-weight: 500;
            color: var(--xh-fg-muted);
          "
        >
          配额
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable value="北区" edit="false" placeholder="未填写" auto-resize>
            <div data-xh-part="root">
              <div data-xh-part="area">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable value="1200" edit="false" placeholder="未填写" auto-resize>
            <div data-xh-part="root">
              <div data-xh-part="area">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable value="南区" edit="false" placeholder="未填写" auto-resize>
            <div data-xh-part="root">
              <div data-xh-part="area">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable value="980" edit="false" placeholder="未填写" auto-resize>
            <div data-xh-part="root">
              <div data-xh-part="area">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable value="东区" edit="false" placeholder="未填写" auto-resize>
            <div data-xh-part="root">
              <div data-xh-part="area">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable value="1450" edit="false" placeholder="未填写" auto-resize>
            <div data-xh-part="root">
              <div data-xh-part="area">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
      </tr>
    </tbody>
  </table>
</div>

<script type="module">
  // 编辑态由这一处统一切，放弃时把开工前留的底稿写回去
  const host = document.getElementById("editable-switchable");
  const idle = document.getElementById("editable-switchable-idle");
  const busy = document.getElementById("editable-switchable-busy");
  const cells = [...host.querySelectorAll("xh-editable")];
  let backup = [];

  function setEditing(editing) {
    for (const cell of cells) cell.edit = editing;
    idle.style.display = editing ? "none" : "flex";
    busy.style.display = editing ? "flex" : "none";
  }

  for (const cell of cells) {
    cell.addEventListener("value-change", (event) => {
      cell.value = event.detail.value;
    });
  }

  document.getElementById("editable-switchable-start").addEventListener("click", () => {
    backup = cells.map((cell) => cell.value);
    setEditing(true);
  });
  document
    .getElementById("editable-switchable-save")
    .addEventListener("click", () => setEditing(false));
  document.getElementById("editable-switchable-discard").addEventListener("click", () => {
    cells.forEach((cell, i) => (cell.value = backup[i]));
    setEditing(false);
  });
<\/script>
`;export{t as default};

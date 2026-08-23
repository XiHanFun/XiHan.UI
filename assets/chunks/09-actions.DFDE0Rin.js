const t=`<!-- 外部写值与清空 | 值由宿主持有，按钮直接写值；清空交给组件自带的清空钮，有值才出现；填齐与越界两个判据由组件给出 -->
<xh-date-field id="date-field-actions" value="" locale="zh-CN">
  <div data-xh-part="root">
    <label data-xh-part="label">取件日期</label>
    <div data-xh-part="control">
      <div data-xh-part="segment-group">
        <span data-xh-part="segment" index="0"></span>
        <span>年</span>
        <span data-xh-part="segment" index="1"></span>
        <span>月</span>
        <span data-xh-part="segment" index="2"></span>
        <span>日</span>
      </div>
      <!-- 一段都没填时清空钮收起；填了任意一段就出现 -->
      <button data-xh-part="clear-trigger"></button>
    </div>

    <div style="display: flex; gap: 8px">
      <xh-button id="date-field-actions-today" size="sm" variant="outline">
        <button data-xh-part="root">今天</button>
      </xh-button>
      <xh-button id="date-field-actions-next-week" size="sm" variant="outline">
        <button data-xh-part="root">七天后</button>
      </xh-button>
    </div>

    <span id="date-field-actions-status" style="font-size: 13px">未填齐</span>
  </div>
</xh-date-field>

<script type="module">
  const field = document.getElementById("date-field-actions");
  const root = field.querySelector('[data-xh-part="root"]');
  const status = document.getElementById("date-field-actions-status");

  // 相对今天偏移若干天的 ISO 串
  function shift(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const month = \`\${d.getMonth() + 1}\`.padStart(2, "0");
    const day = \`\${d.getDate()}\`.padStart(2, "0");
    return \`\${d.getFullYear()}-\${month}-\${day}\`;
  }

  const today = shift(0);
  const nextWeek = shift(7);
  field.min = today;

  // 填齐与越界两个判据落在根节点上，等这一轮更新写完再读
  async function sync() {
    await field.updateComplete;
    status.textContent = root.hasAttribute("data-complete")
      ? root.hasAttribute("data-out-of-range")
        ? "早于今天，收不了件"
        : "可取件"
      : "未填齐";
  }

  function write(next) {
    field.value = next;
    void sync();
  }

  field.addEventListener("value-change", (event) => write(event.detail.value ?? ""));
  document.getElementById("date-field-actions-today").addEventListener("click", () => write(today));
  document
    .getElementById("date-field-actions-next-week")
    .addEventListener("click", () => write(nextWeek));
  void sync();
<\/script>
`;export{t as default};

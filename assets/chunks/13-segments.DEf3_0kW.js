const n=`<!-- 段位可拼装 | segments 决定这份控件由哪几块组成；段位可按段名认领，不必数下标 -->
<div style="display: flex; flex-direction: column; gap: 16px">
  <!-- 值的形态不变，仍是 ISO 日期串：季度取那一季的头一个月 -->
  <xh-date-field
    id="date-field-segments-quarter"
    segments="year,quarter"
    locale="zh-CN"
    default-value="2026-04-01"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">结算季度</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <!-- 按段名认领：写死这一格就是年、那一格就是季度，不必数下标 -->
          <span data-xh-part="segment" segment="year"></span>
          <span>-</span>
          <span data-xh-part="segment" segment="quarter"></span>
        </div>
      </div>
    </div>
  </xh-date-field>
  <span style="font-size: 13px" id="date-field-segments-quarter-readout">2026-04-01</span>

  <xh-date-field
    id="date-field-segments-week"
    segments="year,week"
    locale="zh-CN"
    default-value="2026-08-10"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">排期周</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="year"></span>
          <span>-</span>
          <span data-xh-part="segment" segment="week"></span>
        </div>
        <!-- 「周」与「年 / 月 / 日」一样是普通节点，段位自己只出数字 -->
        <span>周</span>
      </div>
    </div>
  </xh-date-field>
  <span style="font-size: 13px">
    <span id="date-field-segments-week-readout">2026-08-10</span>（那一周的周首日）
  </span>

  <xh-date-field
    id="date-field-segments-at"
    segments="year,month,day,hour,dayPeriod"
    locale="zh-CN"
    default-value="2026-08-17T09"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">开始时间</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="year"></span>
          <span>-</span>
          <span data-xh-part="segment" segment="month"></span>
          <span>-</span>
          <span data-xh-part="segment" segment="day"></span>
          <span>&nbsp;</span>
          <!-- 段集里带上下午时，小时段收的是 12 时制的那个数；a / p 键直接指定 -->
          <span data-xh-part="segment" segment="hour"></span>
          <span>&nbsp;</span>
          <span data-xh-part="segment" segment="dayPeriod"></span>
        </div>
      </div>
    </div>
  </xh-date-field>
  <span style="font-size: 13px" id="date-field-segments-at-readout">2026-08-17T09</span>
</div>

<script type="module">
  // 三份各自回显自己的值
  for (const id of [
    "date-field-segments-quarter",
    "date-field-segments-week",
    "date-field-segments-at",
  ]) {
    const readout = document.getElementById(\`\${id}-readout\`);
    document.getElementById(id).addEventListener("value-change", (event) => {
      readout.textContent = event.detail.value ?? "（未填齐）";
    });
  }
<\/script>
`;export{n as default};

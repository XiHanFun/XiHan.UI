var e=`<!-- 12 小时制 | hourCycle=12 时小时段收 1-12，分钟段之后多出上下午段（按 a / p 切换），值仍是 24 小时制的 ISO 串 -->
<xh-date-field id="date-field-hour-cycle" locale="en-US" granularity="minute" hour-cycle="12" default-value="2026-07-28T21:05">
  <div data-xh-part="root">
    <label data-xh-part="label">Departure</label>
    <div data-xh-part="control">
      <div data-xh-part="segment-group">
        <span data-xh-part="segment" index="0"></span>
        <span>/</span>
        <span data-xh-part="segment" index="1"></span>
        <span>/</span>
        <span data-xh-part="segment" index="2"></span>
        <span>&nbsp;</span>
        <span data-xh-part="segment" index="3"></span>
        <span>:</span>
        <span data-xh-part="segment" index="4"></span>
        <span>&nbsp;</span>
        <span data-xh-part="segment" segment="dayPeriod"></span>
      </div>
    </div>
  </div>
</xh-date-field>

<span style="font-size: 13px">当前值：<span id="date-field-hour-cycle-value">2026-07-28T21:05</span></span>

<script type="module">
  const field = document.getElementById("date-field-hour-cycle");
  const readout = document.getElementById("date-field-hour-cycle-value");
  field.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value ?? "（空）";
  });
<\/script>
`;export{e as default};
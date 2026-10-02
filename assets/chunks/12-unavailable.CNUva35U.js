const a=`<!-- 按已选的时判定 | isTimeUnavailable 的第三个参数带已选的时：9 点只能约 30 分以后，别的整点不受限 -->
<xh-time-picker id="time-picker-unavailable" min="09:00" max="18:00" time-step='{"minute":15}' default-value="09:30">
  <div data-xh-part="root">
    <label data-xh-part="label">到店时刻</label>
    <div data-xh-part="control">
      <div data-xh-part="segment-group">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
      </div>
      <button data-xh-part="trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <!-- 界与步进圈出来的格子：时列 09 到 18、分列每 15 分钟一格 -->
        <div data-xh-part="column" unit="hour">
          <div data-xh-part="item" value="09"></div>
          <div data-xh-part="item" value="10"></div>
          <div data-xh-part="item" value="11"></div>
          <div data-xh-part="item" value="12"></div>
          <div data-xh-part="item" value="13"></div>
          <div data-xh-part="item" value="14"></div>
          <div data-xh-part="item" value="15"></div>
          <div data-xh-part="item" value="16"></div>
          <div data-xh-part="item" value="17"></div>
          <div data-xh-part="item" value="18"></div>
        </div>
        <div data-xh-part="column" unit="minute">
          <div data-xh-part="item" value="00"></div>
          <div data-xh-part="item" value="15"></div>
          <div data-xh-part="item" value="30"></div>
          <div data-xh-part="item" value="45"></div>
        </div>
      </div>
    </div>
  </div>
</xh-time-picker>

<span style="font-size: 13px">当前值：<span id="time-picker-unavailable-value">09:30</span></span>

<script type="module">
  const picker = document.getElementById("time-picker-unavailable");
  const readout = document.getElementById("time-picker-unavailable-value");

  // 判真的格子仍在列里、仍可聚焦，只是选不中；时列的值恒按 24 小时制给
  picker.isTimeUnavailable = (option, unit, context) =>
    unit === "minute" && context.hour === 9 && Number(option) < 30;

  picker.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value[0] ?? "（空）";
  });
<\/script>
`;export{a as default};

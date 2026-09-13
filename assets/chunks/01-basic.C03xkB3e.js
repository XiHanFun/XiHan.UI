const a=`<!-- 基础用法 | 输入框与选择面板共享同一份值；按 15 分钟列出选项并实时显示结果 -->
<xh-time-picker id="time-picker-basic" name="meeting-time" value="09:30" step="15">
  <div data-xh-part="root">
    <label data-xh-part="label">会议开始</label>
    <div data-xh-part="control">
      <div data-xh-part="segment-group">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
      </div>
      <button data-xh-part="clear-trigger"></button>
      <button data-xh-part="trigger"></button>
    </div>
    <input data-xh-part="hidden-input" />
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="column" unit="hour">
          <div data-xh-part="item" value="00"></div>
          <div data-xh-part="item" value="01"></div>
          <div data-xh-part="item" value="02"></div>
          <div data-xh-part="item" value="03"></div>
          <div data-xh-part="item" value="04"></div>
          <div data-xh-part="item" value="05"></div>
          <div data-xh-part="item" value="06"></div>
          <div data-xh-part="item" value="07"></div>
          <div data-xh-part="item" value="08"></div>
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
          <div data-xh-part="item" value="19"></div>
          <div data-xh-part="item" value="20"></div>
          <div data-xh-part="item" value="21"></div>
          <div data-xh-part="item" value="22"></div>
          <div data-xh-part="item" value="23"></div>
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

<span aria-live="polite" style="font-size: 13px">
  当前值：<span id="time-picker-basic-value">09:30</span>
</span>

<script type="module">
  const picker = document.getElementById("time-picker-basic");
  const readout = document.getElementById("time-picker-basic-value");

  picker.addEventListener("value-change", (event) => {
    const next = event.detail.value;
    picker.value = next;
    readout.textContent = next || "（未填齐）";
  });
<\/script>
`;export{a as default};

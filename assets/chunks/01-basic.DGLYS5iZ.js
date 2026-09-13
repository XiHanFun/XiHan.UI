const e=`<!-- 基础用法 | 逐段输入并实时获得标准时间值；有值时可以一键清空 -->
<xh-time-field id="time-field-basic" name="start-time" value="09:30">
  <div data-xh-part="root">
    <label data-xh-part="label">开始时间</label>
    <div data-xh-part="control">
      <div data-xh-part="segment-group">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
      </div>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <input data-xh-part="hidden-input" />
  </div>
</xh-time-field>

<span aria-live="polite" style="font-size: 13px">
  当前值：<span id="time-field-basic-value">09:30</span>
</span>

<script type="module">
  const field = document.getElementById("time-field-basic");
  const readout = document.getElementById("time-field-basic-value");

  field.addEventListener("value-change", (event) => {
    const next = event.detail.value;
    field.value = next;
    readout.textContent = next || "（未填齐）";
  });
<\/script>
`;export{e as default};

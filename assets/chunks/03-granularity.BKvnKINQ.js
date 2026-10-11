var e=`<!-- 精度到秒 | granularity=second 使秒段显示并参与值，空段按上下键从该段边界起步 -->
<xh-time-field id="time-field-granularity" granularity="second">
  <div data-xh-part="root">
    <label data-xh-part="label">定时</label>
    <div data-xh-part="control">
      <div data-xh-part="segment-group">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="second"></span>
      </div>
    </div>
  </div>
</xh-time-field>

<span data-demo-output>当前值：<span id="time-field-granularity-readout">（未填齐）</span></span>

<script type="module">
  // 值变化回显在输出栏里
  const field = document.getElementById("time-field-granularity");
  const readout = document.getElementById("time-field-granularity-readout");
  field.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value || "（未填齐）";
  });
<\/script>
`;export{e as default};
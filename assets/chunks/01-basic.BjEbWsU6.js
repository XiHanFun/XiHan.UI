const n=`<!-- 基础用法 | 三段各是一个可加减的数，整组只占一个 Tab 位，三段填齐才第一次报出值 -->
<div style="display: grid; gap: 8px; justify-items: start">
  <xh-date-field id="date-field-basic" locale="zh-CN" name="due">
    <div data-xh-part="root">
      <label data-xh-part="label">截止日期</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <!-- 段只声明下标，是年是月由 locale 算出；中间的「年 / 月 / 日」是普通节点 -->
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
      <!-- 表单出口：值是 ISO 串，没填齐时它就是空的 -->
      <input data-xh-part="hidden-input" />
    </div>
  </xh-date-field>

  <span style="font-size: 13px">当前值：<span id="date-field-basic-readout">（未填齐）</span></span>
</div>

<script type="module">
  // 值变化回显在下面那行文字里
  const field = document.getElementById("date-field-basic");
  const readout = document.getElementById("date-field-basic-readout");
  field.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value ?? "（未填齐）";
  });
<\/script>
`;export{n as default};

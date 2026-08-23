const a=`<!-- 段序随 locale | 同一份标记，locale 换成 en-US 后段序自动排成月日年 -->
<div style="display: grid; gap: 16px">
  <xh-date-field id="date-field-locale-zh" locale="zh-CN" default-value="2026-07-28">
    <div data-xh-part="root">
      <label data-xh-part="label">zh-CN</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field id="date-field-locale-us" locale="en-US" default-value="2026-07-28">
    <div data-xh-part="root">
      <label data-xh-part="label">en-US</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>/</span>
          <span data-xh-part="segment" index="1"></span>
          <span>/</span>
          <span data-xh-part="segment" index="2"></span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <p style="margin: 0; font-size: 13px">
    两份值都是 ISO 串：<span id="date-field-locale-zh-readout">2026-07-28</span> ·
    <span id="date-field-locale-us-readout">2026-07-28</span>
  </p>
</div>

<script type="module">
  // 两份各自回显自己的值
  for (const id of ["date-field-locale-zh", "date-field-locale-us"]) {
    const readout = document.getElementById(\`\${id}-readout\`);
    document.getElementById(id).addEventListener("value-change", (event) => {
      readout.textContent = event.detail.value ?? "（空）";
    });
  }
<\/script>
`;export{a as default};

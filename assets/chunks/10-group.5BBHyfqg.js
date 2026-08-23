const n=`<!-- 分组与标记位 | 组标题与组内条目用 role="group" 加 aria-labelledby 对上；中间包一层不影响方向键行程，条目里标记位与文字各占一段 -->
<div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
  <xh-menu id="menu-group">
    <button data-xh-part="trigger">视图</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="group" value="density">
          <span data-xh-part="group-label">行高</span>
          <div data-xh-part="item" value="compact">
            <!-- 标记位恒占一格，勾不勾都不推动后面的文字 -->
            <span style="flex: none; inline-size: 14px"></span>
            <span>紧凑</span>
          </div>
          <div data-xh-part="item" value="comfortable">
            <span style="flex: none; inline-size: 14px"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg></span>
            <span>宽松</span>
          </div>
        </div>

        <div data-xh-part="separator"></div>

        <div data-xh-part="group" value="panel">
          <span data-xh-part="group-label">面板</span>
          <div data-xh-part="item" value="sidebar">
            <span style="flex: none; inline-size: 14px"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg></span>
            <span>侧栏</span>
          </div>
          <div data-xh-part="item" value="inspector">
            <span style="flex: none; inline-size: 14px"></span>
            <span>属性面板</span>
          </div>
        </div>
      </div>
    </div>
  </xh-menu>

  <span>行高：<span id="menu-group-density-readout">宽松</span>；面板：<span id="menu-group-panel-readout">1 个</span></span>
</div>

<script type="module">
  // 行高是单选、面板是多选，选中后标记位与下面那行文字一起更新
  const menu = document.getElementById("menu-group");
  const densityReadout = document.getElementById("menu-group-density-readout");
  const panelReadout = document.getElementById("menu-group-panel-readout");
  const densityLabels = { compact: "紧凑", comfortable: "宽松" };
  const panelValues = ["sidebar", "inspector"];

  const checkSvg =
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg>';

  function mark(value, on) {
    const item = menu.querySelector(\`[data-xh-part="item"][value="\${value}"]\`);
    item.firstElementChild.innerHTML = on ? checkSvg : "";
  }

  let density = "comfortable";
  let panels = ["sidebar"];

  menu.addEventListener("select", (event) => {
    const picked = event.detail.value;
    if (picked in densityLabels) {
      density = picked;
      for (const value of Object.keys(densityLabels)) mark(value, value === density);
      densityReadout.textContent = densityLabels[density];
      return;
    }
    panels = panels.includes(picked) ? panels.filter((v) => v !== picked) : [...panels, picked];
    for (const value of panelValues) mark(value, panels.includes(value));
    panelReadout.textContent = panels.length ? \`\${panels.length} 个\` : "都收起了";
  });
<\/script>
`;export{n as default};

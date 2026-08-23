const t=`<!-- 自定义条目 | 条目里想放什么都行：连打检索只认 item-text，多出来的文字不参与，选中与导航照旧 -->
<xh-popselect id="popselect-custom" default-value="u1" placement="bottom-start">
  <div data-xh-part="root">
    <div data-xh-part="control">
      <button data-xh-part="trigger">指派给：赵晓</button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="u1">
          <span data-xh-part="item-text">赵晓</span>
          <span style="color: var(--xh-fg-muted); font-size: var(--xh-font-size-sm)">
            负责人
          </span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="u2">
          <span data-xh-part="item-text">钱多</span>
          <span style="color: var(--xh-fg-muted); font-size: var(--xh-font-size-sm)">
            开发
          </span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="u3">
          <span data-xh-part="item-text">孙离</span>
          <span style="color: var(--xh-fg-muted); font-size: var(--xh-font-size-sm)">
            设计
          </span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
    </div>
  </div>
</xh-popselect>
<p>当前指派：<span id="popselect-custom-value">u1</span></p>

<script type="module">
  // 触发器与下面那行跟着选中值走
  const popselect = document.getElementById("popselect-custom");
  const readout = document.getElementById("popselect-custom-value");
  const trigger = popselect.querySelector('[data-xh-part="trigger"]');

  function labelOf(value) {
    const item = popselect.querySelector(\`[data-xh-part="item"][value="\${value}"]\`);
    return item.querySelector('[data-xh-part="item-text"]').textContent;
  }

  popselect.addEventListener("value-change", (event) => {
    const picked = event.detail.value;
    trigger.textContent = \`指派给：\${picked.length ? labelOf(picked[0]) : "指派给"}\`;
    readout.textContent = picked.join("、") || "（未指派）";
  });
<\/script>
`;export{t as default};

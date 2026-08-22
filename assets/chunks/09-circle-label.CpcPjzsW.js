const a=`<!-- 环心文字 | 组件只负责把内容摆到环心，写什么由使用者决定 -->
<div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap">
  <xh-progress variant="circle" value="72">
    <div data-xh-part="root">
      <svg data-xh-part="canvas">
        <circle data-xh-part="track"></circle>
        <circle data-xh-part="range"></circle>
      </svg>
      <div data-xh-part="label">
        <strong style="font-size: 20px">72%</strong>
      </div>
    </div>
  </xh-progress>

  <!-- 进度不是百分比时补一句 value-text：读屏念到的要和眼睛看到的一致 -->
  <xh-progress variant="circle" value="3" max="8" value-text="第 3 步，共 8 步">
    <div data-xh-part="root">
      <svg data-xh-part="canvas">
        <circle data-xh-part="track"></circle>
        <circle data-xh-part="range"></circle>
      </svg>
      <div data-xh-part="label">
        <span>3 / 8</span>
      </div>
    </div>
  </xh-progress>

  <xh-progress variant="circle" value="100" tone="success">
    <div data-xh-part="root">
      <svg data-xh-part="canvas">
        <circle data-xh-part="track"></circle>
        <circle data-xh-part="range"></circle>
      </svg>
      <div data-xh-part="label">
        <span style="font-size: 24px"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg></span>
      </div>
    </div>
  </xh-progress>
</div>
`;export{a as default};

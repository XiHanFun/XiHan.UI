const a=`<!-- 仪表盘 | variant="dashboard" 在环上留一个缺口，gapDegree 与 gapPosition 决定它多大、朝哪 -->
<div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap">
  <xh-progress variant="dashboard" value="64">
    <div data-xh-part="root">
      <svg data-xh-part="canvas">
        <circle data-xh-part="track"></circle>
        <circle data-xh-part="range"></circle>
      </svg>
    </div>
  </xh-progress>

  <xh-progress variant="dashboard" value="64" gap-degree="140">
    <div data-xh-part="root">
      <svg data-xh-part="canvas">
        <circle data-xh-part="track"></circle>
        <circle data-xh-part="range"></circle>
      </svg>
    </div>
  </xh-progress>

  <xh-progress variant="dashboard" value="64" gap-position="top" tone="warning">
    <div data-xh-part="root">
      <svg data-xh-part="canvas">
        <circle data-xh-part="track"></circle>
        <circle data-xh-part="range"></circle>
      </svg>
    </div>
  </xh-progress>

  <xh-progress variant="dashboard" value="64" gap-position="left" gap-degree="40">
    <div data-xh-part="root">
      <svg data-xh-part="canvas">
        <circle data-xh-part="track"></circle>
        <circle data-xh-part="range"></circle>
      </svg>
    </div>
  </xh-progress>
</div>
`;export{a as default};

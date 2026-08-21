const a=`<!-- 环形 | variant="circle" 把同一份进度画成环，尺寸档改的是直径 -->
<div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap">
  <xh-progress variant="circle" value="30" size="sm">
    <div data-xh-part="root">
      <svg data-xh-part="canvas">
        <circle data-xh-part="track"></circle>
        <circle data-xh-part="range"></circle>
      </svg>
    </div>
  </xh-progress>

  <xh-progress variant="circle" value="72">
    <div data-xh-part="root">
      <svg data-xh-part="canvas">
        <circle data-xh-part="track"></circle>
        <circle data-xh-part="range"></circle>
      </svg>
    </div>
  </xh-progress>

  <xh-progress variant="circle" value="100" size="lg" tone="success">
    <div data-xh-part="root">
      <svg data-xh-part="canvas">
        <circle data-xh-part="track"></circle>
        <circle data-xh-part="range"></circle>
      </svg>
    </div>
  </xh-progress>
</div>
`;export{a as default};

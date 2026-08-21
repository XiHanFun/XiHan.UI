const n=`<!-- 语气 | tone 决定选中态轨道用哪族颜色，所以这里都置为开 -->
<div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap">
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch tone="brand" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>brand</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch tone="neutral" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>neutral</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch tone="success" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>success</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch tone="warning" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>warning</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch tone="danger" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>danger</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch tone="info" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>info</span>
  </span>
</div>
`;export{n as default};

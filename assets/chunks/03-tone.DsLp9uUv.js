const n=`<!-- 语气 | tone 决定选中态的底与描边用哪族颜色，所以这里都置为选中 -->
<div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap">
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-checkbox tone="brand" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="indicator"></span>
      </button>
    </xh-checkbox>
    <span>brand</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-checkbox tone="neutral" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="indicator"></span>
      </button>
    </xh-checkbox>
    <span>neutral</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-checkbox tone="success" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="indicator"></span>
      </button>
    </xh-checkbox>
    <span>success</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-checkbox tone="warning" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="indicator"></span>
      </button>
    </xh-checkbox>
    <span>warning</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-checkbox tone="danger" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="indicator"></span>
      </button>
    </xh-checkbox>
    <span>danger</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-checkbox tone="info" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="indicator"></span>
      </button>
    </xh-checkbox>
    <span>info</span>
  </span>
</div>
`;export{n as default};

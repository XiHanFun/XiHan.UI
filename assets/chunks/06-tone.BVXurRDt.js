const t=`<!-- 语气 | tone 决定指示器与选中段文字用哪族颜色，六种语气各一组 -->
<div style="display: flex; gap: 24px; flex-wrap: wrap">
  <xh-segmented tone="brand" default-value="on">
    <div data-xh-part="root" aria-label="brand">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="on">
        <span data-xh-part="item-text">开</span>
      </button>
      <button data-xh-part="item" value="off">
        <span data-xh-part="item-text">关</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
  <xh-segmented tone="neutral" default-value="on">
    <div data-xh-part="root" aria-label="neutral">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="on">
        <span data-xh-part="item-text">开</span>
      </button>
      <button data-xh-part="item" value="off">
        <span data-xh-part="item-text">关</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
  <xh-segmented tone="success" default-value="on">
    <div data-xh-part="root" aria-label="success">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="on">
        <span data-xh-part="item-text">开</span>
      </button>
      <button data-xh-part="item" value="off">
        <span data-xh-part="item-text">关</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
  <xh-segmented tone="warning" default-value="on">
    <div data-xh-part="root" aria-label="warning">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="on">
        <span data-xh-part="item-text">开</span>
      </button>
      <button data-xh-part="item" value="off">
        <span data-xh-part="item-text">关</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
  <xh-segmented tone="danger" default-value="on">
    <div data-xh-part="root" aria-label="danger">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="on">
        <span data-xh-part="item-text">开</span>
      </button>
      <button data-xh-part="item" value="off">
        <span data-xh-part="item-text">关</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
  <xh-segmented tone="info" default-value="on">
    <div data-xh-part="root" aria-label="info">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="on">
        <span data-xh-part="item-text">开</span>
      </button>
      <button data-xh-part="item" value="off">
        <span data-xh-part="item-text">关</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
</div>
`;export{t as default};

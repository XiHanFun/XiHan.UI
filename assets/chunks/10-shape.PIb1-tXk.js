const n=`<!-- 形状 | 轨道与滑块共用同一个形状令牌，在实例上覆盖一次两者一起变方 -->
<div style="display: flex; align-items: center; gap: 16px">
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch default-checked style="--xh-shape-pill: 0">
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>直角</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch default-checked style="--xh-shape-pill: 5px">
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>圆角</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch default-checked>
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>缺省</span>
  </span>
</div>
`;export{n as default};

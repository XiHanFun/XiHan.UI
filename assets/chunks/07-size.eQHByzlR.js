const t=`<!-- 尺寸 | size 换的是段的高度、内边距与字号，指示器跟着量出来的段走 -->
<div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap">
  <xh-segmented size="sm" default-value="center">
    <div data-xh-part="root" aria-label="sm">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="start">
        <span data-xh-part="item-text">左</span>
      </button>
      <button data-xh-part="item" value="center">
        <span data-xh-part="item-text">中</span>
      </button>
      <button data-xh-part="item" value="end">
        <span data-xh-part="item-text">右</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
  <xh-segmented size="md" default-value="center">
    <div data-xh-part="root" aria-label="md">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="start">
        <span data-xh-part="item-text">左</span>
      </button>
      <button data-xh-part="item" value="center">
        <span data-xh-part="item-text">中</span>
      </button>
      <button data-xh-part="item" value="end">
        <span data-xh-part="item-text">右</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
  <xh-segmented size="lg" default-value="center">
    <div data-xh-part="root" aria-label="lg">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="start">
        <span data-xh-part="item-text">左</span>
      </button>
      <button data-xh-part="item" value="center">
        <span data-xh-part="item-text">中</span>
      </button>
      <button data-xh-part="item" value="end">
        <span data-xh-part="item-text">右</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
</div>
`;export{t as default};

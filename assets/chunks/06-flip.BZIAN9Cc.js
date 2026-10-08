var e=`<!-- 翻转 | 两颗开关钮各管一条轴，图片与裁切框一起镜像；aria-pressed 报这条轴翻没翻 -->
<xh-image-cropper
  src="/images/image-cropper-landscape.svg"
  alt="山谷与湖泊风景图"
  default-value="96,64,448,280"
  min-width="40"
>
  <div data-xh-part="root" style="inline-size: min(100%, 420px)">
    <div data-xh-part="viewport">
      <img data-xh-part="image" />
      <div data-xh-part="crop-area">
        <button data-xh-part="crop-handle" position="nw"></button>
        <button data-xh-part="crop-handle" position="ne"></button>
        <button data-xh-part="crop-handle" position="se"></button>
        <button data-xh-part="crop-handle" position="sw"></button>
      </div>
    </div>
    <div style="display: flex; gap: var(--xh-space-2); padding-block-start: var(--xh-space-3)">
      <button data-xh-part="flip-trigger" axis="horizontal">左右翻转</button>
      <button data-xh-part="flip-trigger" axis="vertical">上下翻转</button>
    </div>
  </div>
</xh-image-cropper>
`;export{e as default};
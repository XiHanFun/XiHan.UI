const t=`<!-- 缩放与旋转 | 使用内置滑块调整视图 -->
<xh-image-cropper
  src="/images/image-cropper-landscape.svg"
  alt="山谷与湖泊风景图"
  default-value="96,64,448,280"
  default-zoom="1.25"
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
    <div style="display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 8px 12px; padding-block-start: 12px">
      <label for="cropper-zoom">缩放</label>
      <input id="cropper-zoom" data-xh-part="zoom-slider" />
      <label for="cropper-rotation">旋转</label>
      <input id="cropper-rotation" data-xh-part="rotate-slider" />
    </div>
  </div>
</xh-image-cropper>
`;export{t as default};

const t=`<!-- 基础用法 | 拖动裁切区域或调整把手 -->
<xh-image-cropper
  src="/images/image-cropper-landscape.svg"
  alt="山谷与湖泊风景图"
  default-value="96,64,448,280"
  min-width="40"
  min-height="40"
>
  <div data-xh-part="root" style="inline-size: min(100%, 420px)">
    <div data-xh-part="viewport">
      <img data-xh-part="image" />
      <div data-xh-part="crop-area">
        <div data-xh-part="grid"></div>
        <button data-xh-part="crop-handle" position="nw"></button>
        <button data-xh-part="crop-handle" position="n"></button>
        <button data-xh-part="crop-handle" position="ne"></button>
        <button data-xh-part="crop-handle" position="e"></button>
        <button data-xh-part="crop-handle" position="se"></button>
        <button data-xh-part="crop-handle" position="s"></button>
        <button data-xh-part="crop-handle" position="sw"></button>
        <button data-xh-part="crop-handle" position="w"></button>
      </div>
    </div>
  </div>
</xh-image-cropper>
`;export{t as default};

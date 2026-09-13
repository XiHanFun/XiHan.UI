const n=`<!-- 圆形裁切 | 以 1:1 裁切头像 -->
<xh-image-cropper
  src="/images/image-cropper-landscape.svg"
  alt="山谷与湖泊风景图"
  shape="round"
  aspect-ratio="1"
  default-value="160,50,320,320"
  min-width="48"
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
  </div>
</xh-image-cropper>
`;export{n as default};

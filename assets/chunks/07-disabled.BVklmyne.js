const t=`<!-- 禁用与只读 | 禁用把裁切框与把手一起摘出 Tab 序列；只读仍可聚焦、仍念得出来，只是改不动 -->
<xh-image-cropper
  id="cropper-readonly"
  src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='320'%3E%3Crect width='480' height='320' fill='%23c7d2fe'/%3E%3Ccircle cx='150' cy='120' r='72' fill='%23f9a8d4'/%3E%3Crect x='250' y='160' width='180' height='120' rx='16' fill='%2334d399'/%3E%3C/svg%3E"
  alt="只读示例"
  read-only
  default-value="60,40,240,180"
>
  <div data-xh-part="root" style="inline-size: 240px">
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
<xh-image-cropper
  id="cropper-disabled"
  src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='320'%3E%3Crect width='480' height='320' fill='%23c7d2fe'/%3E%3Ccircle cx='150' cy='120' r='72' fill='%23f9a8d4'/%3E%3Crect x='250' y='160' width='180' height='120' rx='16' fill='%2334d399'/%3E%3C/svg%3E"
  alt="禁用示例"
  disabled
  default-value="60,40,240,180"
>
  <div data-xh-part="root" style="inline-size: 240px">
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
`;export{t as default};

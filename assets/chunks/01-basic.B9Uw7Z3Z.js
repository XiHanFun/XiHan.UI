const t=`<!-- 基础用法 | 在图上框出要保留的那一块：整块可拖动，八个把手各拉一条边或一个角；裁切矩形以源图的自然像素记录 -->
<!-- 不传 value 即非受控；图片加载完成时自动取整张图当初值 -->
<xh-image-cropper
  src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='320'%3E%3Crect width='480' height='320' fill='%23c7d2fe'/%3E%3Ccircle cx='150' cy='120' r='72' fill='%23f9a8d4'/%3E%3Crect x='250' y='160' width='180' height='120' rx='16' fill='%2334d399'/%3E%3C/svg%3E"
  alt="示例图片"
  min-width="40"
  min-height="40"
>
  <div data-xh-part="root" style="inline-size: 360px">
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

var e=`<!-- 导出裁切结果 | toCanvas 按所见出图：裁切矩形、旋转、翻转与圆形外形一并生效 -->
<xh-image-cropper
  id="image-cropper-export"
  src="/images/image-cropper-landscape.svg"
  alt="山谷与湖泊风景图"
  shape="round"
  aspect-ratio="1"
  default-value="160,50,320,320"
  default-rotation="90"
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
    <input data-xh-part="rotate-slider" aria-label="旋转" />
    <div style="display: flex; gap: var(--xh-space-3); align-items: center; padding-block-start: var(--xh-space-3)">
      <xh-button><button data-xh-part="root" id="image-cropper-export-trigger">导出头像</button></xh-button>
      <img id="image-cropper-export-result" alt="导出的头像" width="48" height="48" hidden />
    </div>
  </div>
</xh-image-cropper>

<script type="module">
  const cropper = document.getElementById("image-cropper-export");
  const result = document.getElementById("image-cropper-export-result");

  // 在确认时出图一次，不要在每次拖动时出图
  document.getElementById("image-cropper-export-trigger").addEventListener("click", () => {
    const canvas = cropper.toCanvas({ width: 96 });
    if (!canvas)
      return;
    result.src = canvas.toDataURL("image/png");
    result.hidden = false;
  });
<\/script>
`;export{e as default};
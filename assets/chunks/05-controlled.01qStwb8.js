const t=`<!-- 受控 | 传了 value 就由宿主说了算：组件只发变更意图，写回去之后框才动 -->
<xh-image-cropper
  id="cropper-controlled"
  src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='320'%3E%3Crect width='480' height='320' fill='%23c7d2fe'/%3E%3Ccircle cx='150' cy='120' r='72' fill='%23f9a8d4'/%3E%3Crect x='250' y='160' width='180' height='120' rx='16' fill='%2334d399'/%3E%3C/svg%3E"
  alt="示例图片"
  min-width="40"
>
  <div data-xh-part="root" style="inline-size: 360px">
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
<span id="cropper-controlled-readout">裁切矩形：60,40 · 240×180</span>
<button id="cropper-controlled-reset" type="button">复位</button>

<script type="module">
  // 裁切矩形由宿主握着：变更经事件回来，写回去才生效
  const cropper = document.getElementById("cropper-controlled");
  const readout = document.getElementById("cropper-controlled-readout");
  const initial = { x: 60, y: 40, width: 240, height: 180 };

  function apply(rect) {
    cropper.value = rect;
    readout.textContent = \`裁切矩形：\${rect.x},\${rect.y} · \${rect.width}×\${rect.height}\`;
  }

  cropper.addEventListener("value-change", (event) => apply(event.detail.value));
  document
    .getElementById("cropper-controlled-reset")
    .addEventListener("click", () => apply({ ...initial }));
  apply({ ...initial });
<\/script>
`;export{t as default};

const t=`<!-- 基础用法 | 触发器打开全屏看片：滚轮缩放、拖拽平移、工具条给缩放/旋转/翻转/归零，Esc 或点遮罩关闭 -->
<xh-image-viewer id="image-viewer-basic">
  <button data-xh-part="trigger">
    <img
      src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23475569%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E"
      alt="雪山与云海"
      style="inline-size: 160px; border-radius: 8px; cursor: zoom-in; display: block"
    />
  </button>
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <div data-xh-part="viewport">
        <img data-xh-part="image" />
      </div>
      <div data-xh-part="toolbar">
        <button data-xh-part="zoom-out-trigger"></button>
        <button data-xh-part="zoom-in-trigger"></button>
        <button data-xh-part="rotate-left-trigger"></button>
        <button data-xh-part="rotate-right-trigger"></button>
        <button data-xh-part="flip-horizontal-trigger"></button>
        <button data-xh-part="flip-vertical-trigger"></button>
        <button data-xh-part="reset-trigger">1:1</button>
      </div>
      <button data-xh-part="close-trigger"></button>
    </div>
  </div>
</xh-image-viewer>

<script type="module">
  // 图片清单是数组，只走属性；这里用内联的示例图，省得示例依赖外部资源
  document.getElementById("image-viewer-basic").items = [
    {
      src: "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23475569%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E",
      alt: "雪山与云海",
    },
  ];
<\/script>
`;export{t as default};

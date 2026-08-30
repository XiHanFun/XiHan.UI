const t=`<!-- 双指缩放 | 触屏上两指撑开放大、捏合缩小，单指平移；缩放夹在 minScale 与 maxScale 之间 -->
<xh-image-viewer id="image-viewer-gesture" min-scale="0.5" max-scale="4">
  <button data-xh-part="trigger">
    <img
      src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23334155%22/%3E%3Ccircle%20cx=%224%22%20cy=%223%22%20r=%221.4%22%20fill=%22%23fbbf24%22/%3E%3Cpath%20d=%22M0%209%205%204%2010%209z%22%20fill=%22%2364748b%22/%3E%3Cpath%20d=%22M7%209%2012%202%2016%209z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E"
      alt="山谷日落"
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
        <button data-xh-part="reset-trigger">1:1</button>
      </div>
      <button data-xh-part="close-trigger"></button>
    </div>
  </div>
</xh-image-viewer>

<script type="module">
  // 图片清单是数组，只走属性；这里用内联的示例图，省得示例依赖外部资源
  document.getElementById("image-viewer-gesture").items = [
    {
      src: "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23334155%22/%3E%3Ccircle%20cx=%224%22%20cy=%223%22%20r=%221.4%22%20fill=%22%23fbbf24%22/%3E%3Cpath%20d=%22M0%209%205%204%2010%209z%22%20fill=%22%2364748b%22/%3E%3Cpath%20d=%22M7%209%2012%202%2016%209z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E",
      alt: "山谷日落",
    },
  ];
<\/script>
`;export{t as default};

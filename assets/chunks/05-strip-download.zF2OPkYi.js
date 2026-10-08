var e=`<!-- 缩略图条与下载 | 浮层里自己放一排缩略图跳到任一张、一个下载按钮存下当前这张：两者都只读写 index，与翻页同一份状态 -->
<xh-image-viewer id="image-viewer-strip">
  <div id="image-viewer-strip-thumbs" style="display: flex; gap: var(--xh-space-2)">
    <button type="button" data-index="0" style="border: none; padding: 0; cursor: zoom-in; background: none">
      <img
        src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23475569%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E"
        alt="雪山"
        style="inline-size: 120px; aspect-ratio: 4/3; object-fit: cover; border-radius: var(--xh-shape-surface); display: block"
      />
    </button>
    <button type="button" data-index="1" style="border: none; padding: 0; cursor: zoom-in; background: none">
      <img
        src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%237c3aed%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%23c4b5fd%22/%3E%3C/svg%3E"
        alt="暮色"
        style="inline-size: 120px; aspect-ratio: 4/3; object-fit: cover; border-radius: var(--xh-shape-surface); display: block"
      />
    </button>
    <button type="button" data-index="2" style="border: none; padding: 0; cursor: zoom-in; background: none">
      <img
        src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23065f46%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%236ee7b7%22/%3E%3C/svg%3E"
        alt="森林"
        style="inline-size: 120px; aspect-ratio: 4/3; object-fit: cover; border-radius: var(--xh-shape-surface); display: block"
      />
    </button>
  </div>
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <div data-xh-part="viewport">
        <img data-xh-part="image" />
      </div>
      <div data-xh-part="counter"></div>
      <button data-xh-part="prev-trigger"></button>
      <button data-xh-part="next-trigger"></button>
      <!-- 下载按钮放进一层定位壳：落在左上角，与右上角的关闭钮对称 -->
      <div style="position: absolute; inset-block-start: var(--xh-space-6); inset-inline-start: var(--xh-space-6); z-index: 1">
        <xh-download-trigger id="image-viewer-strip-download">
          <button data-xh-part="root">
            <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10L12 15L17 10"/><path d="M12 3V15"/></svg>
            下载
          </button>
        </xh-download-trigger>
      </div>
      <div id="image-viewer-strip-rail" style="position: absolute; inset-block-end: calc(var(--xh-space-6) * 3); inset-inline: 0; z-index: 1; display: flex; justify-content: center; gap: var(--xh-space-2)">
          <button type="button" data-index="0" aria-label="第 1 张：雪山" style="border: none; padding: 0; background: none; cursor: pointer; border-radius: var(--xh-shape-inset); outline-offset: var(--xh-ring-offset)">
            <img src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23475569%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E" alt="" style="inline-size: 64px; aspect-ratio: 4/3; object-fit: cover; border-radius: var(--xh-shape-inset); display: block" />
          </button>
          <button type="button" data-index="1" aria-label="第 2 张：暮色" style="border: none; padding: 0; background: none; cursor: pointer; border-radius: var(--xh-shape-inset); outline-offset: var(--xh-ring-offset)">
            <img src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%237c3aed%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%23c4b5fd%22/%3E%3C/svg%3E" alt="" style="inline-size: 64px; aspect-ratio: 4/3; object-fit: cover; border-radius: var(--xh-shape-inset); display: block" />
          </button>
          <button type="button" data-index="2" aria-label="第 3 张：森林" style="border: none; padding: 0; background: none; cursor: pointer; border-radius: var(--xh-shape-inset); outline-offset: var(--xh-ring-offset)">
            <img src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23065f46%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%236ee7b7%22/%3E%3C/svg%3E" alt="" style="inline-size: 64px; aspect-ratio: 4/3; object-fit: cover; border-radius: var(--xh-shape-inset); display: block" />
          </button>
      </div>
      <div data-xh-part="toolbar">
        <button data-xh-part="zoom-out-trigger"></button>
        <button data-xh-part="zoom-in-trigger"></button>
      </div>
      <button data-xh-part="close-trigger"></button>
    </div>
  </div>
</xh-image-viewer>

<script type="module">
  // 内联的示例图，省得示例依赖外部资源
  const viewer = document.getElementById("image-viewer-strip");
  const download = document.getElementById("image-viewer-strip-download");
  const rail = [...document.getElementById("image-viewer-strip-rail").children];
  viewer.collection = [
    { src: "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23475569%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E", alt: "雪山" },
    { src: "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%237c3aed%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%23c4b5fd%22/%3E%3C/svg%3E", alt: "暮色" },
    { src: "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23065f46%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%236ee7b7%22/%3E%3C/svg%3E", alt: "森林" },
  ];

  // 缩略图条与下载按钮都跟着当前这张：高亮它、下载时才把它取成 Blob
  function sync(index) {
    viewer.index = index;
    const item = viewer.collection[index];
    download.fileName = \`\${item.alt}.svg\`;
    download.data = () => fetch(item.src).then(response => response.blob());
    rail.forEach((thumb, i) => {
      const current = i === index;
      if (current)
        thumb.setAttribute("aria-current", "true");
      else
        thumb.removeAttribute("aria-current");
      thumb.style.outline = current ? "var(--xh-ring-width) solid currentColor" : "none";
      thumb.style.opacity = current ? "1" : "0.6";
    });
  }

  viewer.addEventListener("open-change", event => (viewer.open = event.detail.open));
  viewer.addEventListener("index-change", event => sync(event.detail.index));
  for (const thumb of document.getElementById("image-viewer-strip-thumbs").children) {
    thumb.addEventListener("click", () => {
      sync(Number(thumb.dataset.index));
      viewer.open = true;
    });
  }
  for (const thumb of rail)
    thumb.addEventListener("click", () => sync(Number(thumb.dataset.index)));
  sync(0);
<\/script>
`;export{e as default};
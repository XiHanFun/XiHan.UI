const n=`<!-- 受控 | 传了 files 就由宿主说了算，组件自己不再落值，只发 files-change 报告意图 -->
<xh-file-upload id="file-upload-controlled" max-files="5">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 480px">
    <label data-xh-part="label">受控列表</label>
    <div data-xh-part="dropzone">
      <span>选进来的文件由外部数组保管</span>
    </div>
    <div>
      <button data-xh-part="trigger">选择文件</button>
    </div>
    <input data-xh-part="hidden-input" />
    <div data-xh-part="item-group"></div>
  </div>
</xh-file-upload>

<div style="display: flex; align-items: center; gap: 12px">
  <xh-button size="sm" disabled>
    <button data-xh-part="root" id="file-upload-controlled-clear">
      从外面清空
    </button>
  </xh-button>
  <span id="file-upload-controlled-count">宿主持有 0 个文件</span>
</div>

<script type="module">
  const upload = document.getElementById("file-upload-controlled");
  const group = upload.querySelector('[data-xh-part="item-group"]');
  const clear = document.getElementById("file-upload-controlled-clear");
  const count = document.getElementById("file-upload-controlled-count");

  // 列表住在宿主这边，组件只读它
  upload.files = [];

  function render(files) {
    group.replaceChildren(
      ...files.map(() => {
        const item = document.createElement("div");
        item.dataset.xhPart = "item";
        item.innerHTML =
          '<span data-xh-part="item-name"></span>' +
          '<span data-xh-part="item-size-text"></span>' +
          '<button data-xh-part="item-delete-trigger">✕</button>';
        return item;
      })
    );
    count.textContent = \`宿主持有 \${files.length} 个文件\`;
    clear.closest("xh-button").disabled = files.length === 0;
  }

  // 变化之后的完整列表，不是增量
  upload.addEventListener("files-change", (event) => {
    upload.files = event.detail.files;
    render(event.detail.files);
  });

  clear.addEventListener("click", () => {
    upload.files = [];
    render([]);
  });
<\/script>
`;export{n as default};

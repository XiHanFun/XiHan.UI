const e=`<!-- 限制与拒收 | accept / maxFiles / maxFileSize 越界的当场被拒，file-reject 逐个报出理由 -->
<xh-file-upload
  id="file-upload-limits"
  accept="image/*"
  max-files="3"
  max-file-size="524288"
>
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 480px">
    <label data-xh-part="label">图片</label>
    <div data-xh-part="dropzone">
      <span>只收图片，最多 3 张</span>
      <span>单张不超过 512 KB</span>
    </div>
    <div>
      <button data-xh-part="trigger">选择图片</button>
    </div>
    <input data-xh-part="hidden-input" />
    <div data-xh-part="item-group"></div>
    <!-- 列表为空时清空按钮照常在位可聚焦，只打 data-empty 由皮肤压淡 -->
    <button data-xh-part="clear-trigger">清空</button>
  </div>
</xh-file-upload>

<span id="file-upload-limits-rejected"></span>

<script type="module">
  const upload = document.getElementById("file-upload-limits");
  const group = upload.querySelector('[data-xh-part="item-group"]');
  const rejected = document.getElementById("file-upload-limits-rejected");

  // 单条删除按钮的可及名字带上文件名，读屏才分得出删的是哪一条
  upload.translations = {
    deleteFile: (file) => \`删除 \${file.name}\`,
    clearTrigger: "清空全部",
  };

  const reasonText = {
    "type": "类型不符",
    "size-too-large": "太大",
    "size-too-small": "太小",
    "too-many-files": "放不下",
  };

  // 一个文件可能同时命中多条理由
  upload.addEventListener("file-reject", (event) => {
    rejected.textContent = \`被拒：\${event.detail.files
      .map(
        (it) =>
          \`\${it.file.name}（\${it.reasons
            .map((reason) => reasonText[reason] ?? reason)
            .join("、")}）\`
      )
      .join("；")}\`;
  });

  // 条目节点由作者渲染，元素随后按文档序接上去
  upload.addEventListener("files-change", (event) => {
    group.replaceChildren(
      ...event.detail.files.map(() => {
        const item = document.createElement("div");
        item.dataset.xhPart = "item";
        item.innerHTML =
          '<span data-xh-part="item-preview"></span>' +
          '<span data-xh-part="item-name"></span>' +
          '<span data-xh-part="item-size-text"></span>' +
          '<button data-xh-part="item-delete-trigger"></button>';
        return item;
      })
    );
  });
<\/script>
`;export{e as default};

const e=`<!-- 作者的准入判定 | accept 与大小数量之外的规矩交给 validate：类型与大小通过之后逐个问它，返回拒绝码即拒收，拒收的文件带着这个码进 file-reject；这里同名文件只收最先到的一份 -->
<xh-file-upload id="file-upload-rule" max-files="6">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 480px">
    <label data-xh-part="label">去重后的附件</label>
    <div data-xh-part="dropzone">
      <span>同名文件只收最先来的那份</span>
    </div>
    <div>
      <button data-xh-part="trigger">选择文件</button>
    </div>
    <input data-xh-part="hidden-input" />
    <div data-xh-part="list"></div>
  </div>
</xh-file-upload>

<span id="file-upload-rule-dropped"></span>

<script type="module">
  const upload = document.getElementById("file-upload-rule");
  const group = upload.querySelector('[data-xh-part="list"]');
  const dropped = document.getElementById("file-upload-rule-dropped");

  // 列表里已有同名的，或同一批里排在它前面的有同名的，就报 duplicate
  upload.validate = (file, context) => {
    const earlier = context.files.slice(0, context.files.indexOf(file));
    const taken = [...context.acceptedFiles, ...earlier].some(
      (other) => other.name === file.name
    );
    return taken ? "duplicate" : null;
  };

  // 拒收的文件与内建原因（类型、大小、数量）走同一条通道，按码挑出自己关心的那一类
  upload.addEventListener("file-reject", (event) => {
    const names = event.detail.files
      .filter((rejection) => rejection.reasons.includes("duplicate"))
      .map((rejection) => rejection.file.name);
    dropped.textContent = names.length ? \`同名挡下：\${names.join("、")}\` : "";
  });

  // 条目节点由作者按当前列表铺，文件名与大小由元素代填
  upload.addEventListener("files-change", (event) => {
    group.replaceChildren(
      ...event.detail.files.map(() => {
        const item = document.createElement("div");
        item.dataset.xhPart = "item";
        item.innerHTML =
          '<span data-xh-part="item-name"></span>' +
          '<span data-xh-part="item-size-text"></span>' +
          '<button data-xh-part="item-delete-trigger"></button>';
        return item;
      })
    );
  });
<\/script>
`;export{e as default};

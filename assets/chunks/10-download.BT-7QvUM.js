var e=`<!-- 列表项上的下载 | 条目中放置什么由作者决定：一条普通的 a[download] 就是下载入口；需要自行接管时换为按钮，在处理器中自行获取 -->
<xh-file-upload id="file-upload-download" max-files="5">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 520px">
    <label data-xh-part="label">资料</label>
    <div data-xh-part="dropzone">
      <span>放几份文件进来，每条后面就带上下载口</span>
    </div>
    <div>
      <button data-xh-part="trigger">选择文件</button>
    </div>
    <input data-xh-part="hidden-input" />
    <div data-xh-part="list"></div>
  </div>
</xh-file-upload>

<script type="module">
  const upload = document.getElementById("file-upload-download");
  const group = upload.querySelector('[data-xh-part="list"]');

  // 一批地址用完就交还，重铺时统一换成新的
  let urls = [];

  // 自己接管下载：这里换了个存盘名，换成签名地址或先取回 blob 也是同一个位置
  function saveCopy(file, url) {
    const link = document.createElement("a");
    link.href = url;
    link.download = \`副本-\${file.name}\`;
    link.click();
  }

  upload.addEventListener("files-change", (event) => {
    urls.forEach((url) => URL.revokeObjectURL(url));
    urls = event.detail.files.map((file) => URL.createObjectURL(file));
    group.replaceChildren(
      ...event.detail.files.map((file, index) => {
        const url = urls[index];
        const item = document.createElement("div");
        item.dataset.xhPart = "item";
        item.innerHTML =
          '<span data-xh-part="item-name"></span>' +
          '<span data-xh-part="item-size-text"></span>' +
          \`<xh-button as="a" variant="ghost" size="sm"><a data-xh-part="root" href="\${url}" download="\${file.name}">下载</a></xh-button>\` +
          '<xh-button variant="ghost" size="sm"><button data-xh-part="root">存为副本</button></xh-button>' +
          '<button data-xh-part="item-delete-trigger"></button>';
        item.querySelector("xh-button button").addEventListener("click", () => {
          saveCopy(file, url);
        });
        return item;
      })
    );
  });
<\/script>
`;export{e as default};
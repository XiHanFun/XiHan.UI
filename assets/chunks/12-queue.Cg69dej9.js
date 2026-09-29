const e=`<!-- 并发上限与取消 | max-concurrent-uploads 限定同时在传的份数，多出来的排队依次补上；cancelUpload 只中止传输、文件留在列表里，startUpload 让它重新开传 -->
<xh-file-upload id="file-upload-queue" max-files="99" max-concurrent-uploads="2">
  <div data-xh-part="root" style="max-inline-size: 420px">
    <label data-xh-part="label">附件</label>
    <div data-xh-part="dropzone">一次多选几份，同时只传两份</div>
    <button data-xh-part="trigger">选择文件</button>
    <input data-xh-part="hidden-input" />
    <div data-xh-part="list"></div>
  </div>
</xh-file-upload>

<script type="module">
  const upload = document.getElementById("file-upload-queue");
  const group = upload.querySelector('[data-xh-part="list"]');

  const statusText = {
    idle: "未开始",
    queued: "排队中",
    uploading: "上传中",
    done: "已传完",
    error: "失败",
    canceled: "已取消",
  };

  // 每份文件那一行的状态位，按文件取，状态变化时只改这一块
  const slots = new Map();

  // 演示用的假传输：两秒走完；真实实现把 signal 接给请求库，取消与删除都经它中止
  upload.upload = (request) =>
    new Promise((resolve, reject) => {
      let progress = 0;
      paint(request.file);
      const timer = setInterval(() => {
        progress += 10;
        request.onProgress(progress);
        paint(request.file);
        if (progress >= 100) {
          clearInterval(timer);
          resolve({});
        }
      }, 200);
      request.signal.addEventListener("abort", () => {
        clearInterval(timer);
        reject(request.signal.reason);
      });
    });

  function button(text, onClick) {
    const el = document.createElement("xh-button");
    el.setAttribute("size", "sm");
    el.setAttribute("variant", "outline");
    el.innerHTML = \`<button data-xh-part="root">\${text}</button>\`;
    el.addEventListener("click", onClick);
    return el;
  }

  // 状态从元素上读：uploadOf 给的是这一刻的传输快照
  function paint(file) {
    const slot = slots.get(file);
    if (!slot) return;
    const snapshot = upload.uploadOf(file);
    const status = snapshot?.status ?? "idle";

    let state;
    if (status === "uploading") {
      state = slot.querySelector("xh-progress");
      if (!state) {
        state = document.createElement("xh-progress");
        state.style.cssText = "display: block; flex: 1";
        state.innerHTML =
          '<div data-xh-part="root"><div data-xh-part="track"><div data-xh-part="range"></div></div></div>';
      }
      state.setAttribute("value", String(snapshot.progress));
    } else {
      state = document.createElement("span");
      state.style.flex = "1";
      state.textContent = statusText[status];
    }

    const action =
      status === "uploading" || status === "queued"
        ? button("取消", () => upload.cancelUpload(file))
        : status === "canceled"
          ? button("重新上传", () => upload.startUpload(file))
          : null;
    slot.replaceChildren(...(action ? [state, action] : [state]));
  }

  // 条目节点由作者按当前列表铺，文件名由元素代填；状态位留成空壳，由 paint 填
  function render(files) {
    slots.clear();
    group.replaceChildren(
      ...files.map((file) => {
        const item = document.createElement("div");
        item.dataset.xhPart = "item";

        const name = document.createElement("span");
        name.dataset.xhPart = "item-name";

        const slot = document.createElement("span");
        slot.style.cssText =
          "display: flex; flex: 1; min-inline-size: 0; align-items: center; gap: 8px";

        const remove = document.createElement("button");
        remove.dataset.xhPart = "item-delete-trigger";

        item.append(name, slot, remove);
        slots.set(file, slot);
        return item;
      })
    );
    for (const file of files) paint(file);
  }

  // 列表变化的回调先于排队与开传：等这一轮落定再按新状态铺
  upload.addEventListener("files-change", (event) => {
    queueMicrotask(() => render(event.detail.files));
  });

  upload.addEventListener("upload-complete", (event) => paint(event.detail.file));
  upload.addEventListener("upload-cancel", (event) => paint(event.detail.file));
<\/script>
`;export{e as default};

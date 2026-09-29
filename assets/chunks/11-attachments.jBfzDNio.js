const t=`<!-- 附件 | 选中的文件以可关闭的标签排在输入行下方，发送时与正文一起交给宿主；文件选择器是宿主自己的原生 input，框里只放触发它的按钮 -->
<div style="display: grid; gap: 12px">
  <xh-prompt-input id="prompt-input-attachments">
    <div data-xh-part="root">
      <div data-xh-part="control">
        <textarea data-xh-part="input" rows="1" placeholder="写点什么，可以附上文件…"></textarea>
        <button data-xh-part="submit-trigger"></button>
      </div>
      <div
        id="prompt-input-attachments-list"
        style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px"
      >
        <input id="prompt-input-attachments-picker" type="file" multiple hidden />
        <xh-button id="prompt-input-attachments-add" variant="ghost" size="sm">
          <button data-xh-part="root">添加附件</button>
        </xh-button>
      </div>
    </div>
  </xh-prompt-input>
  <span id="prompt-input-attachments-log">（还没发过）</span>
</div>

<script type="module">
  const input = document.getElementById("prompt-input-attachments");
  const list = document.getElementById("prompt-input-attachments-list");
  const picker = document.getElementById("prompt-input-attachments-picker");
  const add = document.getElementById("prompt-input-attachments-add");
  const log = document.getElementById("prompt-input-attachments-log");
  input.translations = { input: "给助手写点什么" };

  // 每个选中的文件铺一枚可关闭的标签；open 受控，收起意图回来时由宿主把它摘掉
  function attach(name) {
    const tag = document.createElement("xh-tag");
    tag.setAttribute("variant", "subtle");
    tag.setAttribute("closable", "");
    tag.setAttribute("open", "");
    tag.dataset.name = name;
    const root = document.createElement("span");
    root.dataset.xhPart = "root";
    const label = document.createElement("span");
    label.dataset.xhPart = "label";
    label.textContent = name;
    const close = document.createElement("button");
    close.dataset.xhPart = "close-trigger";
    root.append(label, close);
    tag.append(root);
    list.append(tag);
    tag.translations = { close: \`移除 \${name}\` };
    tag.addEventListener("open-change", () => tag.remove());
  }

  add.addEventListener("click", () => picker.click());
  picker.addEventListener("change", () => {
    for (const file of picker.files) attach(file.name);
    // 清掉选择器的值：删掉的文件还能再选一次
    picker.value = "";
  });

  // submit 与原生表单提交同名，故不冒泡，直接在元素上监听
  input.addEventListener("submit", (event) => {
    const tags = [...list.querySelectorAll("xh-tag")];
    const names = tags.map((tag) => tag.dataset.name);
    log.textContent = names.length
      ? \`提交：\${event.detail.value}（附件：\${names.join("、")}）\`
      : \`提交：\${event.detail.value}\`;
    for (const tag of tags) tag.remove();
  });
<\/script>
`;export{t as default};

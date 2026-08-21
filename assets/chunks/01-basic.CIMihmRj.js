const e=`<!-- 基础用法 | 框里打字按 Enter 落一个标签；标签由作者按当前值渲染，每个标签自带 value 标识身份 -->
<xh-tags-input
  id="tags-input-basic"
  value="Vue,TypeScript"
  placeholder="回车落一个"
  style="max-inline-size: 420px"
>
  <div data-xh-part="root">
    <label data-xh-part="label">技术栈</label>
    <div data-xh-part="control">
      <div data-xh-part="item" value="Vue">
        <div data-xh-part="item-preview">
          <span data-xh-part="item-text">Vue</span>
          <button data-xh-part="item-delete-trigger">×</button>
        </div>
      </div>
      <div data-xh-part="item" value="TypeScript">
        <div data-xh-part="item-preview">
          <span data-xh-part="item-text">TypeScript</span>
          <button data-xh-part="item-delete-trigger">×</button>
        </div>
      </div>
      <input data-xh-part="input" />
    </div>
  </div>
</xh-tags-input>
<p>当前：<span id="tags-input-basic-value">Vue、TypeScript</span></p>

<script type="module">
  const root = document.getElementById("tags-input-basic");
  const control = root.querySelector('[data-xh-part="control"]');
  const input = control.querySelector('[data-xh-part="input"]');
  const readout = document.getElementById("tags-input-basic-value");

  // 一个标签一个节点：外壳带 value 标识身份，里面是文本与删除按钮
  function createTag(value) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", value);
    const preview = document.createElement("div");
    preview.dataset.xhPart = "item-preview";
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = value;
    const remove = document.createElement("button");
    remove.dataset.xhPart = "item-delete-trigger";
    remove.textContent = "×";
    preview.append(text, remove);
    item.append(preview);
    return item;
  }

  // 按当前值增删标签节点，已经在的那份原地留着
  function renderTags(values) {
    const alive = new Map();
    for (const el of control.querySelectorAll('[data-xh-part="item"]')) {
      alive.set(el.getAttribute("value"), el);
    }
    for (const [value, el] of alive) {
      if (!values.includes(value)) el.remove();
    }
    for (const value of values) {
      if (!alive.has(value)) control.insertBefore(createTag(value), input);
    }
  }

  root.addEventListener("value-change", (event) => {
    root.value = event.detail.value;
    renderTags(event.detail.value);
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
<\/script>
`;export{e as default};

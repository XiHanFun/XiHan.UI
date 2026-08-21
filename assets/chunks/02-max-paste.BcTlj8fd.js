const t=`<!-- 上限与粘贴拆分 | add-on-paste 让粘进来的一串按分隔符拆成多个标签；顶到 max 后再打再粘都进不去 -->
<xh-tags-input
  id="tags-input-max"
  value="Vue"
  max="4"
  add-on-paste
  delimiter=","
  placeholder="试试粘贴 React,Svelte,Solid"
  style="max-inline-size: 420px"
>
  <div data-xh-part="root">
    <label data-xh-part="label">技术栈（最多 4 个）</label>
    <div data-xh-part="control">
      <div data-xh-part="item" value="Vue">
        <div data-xh-part="item-preview">
          <span data-xh-part="item-text">Vue</span>
          <button data-xh-part="item-delete-trigger">×</button>
        </div>
      </div>
      <input data-xh-part="input" />
      <button data-xh-part="clear-trigger">⨯</button>
    </div>
    <span id="tags-input-max-count">1 / 4</span>
  </div>
</xh-tags-input>

<script type="module">
  const root = document.getElementById("tags-input-max");
  const control = root.querySelector('[data-xh-part="control"]');
  const input = control.querySelector('[data-xh-part="input"]');
  const count = document.getElementById("tags-input-max-count");

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
    const values = event.detail.value;
    root.value = values;
    renderTags(values);
    count.textContent = \`\${values.length} / 4\${values.length >= 4 ? " · 已到上限" : ""}\`;
  });
<\/script>
`;export{t as default};

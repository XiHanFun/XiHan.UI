const t=`<!-- 随表单提交 | 写了 name 与 hidden-input 才参与提交，整份标签按断词符拼成一串；框里没内容时回车留给表单 -->
<form
  id="tags-input-form"
  style="display: flex; flex-direction: column; gap: 12px; max-inline-size: 420px"
>
  <xh-tags-input
    id="tags-input-form-tags"
    value="Vue,TypeScript"
    name="skills"
    delimiter=","
    placeholder="回车落一个"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">技术栈</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="Vue">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">Vue</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <div data-xh-part="item" value="TypeScript">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">TypeScript</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-tags-input>
  <xh-button type="submit" variant="outline" style="align-self: start">
    <button data-xh-part="root">提交</button>
  </xh-button>
  <span>表单收到：<span id="tags-input-form-result">（还没提交）</span></span>
</form>

<script type="module">
  const form = document.getElementById("tags-input-form");
  const root = document.getElementById("tags-input-form-tags");
  const control = root.querySelector('[data-xh-part="control"]');
  const input = control.querySelector('[data-xh-part="input"]');
  const result = document.getElementById("tags-input-form-result");

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
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    result.textContent = String(new FormData(form).get("skills") ?? "");
  });
<\/script>
`;export{t as default};

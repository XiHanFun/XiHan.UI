const e=`<!-- 一组断词符 | delimiter 给一组时其中任何一个都断词：半角逗号、全角逗号、分号都行，粘贴多行清单时换行也算；随表单提交的整串用第一个拼接 -->
<xh-tags-input id="tags-input-delimiters" add-on-paste placeholder="试试输入 北京，上海;广州">
  <div data-xh-part="root" style="max-inline-size: 420px">
    <label data-xh-part="label">城市</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
    </div>
  </div>
</xh-tags-input>

<script type="module">
  const root = document.getElementById("tags-input-delimiters");
  const control = root.querySelector('[data-xh-part="control"]');
  const input = control.querySelector('[data-xh-part="input"]');

  // 一组断词符只能走 property：属性里写不下数组
  root.delimiter = [",", "，", ";", "\\n"];

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
  root.addEventListener("value-change", (event) => {
    const values = event.detail.value;
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
  });
<\/script>
`;export{e as default};

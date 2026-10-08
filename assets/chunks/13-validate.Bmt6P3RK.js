var e=`<!-- 准入判定 | validate 逐个判定新标签，返回拒绝码即拒收：这一次提交整体不生效、文本留在框里改；tag-reject 报告拒收的标签与原因，重复的照常消费但也会报 -->
<xh-tags-input id="tags-input-validate" default-value="ada@example.com" placeholder="输入邮箱后回车">
  <div data-xh-part="root" style="max-inline-size: 420px">
    <label data-xh-part="label">收件人</label>
    <div data-xh-part="control">
      <div data-xh-part="item" value="ada@example.com">
        <div data-xh-part="item-preview">
          <span data-xh-part="item-text">ada@example.com</span>
          <button data-xh-part="item-delete-trigger"></button>
        </div>
      </div>
      <input data-xh-part="input" />
    </div>
  </div>
</xh-tags-input>
<p id="tags-input-validate-hint" style="color: var(--xh-fg-danger)"></p>

<script type="module">
  const root = document.getElementById("tags-input-validate");
  const control = root.querySelector('[data-xh-part="control"]');
  const input = control.querySelector('[data-xh-part="input"]');
  const hint = document.getElementById("tags-input-validate-hint");

  const reasonText = {
    "duplicate": "已经在列表里",
    "invalid-email": "不是邮箱地址",
  };

  root.validate = (tag) =>
    /^[^\\s@]+@[^\\s@.]+(?:\\.[^\\s@.]+)+$/.test(tag) ? null : "invalid-email";

  root.addEventListener("tag-reject", (event) => {
    hint.textContent = event.detail.tags
      .map(
        ({ tag, reasons }) =>
          \`\${tag}：\${reasons.map((r) => reasonText[r] ?? r).join("、")}\`
      )
      .join("；");
  });

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
    hint.textContent = "";
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
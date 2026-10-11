var e=`<!-- 程序化改值 | setValue 直接写值，只受禁用、只读与字数上限约束；clear 执行清空意图，canClear 不成立时不做任何处理 -->
<xh-text-field id="text-field-programmatic" placeholder="等着被写入" max-length="12" clearable show-count>
  <div data-xh-part="root">
    <label data-xh-part="label">收货人</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
    </div>
    <span data-xh-part="count"></span>
  </div>
</xh-text-field>
<div style="display: flex; gap: 8px">
  <xh-button id="text-field-programmatic-write" variant="outline" size="sm">
    <button data-xh-part="root">写入</button>
  </xh-button>
  <xh-button id="text-field-programmatic-append" variant="outline" size="sm">
    <button data-xh-part="root">追加一个点</button>
  </xh-button>
  <xh-button id="text-field-programmatic-clear" variant="outline" size="sm">
    <button data-xh-part="root">清空</button>
  </xh-button>
</div>

<script type="module">
  const field = document.getElementById("text-field-programmatic");
  const clear = document.getElementById("text-field-programmatic-clear");

  // 值的真本住在组件里，这里只跟着 value-change 抄一份，用来拼「追加」的下一个值
  let value = "";

  // 清得了清不了由组件说了算，外面这颗钮跟着它禁用
  function sync() {
    clear.disabled = !field.canClear;
  }

  field.addEventListener("value-change", (event) => {
    value = event.detail.value;
    sync();
  });

  // 超出 12 个字的那截由组件截掉，截完的那份才落进值
  document
    .getElementById("text-field-programmatic-write")
    .addEventListener("click", () => field.setValue("曦寒"));
  document
    .getElementById("text-field-programmatic-append")
    .addEventListener("click", () => field.setValue(\`\${value}·\`));
  clear.addEventListener("click", () => field.clear());

  sync();
<\/script>
`;export{e as default};
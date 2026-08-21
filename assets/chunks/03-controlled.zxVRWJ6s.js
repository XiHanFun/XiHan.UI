const e=`<!-- 受控 | value 与 edit 都能受控，传了就由宿主说了算，用户交互只发出意图；外部按钮同样进得了编辑态 -->
<xh-editable id="editable-controlled" value="这个人很懒" edit="false" placeholder="未填写">
  <div data-xh-part="root">
    <label data-xh-part="label">签名</label>
    <div data-xh-part="area">
      <span data-xh-part="preview"></span>
      <input data-xh-part="input" />
    </div>
  </div>
</xh-editable>
<span>
  当前：<span id="editable-controlled-value">这个人很懒</span> ·
  <span id="editable-controlled-state">预览中</span>
</span>
<button type="button" id="editable-controlled-open">从外部进编辑态</button>

<script type="module">
  // 两份状态都由宿主持有，组件发的事件宿主写回才算数
  const editable = document.getElementById("editable-controlled");
  const valueOut = document.getElementById("editable-controlled-value");
  const stateOut = document.getElementById("editable-controlled-state");

  function setEdit(edit) {
    editable.edit = edit;
    stateOut.textContent = edit ? "编辑中" : "预览中";
  }

  editable.addEventListener("value-change", (event) => {
    editable.value = event.detail.value;
    valueOut.textContent = event.detail.value || "（空）";
  });
  editable.addEventListener("edit-change", (event) => setEdit(event.detail.edit));
  document
    .getElementById("editable-controlled-open")
    .addEventListener("click", () => setEdit(true));
<\/script>
`;export{e as default};

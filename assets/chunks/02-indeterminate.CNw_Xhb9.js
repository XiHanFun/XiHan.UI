const e=`<!-- 不确定状态 | 表示部分选中 -->
<xh-checkbox id="checkbox-tristate" checked="indeterminate">
  <label data-xh-part="label">
    <button data-xh-part="root">
      <span data-xh-part="indicator"></span>
    </button>
    <span data-xh-part="text">选择全部</span>
  </label>
</xh-checkbox>

<script type="module">
  const checkbox = document.getElementById("checkbox-tristate");
  checkbox.addEventListener("checked-change", (event) => {
    checkbox.checked = event.detail.checked;
  });
<\/script>
`;export{e as default};

const n=`<!-- 数字主键 | 条目身份存在 DOM 属性上，值一律是字符串；数字主键在进出两侧各转一次 -->
<xh-checkbox-group id="checkbox-group-numeric" value="101" orientation="horizontal" name="role">
  <div data-xh-part="root">
    <span data-xh-part="label">角色</span>
    <div data-xh-part="item" value="101">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">管理员</span>
    </div>
    <div data-xh-part="item" value="102">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">审核员</span>
    </div>
    <div data-xh-part="item" value="103">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">访客</span>
    </div>
  </div>
</xh-checkbox-group>
<span>提交给后端：<span id="checkbox-group-numeric-value">101</span></span>

<script type="module">
  // 业务侧存数字，组件侧收字符串，转换收在这一处
  const group = document.getElementById("checkbox-group-numeric");
  const readout = document.getElementById("checkbox-group-numeric-value");
  let roleIds = [101];
  group.addEventListener("value-change", (event) => {
    roleIds = event.detail.value.map(Number);
    group.value = roleIds.map(String);
    readout.textContent = roleIds.join("、") || "（无）";
  });
<\/script>
`;export{n as default};

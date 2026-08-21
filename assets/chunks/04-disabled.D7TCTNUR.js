const t=`<!-- 禁用 | 条目一律 aria-disabled 而非原生 disabled：点不动，但焦点落得上去，仍能当方向键的起点 -->
<!-- 只禁其中一项：走方向键时它不被跳过，按 Enter / Space 也不切值 -->
<xh-toggle-group default-value="left">
  <div data-xh-part="root">
    <button data-xh-part="item" value="left">左对齐</button>
    <button data-xh-part="item" value="center" aria-disabled="true">居中</button>
    <button data-xh-part="item" value="right">右对齐</button>
  </div>
</xh-toggle-group>

<!-- 整组禁用：选中那一段仍看得出是当前值，只是改不动 -->
<xh-toggle-group default-value="center" disabled>
  <div data-xh-part="root">
    <button data-xh-part="item" value="left">左对齐</button>
    <button data-xh-part="item" value="center">居中</button>
    <button data-xh-part="item" value="right">右对齐</button>
  </div>
</xh-toggle-group>
`;export{t as default};

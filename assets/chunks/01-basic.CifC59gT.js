const a=`<!-- 基础用法 | 一个标签就是 root 加一段 label 文字；不写 closable 就没有关闭钮 -->
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
  <xh-tag>
    <span data-xh-part="root">
      <span data-xh-part="label">前端</span>
    </span>
  </xh-tag>

  <xh-tag>
    <span data-xh-part="root">
      <span data-xh-part="label">无头内核</span>
    </span>
  </xh-tag>

  <xh-tag>
    <span data-xh-part="root">
      <span data-xh-part="label">可访问性</span>
    </span>
  </xh-tag>
</div>
`;export{a as default};

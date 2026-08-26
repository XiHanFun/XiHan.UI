const n=`<!-- 计数角标 | 被标记的东西写进默认插槽，角标自己贴到它的角上；计数、上限截断与 0 值收起都归角标算 -->
<div style="display: flex; align-items: center; gap: 24px">
  <xh-badge count="5" tone="danger" label="5 条未读">
    <span data-xh-part="root">
      <xh-button variant="outline"><button data-xh-part="root">收件箱</button></xh-button>
      <span data-xh-part="indicator"></span>
    </span>
  </xh-badge>

  <xh-badge count="128" max="99" tone="danger" label="128 条未读">
    <span data-xh-part="root">
      <xh-button variant="outline"><button data-xh-part="root">通知</button></xh-button>
      <span data-xh-part="indicator"></span>
    </span>
  </xh-badge>

  <!-- 计数为 0 时整枚收起，宿主不必自己判 -->
  <xh-badge count="0" tone="danger">
    <span data-xh-part="root">
      <xh-button variant="outline"><button data-xh-part="root">已读完</button></xh-button>
      <span data-xh-part="indicator"></span>
    </span>
  </xh-badge>
</div>
`;export{n as default};

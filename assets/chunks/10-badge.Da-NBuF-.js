const a=`<!-- 挂状态点与角标 | 状态点自己绝对定位在根里；计数角标反过来——把头像写进角标的默认插槽，贴角与偏移都归角标算 -->
<div style="display: flex; align-items: center; gap: 24px">
  <!-- 状态点落在圆内，裁剪不用动 -->
  <xh-avatar size="lg" src="/images/logo.png" alt="曦寒">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
      <span
        role="img"
        aria-label="在线"
        style="
          position: absolute;
          inset-block-end: 2px;
          inset-inline-end: 2px;
          inline-size: 10px;
          block-size: 10px;
          border-radius: var(--xh-shape-pill);
          background: var(--xh-fg-success);
        "
      ></span>
    </span>
  </xh-avatar>

  <!-- 计数角标：被标记的头像写进默认插槽，贴哪个角、偏多少都归角标 -->
  <xh-badge count="12" tone="danger" size="sm" label="12 条未读">
    <span data-xh-part="root">
      <xh-avatar size="lg" src="/images/logo.png" alt="曦寒">
        <span data-xh-part="root">
          <img data-xh-part="image" />
          <span data-xh-part="fallback">曦</span>
        </span>
      </xh-avatar>
      <span data-xh-part="indicator"></span>
    </span>
  </xh-badge>

  <!-- 落回退态时一样成立；点描一圈底色，压在头像边上也分得开 -->
  <xh-avatar size="lg">
    <span data-xh-part="root" style="overflow: visible">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">XH</span>
      <span
        role="img"
        aria-label="离线"
        style="
          position: absolute;
          inset-block-end: 0;
          inset-inline-end: 0;
          inline-size: 12px;
          block-size: 12px;
          border: 2px solid var(--vp-c-bg);
          border-radius: var(--xh-shape-pill);
          background: var(--xh-fg-disabled);
        "
      ></span>
    </span>
  </xh-avatar>
</div>
`;export{a as default};

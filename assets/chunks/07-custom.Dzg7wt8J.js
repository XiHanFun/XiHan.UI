const a=`<!-- 自定义直径与配色 | 三档之外的直径、底色、字色各是一个组件令牌；按人名分配颜色就是逐个实例覆盖 -->
<!-- 直径与字号一起给，回退字才不会在大头像里显小 -->
<div style="display: flex; align-items: center; gap: 12px">
  <xh-avatar src="/images/logo.png" alt="曦寒">
    <span
      data-xh-part="root"
      style="--xh-avatar-size: 56px; --xh-avatar-font-size: 20px"
    >
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
    </span>
  </xh-avatar>

  <xh-avatar>
    <span
      data-xh-part="root"
      style="--xh-avatar-size: 56px; --xh-avatar-font-size: 20px"
    >
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦寒</span>
    </span>
  </xh-avatar>

  <span style="font-size: 13px">直径 56px</span>
</div>

<div style="display: flex; align-items: center; gap: 8px">
  <xh-avatar>
    <span data-xh-part="root" style="--xh-avatar-bg: #fee2e2; --xh-avatar-fg: #b91c1c">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
    </span>
  </xh-avatar>

  <xh-avatar>
    <span data-xh-part="root" style="--xh-avatar-bg: #dcfce7; --xh-avatar-fg: #15803d">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">寒</span>
    </span>
  </xh-avatar>

  <xh-avatar>
    <span data-xh-part="root" style="--xh-avatar-bg: #e0e7ff; --xh-avatar-fg: #4338ca">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">懿</span>
    </span>
  </xh-avatar>

  <xh-avatar>
    <span data-xh-part="root" style="--xh-avatar-bg: #fef3c7; --xh-avatar-fg: #b45309">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">XH</span>
    </span>
  </xh-avatar>

  <span style="font-size: 13px">底色与字色逐个给</span>
</div>
`;export{a as default};

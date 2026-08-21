const a=`<!-- 使用者令牌 | 直径、叠放量、分隔那圈底色都留了槽位，写在组上就整组换掉 -->
<xh-avatar-group max="4">
  <!-- 方头像、叠得更深、计数那一枚也跟着换形状 -->
  <div
    data-xh-part="root"
    style="
      --xh-avatar-group-size: 34px;
      --xh-avatar-group-overlap: 14px;
      --xh-avatar-group-radius: var(--xh-radius-md);
      --xh-avatar-radius: var(--xh-radius-md);
    "
  >
    <xh-avatar>
      <span data-xh-part="root">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">曦</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span data-xh-part="root">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">寒</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span data-xh-part="root">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">懿</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span data-xh-part="root">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">承</span>
      </span>
    </xh-avatar>
    <span data-xh-part="overflow">+2</span>
  </div>
</xh-avatar-group>
`;export{a as default};

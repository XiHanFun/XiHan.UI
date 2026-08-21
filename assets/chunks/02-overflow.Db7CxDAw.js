const a=`<!-- 上限与溢出计数 | 摆到上限为止，其余收成一枚「+N」；裁到几枚、N 写多少由作者定，组件只给这一枚身份与位置 -->
<xh-avatar-group max="4">
  <div data-xh-part="root">
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

    <!-- 计数那一枚没有图，写什么都行 -->
    <span data-xh-part="overflow">+2</span>
  </div>
</xh-avatar-group>
`;export{a as default};

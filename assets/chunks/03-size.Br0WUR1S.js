const a=`<!-- 尺寸 | size 三档只改变直径，回退文字的字号随之缩放；默认档不输出 data-size -->
<!-- 有图的一行：图片铺满 root，跟着三档一起缩放 -->
<div style="display: flex; align-items: center; gap: 12px">
  <xh-avatar size="sm" src="/images/demo-avatar.svg" alt="曦寒">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
    </span>
  </xh-avatar>
  <xh-avatar src="/images/demo-avatar.svg" alt="曦寒">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
    </span>
  </xh-avatar>
  <xh-avatar size="lg" src="/images/demo-avatar.svg" alt="曦寒">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
    </span>
  </xh-avatar>
  <span style="font-size: 13px">sm / 缺省 / lg</span>
</div>

<!-- 落回退态的一行：小头像里的字不撑出去，大头像里的字也不显小 -->
<div style="display: flex; align-items: center; gap: 12px">
  <xh-avatar size="sm">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">XH</span>
    </span>
  </xh-avatar>
  <xh-avatar>
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">XH</span>
    </span>
  </xh-avatar>
  <xh-avatar size="lg">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">XH</span>
    </span>
  </xh-avatar>
  <span style="font-size: 13px">回退字随档位缩放</span>
</div>
`;export{a as default};

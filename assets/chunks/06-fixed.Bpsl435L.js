const n=`<!-- 吸顶与固定 | header-fixed 让头钉在滚动容器上沿，sider-fixed 让侧栏跟着钉住；两个一起用时侧栏自动让开头的高度 -->
<!-- 滚动发生在骨架外面这一层，钉住的两段才有行程可走 -->
<div
  style="
    block-size: 260px;
    overflow: auto;
    border: 1px solid var(--xh-border-default);
    border-radius: 8px;
  "
>
  <!-- 把滚动容器的可视高度告诉侧栏，侧栏那道高度上限才算得准 -->
  <xh-layout header-fixed sider-fixed bordered>
    <div data-xh-part="root" style="--xh-layout-scrollport-h: 260px">
      <div data-xh-part="header">控制台</div>
      <div data-xh-part="sider">导航</div>
      <div data-xh-part="content">
        <p style="margin-block-end: 12px">
          第 1 段正文。向下滚：头钉在上沿，侧栏钉在头的下沿，只有正文在走。
        </p>
        <p style="margin-block-end: 12px">第 2 段正文。</p>
        <p style="margin-block-end: 12px">第 3 段正文。</p>
        <p style="margin-block-end: 12px">第 4 段正文。</p>
        <p style="margin-block-end: 12px">第 5 段正文。</p>
        <p style="margin-block-end: 12px">第 6 段正文。</p>
        <p style="margin-block-end: 12px">第 7 段正文。</p>
        <p style="margin-block-end: 12px">第 8 段正文。</p>
        <p style="margin-block-end: 12px">第 9 段正文。</p>
        <p style="margin-block-end: 12px">第 10 段正文。</p>
        <p style="margin-block-end: 12px">第 11 段正文。</p>
        <p style="margin-block-end: 12px">第 12 段正文。</p>
        <p style="margin-block-end: 12px">第 13 段正文。</p>
        <p style="margin-block-end: 12px">第 14 段正文。</p>
      </div>
      <div data-xh-part="footer">版本 1.0.0</div>
    </div>
  </xh-layout>
</div>
`;export{n as default};

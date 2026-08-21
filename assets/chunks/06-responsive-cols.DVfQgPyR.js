const a=`<!-- 响应式列数 | cols 除了整数也收断点对象，逐档写各自的列数：窄视口一列，越宽排得越密，拖动窗口即可看到换档 -->
<style>
  #grid-responsive-cols [data-cell] {
    padding: 12px;
    border-radius: var(--xh-radius-md);
    background: var(--xh-bg-subtle);
    color: var(--xh-fg-default);
    text-align: center;
  }
  #grid-responsive-cols [data-label] {
    font-size: 13px;
    color: var(--xh-fg-muted);
  }
  #grid-responsive-cols [data-inner] {
    margin-block-start: 6px;
  }
</style>

<!-- 宿主设 display: contents，排布落在 root 上 -->
<xh-grid id="grid-responsive-cols" gap="lg" style="display: contents">
  <div data-xh-part="root">
    <!-- 一面卡片墙：窄屏一列到底，宽屏一行摆四张 -->
    <div data-xh-part="item">
      <div data-label>cols = { base: 1, sm: 2, lg: 4 }</div>
      <xh-grid cols='{"base":1,"sm":2,"lg":4}' gap="sm" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
          <div data-xh-part="item" data-cell>丁</div>
          <div data-xh-part="item" data-cell>戊</div>
          <div data-xh-part="item" data-cell>己</div>
          <div data-xh-part="item" data-cell>庚</div>
          <div data-xh-part="item" data-cell>辛</div>
        </div>
      </xh-grid>
    </div>

    <!-- 没写的档沿用比它窄的那一档：这里只在 md 换一次，md 往上都是三列 -->
    <div data-xh-part="item">
      <div data-label>只写两档：cols = { base: 2, md: 3 }</div>
      <xh-grid cols='{"base":2,"md":3}' gap="sm" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
          <div data-xh-part="item" data-cell>丁</div>
          <div data-xh-part="item" data-cell>戊</div>
          <div data-xh-part="item" data-cell>己</div>
        </div>
      </xh-grid>
    </div>

    <!-- 不写 base 就还是一列，从 lg 起才分栏 -->
    <div data-xh-part="item">
      <div data-label>不写 base：cols = { lg: 3 }</div>
      <xh-grid cols='{"lg":3}' gap="sm" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
        </div>
      </xh-grid>
    </div>
  </div>
</xh-grid>
`;export{a as default};

const a=`<!-- 断点档位一览 | 四档断点取自令牌：sm 640px、md 768px、lg 1024px、xl 1280px；自窄到宽依次接管，视口到哪一档就用哪一档的列数 -->
<style>
  #grid-breakpoints [data-cell],
  #grid-breakpoints [data-head] {
    padding: 10px;
    border-radius: var(--xh-radius-md);
    text-align: center;
  }
  #grid-breakpoints [data-cell] {
    background: var(--xh-bg-subtle);
    color: var(--xh-fg-default);
  }
  #grid-breakpoints [data-head] {
    background: var(--xh-bg-brand-subtle);
    color: var(--xh-fg-brand-strong);
  }
  #grid-breakpoints [data-label] {
    font-size: 13px;
    color: var(--xh-fg-muted);
  }
  #grid-breakpoints [data-inner] {
    margin-block-start: 6px;
  }
</style>

<!-- 宿主设 display: contents，排布落在 root 上 -->
<xh-grid id="grid-breakpoints" gap="lg" style="display: contents">
  <div data-xh-part="root">
    <!-- 一档一行：左边档位名，右边这一档从多宽起生效 -->
    <div data-xh-part="item">
      <div data-label>档位与生效宽度</div>
      <xh-grid cols="2" gap="sm" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" data-head>档位</div>
          <div data-xh-part="item" data-head>生效宽度</div>
          <div data-xh-part="item" data-cell>base</div>
          <div data-xh-part="item" data-cell>0（起始档）</div>
          <div data-xh-part="item" data-cell>sm</div>
          <div data-xh-part="item" data-cell>≥ 640px</div>
          <div data-xh-part="item" data-cell>md</div>
          <div data-xh-part="item" data-cell>≥ 768px</div>
          <div data-xh-part="item" data-cell>lg</div>
          <div data-xh-part="item" data-cell>≥ 1024px</div>
          <div data-xh-part="item" data-cell>xl</div>
          <div data-xh-part="item" data-cell>≥ 1280px</div>
        </div>
      </xh-grid>
    </div>

    <!-- 五档写全：一路拉宽窗口，每过一道断点这片格子就少排一行 -->
    <div data-xh-part="item">
      <div data-label>五档写全：cols = { base: 1, sm: 2, md: 3, lg: 4, xl: 6 }</div>
      <xh-grid cols='{"base":1,"sm":2,"md":3,"lg":4,"xl":6}' gap="sm" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
          <div data-xh-part="item" data-cell>丁</div>
          <div data-xh-part="item" data-cell>戊</div>
          <div data-xh-part="item" data-cell>己</div>
          <div data-xh-part="item" data-cell>庚</div>
          <div data-xh-part="item" data-cell>辛</div>
          <div data-xh-part="item" data-cell>壬</div>
          <div data-xh-part="item" data-cell>癸</div>
          <div data-xh-part="item" data-cell>子</div>
          <div data-xh-part="item" data-cell>丑</div>
        </div>
      </xh-grid>
    </div>
  </div>
</xh-grid>
`;export{a as default};

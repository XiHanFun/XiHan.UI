var e=`<!-- 整卡可点 | interactive 加标题里的 trigger：整张卡片都是点击区，读屏只读到一个链接 -->
<!-- 链接只包标题文字：可及名就是「季度报告」，卡片里的其余内容不进链接名 -->
<xh-card interactive>
  <div data-xh-part="root" style="inline-size: 360px; max-inline-size: 100%">
    <div data-xh-part="header">
      <div data-xh-part="title">
        <a data-xh-part="trigger" href="#/reports/2026-q3">季度报告</a>
      </div>
      <div data-xh-part="description">2026 年第三季度 · 财务部</div>
    </div>
    <div data-xh-part="content">营收同比增长 12%，毛利率持平。</div>
    <!-- 脚部叠在点击区之上：里面的按钮照常可点，不触发整卡 -->
    <div data-xh-part="footer">
      <xh-button size="sm" variant="ghost">
        <button data-xh-part="root" type="button">收藏</button>
      </xh-button>
    </div>
  </div>
</xh-card>
`;export{e as default};
const a=`<!-- 延时 | openDelay 默认 700ms，closeDelay 默认 300ms——那段收起等待正是留给指针从触发器走到卡片上的通行时间 -->
<div style="display: flex; flex-wrap: wrap; gap: 24px">
  <xh-hover-card placement="bottom-start">
    <div data-xh-part="root">
      <button data-xh-part="trigger">默认（700 / 300）</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <span>停够 700ms 才展开，指针移开 300ms 才收起。</span>
        </div>
      </div>
    </div>
  </xh-hover-card>

  <xh-hover-card placement="bottom-start" open-delay="0" close-delay="800">
    <div data-xh-part="root">
      <button data-xh-part="trigger">快开慢收（0 / 800）</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <span>指针一进就展开，移开后还留 800ms 给你走回来。</span>
        </div>
      </div>
    </div>
  </xh-hover-card>
</div>
`;export{a as default};

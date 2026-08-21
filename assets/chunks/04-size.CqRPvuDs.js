const t=`<!-- 尺寸 | 三档换的是卡片的内边距与字号，不写 size 即缺省档；把指针停在触发器上看差别 -->
<div style="display: flex; flex-wrap: wrap; gap: 24px">
  <xh-hover-card size="sm" placement="bottom-start" open-delay="0">
    <div data-xh-part="root">
      <button data-xh-part="trigger">小</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <strong>小档</strong>
          <span>size = sm。</span>
        </div>
      </div>
    </div>
  </xh-hover-card>

  <xh-hover-card placement="bottom-start" open-delay="0">
    <div data-xh-part="root">
      <button data-xh-part="trigger">缺省</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <strong>缺省档</strong>
          <span>size = 未指定。</span>
        </div>
      </div>
    </div>
  </xh-hover-card>

  <xh-hover-card size="lg" placement="bottom-start" open-delay="0">
    <div data-xh-part="root">
      <button data-xh-part="trigger">大</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <strong>大档</strong>
          <span>size = lg。</span>
        </div>
      </div>
    </div>
  </xh-hover-card>
</div>
`;export{t as default};

const i=`<!-- 一屏多张 | slidesPerPage 决定一屏露几张，一次翻几张缺省跟着它走，所以仍是整屏翻 -->
<xh-carousel slide-count="6" slides-per-page="2" spacing="12px">
  <div data-xh-part="root" style="inline-size: 100%">
    <!-- 不回绕：首页的上一张与末页的下一张转成原生 disabled -->
    <button data-xh-part="prev-trigger">‹</button>
    <div data-xh-part="viewport" style="block-size: 120px">
      <div data-xh-part="item-group">
        <div data-xh-part="item" index="0">
          <div style="display: grid; place-items: center; block-size: 100%">
            第一张
          </div>
        </div>
        <div data-xh-part="item" index="1">
          <div style="display: grid; place-items: center; block-size: 100%">
            第二张
          </div>
        </div>
        <div data-xh-part="item" index="2">
          <div style="display: grid; place-items: center; block-size: 100%">
            第三张
          </div>
        </div>
        <div data-xh-part="item" index="3">
          <div style="display: grid; place-items: center; block-size: 100%">
            第四张
          </div>
        </div>
        <div data-xh-part="item" index="4">
          <div style="display: grid; place-items: center; block-size: 100%">
            第五张
          </div>
        </div>
        <div data-xh-part="item" index="5">
          <div style="display: grid; place-items: center; block-size: 100%">
            第六张
          </div>
        </div>
      </div>
    </div>
    <button data-xh-part="next-trigger">›</button>
    <!-- 六张两两一屏，整屏翻即三页 -->
    <div data-xh-part="indicator-group">
      <button data-xh-part="indicator" index="0"></button>
      <button data-xh-part="indicator" index="1"></button>
      <button data-xh-part="indicator" index="2"></button>
    </div>
  </div>
</xh-carousel>
`;export{i as default};

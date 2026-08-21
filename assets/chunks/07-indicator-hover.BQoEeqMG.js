const t=`<!-- 指示点悬停切页 | 指示点上补一个原生 mouseenter 就是悬停切页，组件自带的点击翻页照旧 -->
<xh-carousel id="carousel-hover" slide-count="4">
  <div data-xh-part="root" style="inline-size: 100%">
    <div data-xh-part="viewport" style="block-size: 130px">
      <div data-xh-part="item-group">
        <div data-xh-part="item" index="0">
          <div style="display: grid; place-items: center; block-size: 100%">
            城市夜景
          </div>
        </div>
        <div data-xh-part="item" index="1">
          <div style="display: grid; place-items: center; block-size: 100%">
            海岸线
          </div>
        </div>
        <div data-xh-part="item" index="2">
          <div style="display: grid; place-items: center; block-size: 100%">
            雪山
          </div>
        </div>
        <div data-xh-part="item" index="3">
          <div style="display: grid; place-items: center; block-size: 100%">
            沙漠
          </div>
        </div>
      </div>
    </div>
    <div data-xh-part="indicator-group">
      <button data-xh-part="indicator" index="0"></button>
      <button data-xh-part="indicator" index="1"></button>
      <button data-xh-part="indicator" index="2"></button>
      <button data-xh-part="indicator" index="3"></button>
    </div>
    <span id="carousel-hover-readout" style="flex-basis: 100%">
      鼠标扫过下面的圆点即可换页，当前第 1 / 4 页
    </span>
  </div>
</xh-carousel>

<script type="module">
  // mouseenter 是落到指示点按钮上的原生事件，转手按一下它自带的点击就换页
  const carousel = document.getElementById("carousel-hover");
  const readout = document.getElementById("carousel-hover-readout");

  for (const indicator of carousel.querySelectorAll('[data-xh-part="indicator"]')) {
    indicator.addEventListener("mouseenter", () => indicator.click());
  }

  carousel.addEventListener("page-change", (event) => {
    readout.textContent = \`鼠标扫过下面的圆点即可换页，当前第 \${event.detail.page + 1} / 4 页\`;
  });
<\/script>
`;export{t as default};

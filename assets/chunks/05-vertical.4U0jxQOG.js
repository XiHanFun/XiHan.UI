const t=`<!-- 纵向轨道 | orientation 换成 vertical 后轨道竖着位移，两端按钮落到上下两头，翻页认的是上下方向键 -->
<xh-carousel id="carousel-vertical" orientation="vertical" slide-count="3">
  <div data-xh-part="root" style="inline-size: 240px">
    <button data-xh-part="prev-trigger">∧</button>
    <!-- 纵轨的裁切窗口靠高度定，宽度交给根节点 -->
    <div data-xh-part="viewport" style="block-size: 96px; inline-size: 100%">
      <div data-xh-part="item-group">
        <div data-xh-part="item" index="0">
          <div style="display: grid; place-items: center; block-size: 100%">
            09:00 晨会
          </div>
        </div>
        <div data-xh-part="item" index="1">
          <div style="display: grid; place-items: center; block-size: 100%">
            11:00 客户沟通
          </div>
        </div>
        <div data-xh-part="item" index="2">
          <div style="display: grid; place-items: center; block-size: 100%">
            15:00 联调
          </div>
        </div>
      </div>
    </div>
    <button data-xh-part="next-trigger">∨</button>
    <div data-xh-part="indicator-group">
      <button data-xh-part="indicator" index="0"></button>
      <button data-xh-part="indicator" index="1"></button>
      <button data-xh-part="indicator" index="2"></button>
    </div>
    <span id="carousel-vertical-readout">第 1 / 3 条</span>
  </div>
</xh-carousel>

<script type="module">
  // 页码回显跟着 page-change 走
  const carousel = document.getElementById("carousel-vertical");
  const readout = document.getElementById("carousel-vertical-readout");
  carousel.addEventListener("page-change", (event) => {
    readout.textContent = \`第 \${event.detail.page + 1} / 3 条\`;
  });
<\/script>
`;export{t as default};

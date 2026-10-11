var e=`<!-- 指针拖拽 | allowPointerDrag 开启后按住轨道即可拖动，松手落回整页；关闭则只有触摸的原生滚动 -->
<xh-carousel
  id="carousel-drag"
  slide-count="4"
  allow-pointer-drag
  loop
>
  <div data-xh-part="root" style="inline-size: 100%">
    <button data-xh-part="prev-trigger"></button>
    <div data-xh-part="viewport" style="block-size: 130px">
      <div data-xh-part="list">
        <div data-xh-part="item" index="0">
          <div style="display: grid; place-items: center; block-size: 100%">
            拖我
          </div>
        </div>
        <div data-xh-part="item" index="1">
          <div style="display: grid; place-items: center; block-size: 100%">
            再拖
          </div>
        </div>
        <div data-xh-part="item" index="2">
          <div style="display: grid; place-items: center; block-size: 100%">
            还能拖
          </div>
        </div>
        <div data-xh-part="item" index="3">
          <div style="display: grid; place-items: center; block-size: 100%">
            最后一张
          </div>
        </div>
      </div>
    </div>
    <button data-xh-part="next-trigger"></button>
    <div data-xh-part="indicator-group">
      <button data-xh-part="indicator" index="0"></button>
      <button data-xh-part="indicator" index="1"></button>
      <button data-xh-part="indicator" index="2"></button>
      <button data-xh-part="indicator" index="3"></button>
    </div>
  </div>
</xh-carousel>
<span id="carousel-drag-readout" data-demo-output>第 1 / 4 页</span>

<script type="module">
  // 松手落到哪一页，跟着 page-change 回显
  const carousel = document.getElementById("carousel-drag");
  const readout = document.getElementById("carousel-drag-readout");

  carousel.addEventListener("page-change", (event) => {
    readout.textContent = \`第 \${event.detail.page + 1} / 4 页\`;
  });
<\/script>
`;export{e as default};
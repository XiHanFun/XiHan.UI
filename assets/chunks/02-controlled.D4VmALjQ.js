var e=`<!-- 受控 | 传入 page 后由宿主决定，组件只发 page-change 不自行修改页码，宿主写回后才变化 -->
<div id="carousel-controlled" style="inline-size: 100%; display: grid; gap: 12px">
  <xh-carousel id="carousel-controlled-host" slide-count="3" page="1">
    <div data-xh-part="root">
      <button data-xh-part="prev-trigger"></button>
      <div data-xh-part="viewport" style="block-size: 120px">
        <div data-xh-part="list">
          <div data-xh-part="item" index="0">
            <div style="display: grid; place-items: center; block-size: 100%">
              登录
            </div>
          </div>
          <div data-xh-part="item" index="1">
            <div style="display: grid; place-items: center; block-size: 100%">
              选套餐
            </div>
          </div>
          <div data-xh-part="item" index="2">
            <div style="display: grid; place-items: center; block-size: 100%">
              付款
            </div>
          </div>
        </div>
      </div>
      <button data-xh-part="next-trigger"></button>
    </div>
  </xh-carousel>

  <!-- 页码握在宿主手里，外部按钮直接改它 -->
  <div style="display: flex; align-items: center; gap: 8px">
    <xh-button variant="outline" size="sm"><button data-xh-part="root" data-page="0">跳到「登录」</button></xh-button>
    <xh-button variant="outline" size="sm"><button data-xh-part="root" data-page="1">跳到「选套餐」</button></xh-button>
    <xh-button variant="outline" size="sm"><button data-xh-part="root" data-page="2">跳到「付款」</button></xh-button>
  </div>
  <span id="carousel-controlled-readout" data-demo-output>当前第 2 张</span>
</div>

<script type="module">
  // 组件只发意图，页码由这里写回去
  const host = document.getElementById("carousel-controlled");
  const carousel = document.getElementById("carousel-controlled-host");
  const readout = document.getElementById("carousel-controlled-readout");

  function setPage(page) {
    carousel.page = page;
    readout.textContent = \`当前第 \${page + 1} 张\`;
  }

  carousel.addEventListener("page-change", (event) => setPage(event.detail.page));

  for (const button of host.querySelectorAll("[data-page]")) {
    button.addEventListener("click", () => setPage(Number(button.dataset.page)));
  }
<\/script>
`;export{e as default};
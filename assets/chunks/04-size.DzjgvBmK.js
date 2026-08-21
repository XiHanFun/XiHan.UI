const t=`<!-- 尺寸 | 三档换的是浮层的内边距与字号，不写 size 即缺省档；逐个点开触发器看差别 -->
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-popover size="sm" placement="bottom-start">
    <button data-xh-part="trigger">小</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title">小档</h3>
        <p data-xh-part="description">size = sm。</p>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-popover>

  <!-- 中间档不写 size，缺省即中档 -->
  <xh-popover placement="bottom-start">
    <button data-xh-part="trigger">缺省</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title">缺省档</h3>
        <p data-xh-part="description">size = 未指定。</p>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-popover>

  <xh-popover size="lg" placement="bottom-start">
    <button data-xh-part="trigger">大</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title">大档</h3>
        <p data-xh-part="description">size = lg。</p>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-popover>
</div>
`;export{t as default};

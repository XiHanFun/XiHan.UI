const t=`<!-- 朝向与间距 | placement 是请求值，空间不够时定位引擎会自动翻面；offset 调的是浮层与触发器的距离 -->
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-popover placement="top" offset="8">
    <button data-xh-part="trigger">上方</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <p data-xh-part="description">请求的朝向是 top。</p>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-popover>

  <xh-popover placement="right" offset="8">
    <button data-xh-part="trigger">右侧</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <p data-xh-part="description">请求的朝向是 right。</p>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-popover>

  <xh-popover placement="bottom-end" offset="16">
    <button data-xh-part="trigger">下方靠尾（间距 16）</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <p data-xh-part="description">请求的朝向是 bottom-end。</p>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-popover>
</div>
`;export{t as default};

const t=`<!-- 朝向与间距 | placement 是请求值，空间不够时定位引擎会自动翻面；offset 调的是卡片与触发器的距离 -->
<div style="display: flex; flex-wrap: wrap; gap: 24px">
  <xh-hover-card placement="top" offset="8" open-delay="0">
    <div data-xh-part="root">
      <button data-xh-part="trigger">上方</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <strong>上方</strong>
          <span>请求的朝向是 top，间距 8px。</span>
        </div>
      </div>
    </div>
  </xh-hover-card>

  <xh-hover-card placement="right" offset="8" open-delay="0">
    <div data-xh-part="root">
      <button data-xh-part="trigger">右侧</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <strong>右侧</strong>
          <span>请求的朝向是 right，间距 8px。</span>
        </div>
      </div>
    </div>
  </xh-hover-card>

  <xh-hover-card placement="bottom-end" offset="20" open-delay="0">
    <div data-xh-part="root">
      <button data-xh-part="trigger">下方靠尾（间距 20）</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <strong>下方靠尾（间距 20）</strong>
          <span>请求的朝向是 bottom-end，间距 20px。</span>
        </div>
      </div>
    </div>
  </xh-hover-card>
</div>
`;export{t as default};

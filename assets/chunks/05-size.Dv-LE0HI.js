const t=`<!-- 尺寸 | size 换的是条目的内边距、图文间距与两行文字的字号，不传 size 即默认档 -->
<!-- 三份宿主都设 display: contents，三个 root 直接当排布容器的子项 -->
<div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
  <xh-list size="sm" bordered split style="display: contents">
    <ul data-xh-part="root" style="inline-size: 200px">
      <li data-xh-part="item">
        <div data-xh-part="item-content">
          <div data-xh-part="item-title">小</div>
          <div data-xh-part="item-description">说明文字</div>
        </div>
      </li>
      <li data-xh-part="item">
        <div data-xh-part="item-content">
          <div data-xh-part="item-title">第二条</div>
          <div data-xh-part="item-description">说明文字</div>
        </div>
      </li>
    </ul>
  </xh-list>

  <!-- 中间一档不写 size -->
  <xh-list bordered split style="display: contents">
    <ul data-xh-part="root" style="inline-size: 200px">
      <li data-xh-part="item">
        <div data-xh-part="item-content">
          <div data-xh-part="item-title">默认</div>
          <div data-xh-part="item-description">说明文字</div>
        </div>
      </li>
      <li data-xh-part="item">
        <div data-xh-part="item-content">
          <div data-xh-part="item-title">第二条</div>
          <div data-xh-part="item-description">说明文字</div>
        </div>
      </li>
    </ul>
  </xh-list>

  <xh-list size="lg" bordered split style="display: contents">
    <ul data-xh-part="root" style="inline-size: 200px">
      <li data-xh-part="item">
        <div data-xh-part="item-content">
          <div data-xh-part="item-title">大</div>
          <div data-xh-part="item-description">说明文字</div>
        </div>
      </li>
      <li data-xh-part="item">
        <div data-xh-part="item-content">
          <div data-xh-part="item-title">第二条</div>
          <div data-xh-part="item-description">说明文字</div>
        </div>
      </li>
    </ul>
  </xh-list>
</div>
`;export{t as default};

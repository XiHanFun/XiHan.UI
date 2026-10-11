var e=`<!-- 媒体位与操作位 | 条目最完整的形态：媒体、标题、说明、操作四个位都放置 -->
<!-- 宿主设 display: contents，列表落在 root 上 -->
<xh-list variant="outline" hoverable split style="display: contents">
  <ul data-xh-part="root" style="max-inline-size: 420px">
    <li data-xh-part="item">
      <!-- 媒体位画什么由使用者决定，这里放一个首字头像 -->
      <div data-xh-part="item-media">
        <xh-avatar>
          <span data-xh-part="root">
            <span data-xh-part="fallback">张</span>
          </span>
        </xh-avatar>
      </div>
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">张三</div>
        <div data-xh-part="item-description">zhangsan@example.com</div>
      </div>
      <div data-xh-part="item-action">
        <xh-button variant="outline" size="sm">
          <button data-xh-part="root">移除</button>
        </xh-button>
      </div>
    </li>
    <li data-xh-part="item">
      <div data-xh-part="item-media">
        <xh-avatar>
          <span data-xh-part="root">
            <span data-xh-part="fallback">李</span>
          </span>
        </xh-avatar>
      </div>
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">李四</div>
        <div data-xh-part="item-description">lisi@example.com</div>
      </div>
      <div data-xh-part="item-action">
        <xh-button variant="outline" size="sm">
          <button data-xh-part="root">移除</button>
        </xh-button>
      </div>
    </li>
  </ul>
</xh-list>
`;export{e as default};
const a=`<!-- 尺寸 | size 换整条路径的字号与各层之间的间距，不传 size 即默认档 -->
<div style="inline-size: 100%; display: grid; gap: 16px">
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 40px; flex: none; font-size: 12px">小</span>
    <xh-breadcrumb size="sm">
      <nav data-xh-part="root">
        <ol data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/">首页</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components">组件</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components/breadcrumb" current>
              面包屑
            </a>
          </li>
        </ol>
      </nav>
    </xh-breadcrumb>
  </div>

  <!-- 这一档不写 size，落在默认 -->
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 40px; flex: none; font-size: 12px">默认</span>
    <xh-breadcrumb>
      <nav data-xh-part="root">
        <ol data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/">首页</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components">组件</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components/breadcrumb" current>
              面包屑
            </a>
          </li>
        </ol>
      </nav>
    </xh-breadcrumb>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 40px; flex: none; font-size: 12px">大</span>
    <xh-breadcrumb size="lg">
      <nav data-xh-part="root">
        <ol data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/">首页</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components">组件</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components/breadcrumb" current>
              面包屑
            </a>
          </li>
        </ol>
      </nav>
    </xh-breadcrumb>
  </div>
</div>
`;export{a as default};

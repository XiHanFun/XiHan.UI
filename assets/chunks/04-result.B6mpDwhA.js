const t=`<!-- 用作结果页 | 同一套部件也承载 404、403 这类结果：换掉图标与文案，操作槽里放回退出口 -->
<!-- 随页面一起出现的静态结果，不是就地更新的活区，所以关掉播报 -->
<xh-empty-state live="off" size="sm">
  <div data-xh-part="root" style="inline-size: 240px">
    <span data-xh-part="icon">?</span>
    <p data-xh-part="title">404 页面不存在</p>
    <p data-xh-part="description">地址可能敲错了，或者这条记录已经被删掉。</p>
    <div data-xh-part="action">
      <xh-button size="sm" variant="outline">
        <button data-xh-part="root">回到首页</button>
      </xh-button>
    </div>
  </div>
</xh-empty-state>

<xh-empty-state live="off" size="sm">
  <div data-xh-part="root" style="inline-size: 240px">
    <span data-xh-part="icon">⊘</span>
    <p data-xh-part="title">403 没有权限</p>
    <p data-xh-part="description">这块内容需要更高的角色，找管理员要一下。</p>
    <div data-xh-part="action">
      <xh-button size="sm" variant="outline">
        <button data-xh-part="root">申请权限</button>
      </xh-button>
    </div>
  </div>
</xh-empty-state>

<xh-empty-state live="off" size="sm">
  <div data-xh-part="root" style="inline-size: 240px">
    <span data-xh-part="icon">!</span>
    <p data-xh-part="title">500 服务出错</p>
    <p data-xh-part="description">请求没能处理完，稍后再试一次。</p>
    <div data-xh-part="action">
      <xh-button size="sm" variant="outline">
        <button data-xh-part="root">重试</button>
      </xh-button>
    </div>
  </div>
</xh-empty-state>
`;export{t as default};

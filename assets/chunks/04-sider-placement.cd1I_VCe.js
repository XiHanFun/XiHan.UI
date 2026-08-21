const d=`<!-- 侧栏位置 | sider-placement 决定侧栏挂在行首还是行尾，分隔线也跟着换到挨内容的那一边 -->
<div style="display: grid; gap: 16px">
  <xh-layout sider-placement="start" bordered>
    <div
      data-xh-part="root"
      style="block-size: 160px; border-radius: 8px; overflow: hidden"
    >
      <div data-xh-part="header">侧栏在行首</div>
      <div data-xh-part="sider">导航</div>
      <div data-xh-part="content">正文</div>
    </div>
  </xh-layout>

  <xh-layout sider-placement="end" bordered>
    <div
      data-xh-part="root"
      style="block-size: 160px; border-radius: 8px; overflow: hidden"
    >
      <div data-xh-part="header">侧栏在行尾</div>
      <div data-xh-part="sider">属性面板</div>
      <div data-xh-part="content">正文</div>
    </div>
  </xh-layout>
</div>
`;export{d as default};

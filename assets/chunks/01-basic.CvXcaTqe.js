const d=`<!-- 基础用法 | 头与脚各横贯一行，侧栏与内容并排占中间那一行；少写一段就少一行或少一列 -->
<xh-layout bordered>
  <div
    data-xh-part="root"
    style="block-size: 280px; border-radius: 8px; overflow: hidden"
  >
    <div data-xh-part="header">控制台</div>
    <div data-xh-part="sider">导航</div>
    <div data-xh-part="content">
      正文区。四段都可缺省，只摆头和内容也是一副合法的骨架。
    </div>
    <div data-xh-part="footer">版本 1.0.0</div>
  </div>
</xh-layout>
`;export{d as default};

const n=`<!-- 基础用法 | root 的高度由外部给定，滚动才发生在 viewport 里面；root / viewport / content 三层缺一不可 -->
<div style="width: 100%">
  <!-- 高度写在 root 上：viewport 撑满剩余空间，溢出部分自己滚 -->
  <xh-thread>
    <div data-xh-part="root" style="block-size: 220px">
      <div data-xh-part="viewport">
        <div data-xh-part="content">
          <p style="margin: 0"><strong>用户：</strong>这个对话区是怎么分层的？</p>
          <p style="margin: 0">
            <strong>助手：</strong>root 定框，viewport 负责滚动，content 包住全部消息。
          </p>
          <p style="margin: 0"><strong>用户：</strong>为什么一定要给高度？</p>
          <p style="margin: 0">
            <strong>助手：</strong>不给一个确定的框，内容永远不溢出，滚动与粘底都无从谈起。
          </p>
          <p style="margin: 0"><strong>用户：</strong>消息本身归谁管？</p>
          <p style="margin: 0">
            <strong>助手：</strong>归你。组件不碰数据，content 里放什么都行。
          </p>
        </div>
      </div>
    </div>
  </xh-thread>
</div>
`;export{n as default};

const a=`<!-- 摘要与耗时 | 详情收起时也能看到查询内容与运行时长；两个时刻由宿主提供，组件自身不读取时钟 -->
<div style="display: flex; flex-direction: column; gap: 8px">
  <xh-tool-call phase="output-available" start-time="0" end-time="1240">
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span data-xh-part="indicator"></span>
        <span data-xh-part="label">search</span>
        <span data-xh-part="summary">{ "query": "xihan ui 组件" }</span>
        <span data-xh-part="status"></span>
        <!-- 秒数由宿主现场代入，连接层只交出毫秒数 -->
        <span data-xh-part="duration">1.2s</span>
      </button>
      <div data-xh-part="content">
        <div data-xh-part="output">找到 3 条结果。</div>
      </div>
    </div>
  </xh-tool-call>
  <xh-tool-call phase="output-available" start-time="0" end-time="420">
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span data-xh-part="indicator"></span>
        <span data-xh-part="label">apply_patch</span>
        <!-- 减号是 U+2212 而不是连字符：它与数字同宽，配等宽数位才不会左右挪 -->
        <span data-xh-part="summary">+12 −3 src/index.ts</span>
        <span data-xh-part="status"></span>
        <span data-xh-part="duration">0.4s</span>
      </button>
      <div data-xh-part="content">
        <div data-xh-part="output">已写入 1 个文件。</div>
      </div>
    </div>
  </xh-tool-call>
</div>
`;export{a as default};

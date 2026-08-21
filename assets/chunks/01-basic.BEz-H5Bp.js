const n=`<!-- 基础用法 | 点触发器就地问一句，确认与取消都收起浮层；展开时焦点先落在取消上 -->
<div style="display: flex; align-items: center; gap: 16px">
  <xh-popconfirm id="popconfirm-basic">
    <div data-xh-part="root">
      <button data-xh-part="trigger">删除这条记录</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">删除后不可恢复</h2>
          <p data-xh-part="description">这条记录连同它的附件一起清掉。</p>
          <button data-xh-part="cancel-trigger">取消</button>
          <button data-xh-part="confirm-trigger">删除</button>
        </div>
      </div>
    </div>
  </xh-popconfirm>
  <span id="popconfirm-basic-answer">还没答复</span>
</div>

<script type="module">
  // 两颗按钮各派一个事件，答复写到旁边
  const host = document.getElementById("popconfirm-basic");
  const answer = document.getElementById("popconfirm-basic-answer");
  host.addEventListener("confirm", () => {
    answer.textContent = "已删除";
  });
  host.addEventListener("cancel", () => {
    answer.textContent = "已取消";
  });
<\/script>
`;export{n as default};

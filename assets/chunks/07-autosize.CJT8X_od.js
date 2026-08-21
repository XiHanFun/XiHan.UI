const t=`<!-- 随内容长高 | 输入框的高度跟着内容走，rows 定的是起始行数；不手动拖拽，也不写死高度 -->
<div style="width: 100%; display: grid; gap: 12px">
  <!-- 起始一行：敲到第二行时框自己变高 -->
  <xh-composer>
    <div data-xh-part="root">
      <textarea
        data-xh-part="input"
        placeholder="按 Shift+Enter 换行试试"
        rows="1"
      ></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-composer>

  <!-- 初值就是好几行，挂载时框已经是撑开的 -->
  <xh-composer
    default-value="第一行&#10;第二行&#10;第三行&#10;再多敲几行，框会继续往下长"
  >
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="1"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-composer>
</div>
`;export{t as default};

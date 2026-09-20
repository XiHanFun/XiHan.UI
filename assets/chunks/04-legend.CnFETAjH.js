const n=`<!-- 图例与无效值 | label 为读屏提供有含义的名字；无法解析的串只剩棋盘格并标为无效 -->
<div style="display: flex; flex-direction: column; gap: 8px">
  <ul style="display: flex; gap: 16px; margin: 0; padding: 0; list-style: none">
    <li style="display: inline-flex; align-items: center; gap: 6px">
      <!-- 读屏念「已完成」，不念 #10b981 -->
      <xh-color-swatch value="#10b981" label="已完成" size="sm"><span data-xh-part="root"></span></xh-color-swatch>
      <span style="font-size: 13px">已完成</span>
    </li>
    <li style="display: inline-flex; align-items: center; gap: 6px">
      <xh-color-swatch value="#3b82f6" label="进行中" size="sm"><span data-xh-part="root"></span></xh-color-swatch>
      <span style="font-size: 13px">进行中</span>
    </li>
    <li style="display: inline-flex; align-items: center; gap: 6px">
      <xh-color-swatch value="#e11d48" label="已逾期" size="sm"><span data-xh-part="root"></span></xh-color-swatch>
      <span style="font-size: 13px">已逾期</span>
    </li>
  </ul>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <!-- 颜色关键字不在支持的写法里：只画棋盘格，描边换成危险色，名字仍念作者写的串 -->
    <xh-color-swatch value="tomato"><span data-xh-part="root"></span></xh-color-swatch>
    <span style="font-size: 13px">tomato（无效：不认颜色关键字）</span>
  </span>
</div>
`;export{n as default};

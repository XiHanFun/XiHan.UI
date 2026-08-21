const t=`<!-- 手动激活 | activation-mode="manual" 时方向键只搬焦点，按 Enter 或空格才真的切面板 -->
<xh-tabs default-value="daily" activation-mode="manual">
  <div data-xh-part="root" style="inline-size: 100%">
    <div data-xh-part="list">
      <button data-xh-part="trigger" value="daily">日报</button>
      <button data-xh-part="trigger" value="weekly">周报</button>
      <button data-xh-part="trigger" value="monthly">月报</button>
    </div>

    <div data-xh-part="content" value="daily">日报面板</div>
    <div data-xh-part="content" value="weekly">周报面板</div>
    <div data-xh-part="content" value="monthly">月报面板</div>
  </div>
</xh-tabs>
`;export{t as default};

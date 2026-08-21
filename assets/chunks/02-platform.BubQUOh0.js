const a=`<!-- 平台写法 | 同一份 keys 两套写法：Mac 出符号且键帽连排，其余平台出单词并用加号连接 -->
<div style="display: flex; align-items: center; gap: 24px">
  <!-- 显式写 platform 时以它为准，实测值不再插手；这一节只演写法，命中不拦浏览器的默认动作 -->
  <span style="display: flex; align-items: center; gap: 8px">
    <span>Mac</span>
    <xh-hotkeys keys="Mod,Shift,P" platform="mac" prevent-default="false">
      <span data-xh-part="root"></span>
    </xh-hotkeys>
  </span>
  <span style="display: flex; align-items: center; gap: 8px">
    <span>其余平台</span>
    <xh-hotkeys keys="Mod,Shift,P" platform="other" prevent-default="false">
      <span data-xh-part="root"></span>
    </xh-hotkeys>
  </span>
</div>
`;export{a as default};

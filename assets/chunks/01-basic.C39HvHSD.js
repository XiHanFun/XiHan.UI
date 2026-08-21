const t=`<!-- 基础用法 | 一组相关按钮连成一条：相邻两段共用一条边，圆角只留在两端 -->
<!-- 段是组根的直接子节点；形态写在组上，组内每段都取得到 -->
<xh-button-group variant="outline">
  <div data-xh-part="root">
    <xh-button>
      <button data-xh-part="root">日</button>
    </xh-button>
    <xh-button>
      <button data-xh-part="root">周</button>
    </xh-button>
    <xh-button>
      <button data-xh-part="root">月</button>
    </xh-button>
  </div>
</xh-button-group>
`;export{t as default};

const t=`<!-- 基础用法 | 单选分段控件：root 是 radiogroup、条目是 radio；整组只占一个 Tab 位，进组后四个方向键都能走 -->
<!-- 不传 value 即非受控，default-value 只给初值 -->
<xh-toggle-group default-value="left">
  <div data-xh-part="root">
    <button data-xh-part="item" value="left">左对齐</button>
    <button data-xh-part="item" value="center">居中</button>
    <button data-xh-part="item" value="right">右对齐</button>
  </div>
</xh-toggle-group>
`;export{t as default};

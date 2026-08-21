const n=`<!-- 小数位与千位分隔 | precision 定小数位，separator 定分隔符；不给分隔符就不分隔，插什么符号是地区习惯 -->
<p>
  整数、不分隔：
  <xh-number-animation from="0" to="1234567">
    <span data-xh-part="root"></span>
  </xh-number-animation>
</p>
<p>
  整数、逗号分隔：
  <xh-number-animation from="0" to="1234567" separator=",">
    <span data-xh-part="root"></span>
  </xh-number-animation>
</p>
<p>
  两位小数、空格分隔：
  <xh-number-animation from="0" to="1234567.89" precision="2" separator=" ">
    <span data-xh-part="root"></span>
  </xh-number-animation>
</p>
<p>
  负数也认：
  <xh-number-animation from="0" to="-8642.5" precision="1" separator=",">
    <span data-xh-part="root"></span>
  </xh-number-animation>
</p>
`;export{n as default};

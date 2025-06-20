<template>
  <div class="button-demos">
    <!-- 基础用法 -->
    <section class="demo-section">
      <h2>基础用法</h2>
      <div class="demo-row">
        <XhButton>默认按钮</XhButton>
        <XhButton type="primary">主要按钮</XhButton>
        <XhButton type="success">成功按钮</XhButton>
        <XhButton type="warning">警告按钮</XhButton>
        <XhButton type="error">错误按钮</XhButton>
        <XhButton type="info">信息按钮</XhButton>
      </div>
    </section>

    <!-- 朴素按钮 -->
    <section class="demo-section">
      <h2>朴素按钮</h2>
      <div class="demo-row">
        <XhButton plain>朴素按钮</XhButton>
        <XhButton type="primary" plain>主要按钮</XhButton>
        <XhButton type="success" plain>成功按钮</XhButton>
        <XhButton type="warning" plain>警告按钮</XhButton>
        <XhButton type="error" plain>错误按钮</XhButton>
        <XhButton type="info" plain>信息按钮</XhButton>
      </div>
    </section>

    <!-- 文本按钮 -->
    <section class="demo-section">
      <h2>文本按钮</h2>
      <div class="demo-row">
        <XhButton text>文本按钮</XhButton>
        <XhButton type="primary" text>主要文本按钮</XhButton>
        <XhButton type="success" text>成功文本按钮</XhButton>
        <XhButton type="warning" text>警告文本按钮</XhButton>
        <XhButton type="error" text>错误文本按钮</XhButton>
        <XhButton type="info" text>信息文本按钮</XhButton>
      </div>
    </section>

    <!-- 幽灵按钮 -->
    <section class="demo-section">
      <h2>幽灵按钮</h2>
      <div class="demo-row">
        <XhButton ghost>幽灵按钮</XhButton>
        <XhButton type="primary" ghost>主要幽灵按钮</XhButton>
        <XhButton type="success" ghost>成功幽灵按钮</XhButton>
        <XhButton type="warning" ghost>警告幽灵按钮</XhButton>
        <XhButton type="error" ghost>错误幽灵按钮</XhButton>
        <XhButton type="info" ghost>信息幽灵按钮</XhButton>
      </div>
    </section>

    <!-- 按钮尺寸 -->
    <section class="demo-section">
      <h2>按钮尺寸</h2>
      <div class="demo-row">
        <XhButton size="small" type="primary">小型按钮</XhButton>
        <XhButton type="primary">默认按钮</XhButton>
        <XhButton size="large" type="primary">大型按钮</XhButton>
      </div>
    </section>

    <!-- 按钮形状 -->
    <section class="demo-section">
      <h2>按钮形状</h2>
      <div class="demo-row">
        <XhButton shape="square">方形按钮</XhButton>
        <XhButton shape="round">圆角按钮</XhButton>
        <XhButton shape="circle" icon="fa-star-solid"></XhButton>
      </div>
    </section>

    <!-- 图标按钮 -->
    <section class="demo-section">
      <h2>图标按钮</h2>
      <div class="demo-row">
        <XhButton>
          <template #prefix>
            <XhIcon name="fa-search-solid" />
          </template>
          搜索
        </XhButton>
        <XhButton type="primary">
          上传
          <template #suffix>
            <XhIcon name="fa-upload-solid" />
          </template>
        </XhButton>
      </div>
    </section>

    <!-- 加载状态 -->
    <section class="demo-section">
      <h2>加载状态</h2>
      <div class="demo-row">
        <XhButton loading>加载中</XhButton>
        <XhButton type="primary" loading>加载中</XhButton>
        <XhButton type="success" loading>加载中</XhButton>
        <XhButton type="warning" loading></XhButton>
        <XhButton type="error" loading circle></XhButton>
      </div>
    </section>

    <!-- 禁用状态 -->
    <section class="demo-section">
      <h2>禁用状态</h2>
      <div class="demo-row">
        <XhButton disabled>禁用按钮</XhButton>
        <XhButton type="primary" disabled>禁用按钮</XhButton>
        <XhButton type="success" disabled plain>禁用按钮</XhButton>
        <XhButton type="info" disabled round>禁用按钮</XhButton>
        <XhButton type="error" disabled circle icon="fa-trash-solid"></XhButton>
      </div>
    </section>

    <!-- 块级按钮 -->
    <section class="demo-section">
      <h2>块级按钮</h2>
      <div class="demo-row">
        <XhButton type="primary" block>块级按钮</XhButton>
        <XhButton type="success" block round>圆角块级按钮</XhButton>
      </div>
    </section>

    <!-- 无障碍支持 -->
    <section class="demo-section">
      <h2>无障碍支持</h2>
      <div class="demo-row">
        <XhButton aria-label="关闭对话框">×</XhButton>
        <XhButton aria-describedby="button-desc">提交</XhButton>
        <span id="button-desc" class="visually-hidden">点击后将提交表单数据</span>
        <XhButton aria-pressed="true">已选中</XhButton>
        <XhButton aria-expanded="true" aria-controls="menu">菜单</XhButton>
        <div id="menu" role="menu" hidden>
          <!-- 菜单内容 -->
        </div>
      </div>
    </section>
  </div>
</template>

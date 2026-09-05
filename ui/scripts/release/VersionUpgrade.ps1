# 设置控制台编码为 UTF-8 以正确显示中文
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$ErrorActionPreference = 'Stop'

# 标题打在这里：.bat 只负责快捷调用，直接跑 .ps1 也该看到同样的开头
Write-Output ""
Write-Output "========================================"
Write-Output " VersionUpgrade - XiHan.UI"
Write-Output "========================================"

# 本脚本只做一件事：把全部库包的版本号一起抬到下一个号，顺带把变更集收成 CHANGELOG。
# 提交、合并 main、打标签、发 npm 都不在这里——发布由 .github/workflows/release.yml
# 在 main 上的 v* 标签触发。文档站的更新日志在发布之后另行补。

# 脚本在 ui/scripts/release 下，工作区根在上两级
$uiRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $uiRoot

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Error "找不到 pnpm，请先安装：npm i -g pnpm"
}

# Windows PowerShell 5.1 的 Get-Content 默认按 ANSI 读，UTF-8 的 JSON 读进来是乱码，
# 解析会断在第一段中文上。这里一律按 UTF-8 显式读。
function Read-JsonFile([string]$Path) {
    return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
}

# 版本真源取 kernel 的 package.json：库包锁步同版，kernel 的号就是整套库的号
$kernelPkgPath = Join-Path $uiRoot 'packages\engine\kernel\package.json'
$currentVersion = (Read-JsonFile $kernelPkgPath).version

Write-Output "当前版本：$currentVersion"

# 锁步核对：库包必须同版，不同版就先修好再发
& node tooling/scripts/check-version-lock.mjs
if ($LASTEXITCODE -ne 0) {
    Write-Error "库包版本不一致，发版前必须先统一"
}

# 预发布模式记在 .changeset/pre.json；标签与它对不上会发出与预期不同的版本
$prePath = Join-Path $uiRoot '.changeset\pre.json'
$preTag = if (Test-Path $prePath) { (Read-JsonFile $prePath).tag } else { $null }
if ($preTag) {
    Write-Output "预发布通道：$preTag（.changeset/pre.json 存在）"
}
else {
    Write-Output "预发布通道：正式（无 .changeset/pre.json）"
}

# 待消费的变更集：.changeset 下除 README.md 与 config.json 之外的 .md
$changesets = @(Get-ChildItem (Join-Path $uiRoot '.changeset') -Filter *.md -File |
        Where-Object { $_.Name -ne 'README.md' })
Write-Output "待消费的变更集：$($changesets.Count) 份"

# 变更集推导出的下一个号：--output 只写 JSON，不改任何文件
$planPath = Join-Path ([System.IO.Path]::GetTempPath()) "xihan-ui-release-plan.json"
if (Test-Path $planPath) { Remove-Item $planPath -Force }
& pnpm exec changeset status --output $planPath | Out-Null
$derivedVersion = $null
$derivedType = $null
if (Test-Path $planPath) {
    $plan = Read-JsonFile $planPath
    $bumping = @($plan.releases | Where-Object { $_.type -ne 'none' })
    if ($bumping.Count -gt 0) {
        $derivedVersion = $bumping[0].newVersion
        $derivedType = $bumping[0].type
    }
    Remove-Item $planPath -Force
}

if ($derivedVersion) {
    Write-Output "按变更集推导：$currentVersion -> $derivedVersion（$derivedType）"
}
else {
    Write-Output "按变更集推导：没有待发布的变更"
}

# 升级类型。指定级别时补一份合成变更集，让 changesets 落到那个号上；
# 合成变更集的正文会进 CHANGELOG，所以要求写清这一版为什么是这个级别
Write-Output ""
Write-Output "请选择升级类型："
Write-Output "0: 退出"
Write-Output "1: 按变更集推导$(if ($derivedVersion) { "（$derivedVersion）" })"
Write-Output "2: 主版本（有对外 API 被删掉或改名时才用）"
Write-Output "3: 次版本"
Write-Output "4: 修订版本"
$upgradeType = Read-Host ">>> 请选择升级类型 (0-4)"

$forcedLevel = $null
switch ($upgradeType) {
    '0' { Write-Output "退出"; exit }
    '1' {
        if (-not $derivedVersion) {
            Write-Output "没有待发布的变更，无从推导。退出"
            exit
        }
    }
    '2' { $forcedLevel = 'major' }
    '3' { $forcedLevel = 'minor' }
    '4' { $forcedLevel = 'patch' }
    default { Write-Output "无效的选择，退出程序"; exit }
}

if ($forcedLevel) {
    # changesets 取全部变更集里最高的那一级，补进来的级别低于已有的就不起作用
    $rank = @{ patch = 1; minor = 2; major = 3 }
    if ($derivedType -and $rank[$forcedLevel] -lt $rank[$derivedType]) {
        Write-Output "已有变更集里最高是 $derivedType，补一份 $forcedLevel 不会把号降下来。退出"
        exit
    }
    $reason = Read-Host ">>> 这一版为什么是 $forcedLevel（这句会进 CHANGELOG）"
    if ([string]::IsNullOrWhiteSpace($reason)) {
        Write-Output "没有写理由，退出程序"
        exit
    }
    $synthetic = Join-Path $uiRoot ".changeset\version-upgrade-$forcedLevel.md"
    $body = "---`n`"@xihan-ui/core`": $forcedLevel`n---`n`n$reason`n"
    [System.IO.File]::WriteAllText($synthetic, $body, (New-Object System.Text.UTF8Encoding $false))
    Write-Output "已写入合成变更集：$synthetic"
}

# 发布通道。npm 的 dist-tag 与版本后缀都由 pre 模式决定，
# check-release-tag 会拿标签名与 pre.json 对账
Write-Output ""
Write-Output "请选择发布通道："
Write-Output "0: 保持当前$(if ($preTag) { "（$preTag）" } else { "（正式）" })"
Write-Output "1: 开发版 Alpha，如 1.1.0-alpha.0"
Write-Output "2: 测试版 Beta，如 1.1.0-beta.0"
Write-Output "3: 候选版 Rc，如 1.1.0-rc.0"
Write-Output "4: 正式版，如 1.1.0"
$releaseType = Read-Host ">>> 请选择发布通道 (0-4)"

switch ($releaseType) {
    '0' { }
    '1' { if ($preTag -ne 'alpha') { & pnpm exec changeset pre enter alpha } }
    '2' { if ($preTag -ne 'beta') { & pnpm exec changeset pre enter beta } }
    '3' { if ($preTag -ne 'rc') { & pnpm exec changeset pre enter rc } }
    '4' { if ($preTag) { & pnpm exec changeset pre exit } }
    default { Write-Output "无效的选择，退出程序"; exit }
}

Write-Output ""
$target = if ($forcedLevel) { "按 $forcedLevel 提升" } else { "升到 $derivedVersion" }
$confirm = Read-Host ">>> 确认把库包版本从 $currentVersion $target (Y|y / N|n)"
if ($confirm -notin @('Y', 'y')) {
    Write-Output "取消升级"
    exit
}

# 消费变更集：改各包 package.json 的 version、写各包 CHANGELOG.md、删掉用掉的变更集
& pnpm run version
if ($LASTEXITCODE -ne 0) {
    Write-Error "changeset version 失败"
}

$newVersion = (Read-JsonFile $kernelPkgPath).version
Write-Output ""
Write-Output "版本已升到：$newVersion"

& node tooling/scripts/check-version-lock.mjs
if ($LASTEXITCODE -ne 0) {
    Write-Error "升级之后库包版本仍不一致"
}

# kernel 在构建期把 package.json 的 version 内联进产物（XIHAN_UI_METADATA.version），
# 不重新构建的话产物里还是上一个号，装的人会看到 core.version-mismatch。
# TURBO_FORCE 绕开缓存：这个仓出现过该重跑却命中缓存的情况
Write-Output ""
$build = Read-Host ">>> 是否重新构建（版本号要重新内联进产物）(Y|y / N|n)"
if ($build -in @('Y', 'y')) {
    Write-Output "正在构建……"
    $env:TURBO_FORCE = '1'
    & pnpm build
    Remove-Item Env:\TURBO_FORCE
    if ($LASTEXITCODE -ne 0) {
        Write-Error "构建失败"
    }
}

Write-Output ""
Write-Output "========================================"
Write-Output " 接下来（脚本不做，请手工确认后执行）"
Write-Output "========================================"
Write-Output "1. 检查改动：git status / git diff"
Write-Output "2. 提交：    git commit -m `"build: v$newVersion`""
Write-Output "3. 合并到 main：release.yml 只放行 main 历史里的标签"
Write-Output "4. 打标签：  git tag v$newVersion"
Write-Output "5. 推标签：  git push origin v$newVersion"
Write-Output "   -> GitHub Actions 的 Release 工作流构建、跑 gate:publish、发到 npm"
Write-Output "6. 发布之后再补 docs/changelog.md 的 v$newVersion 一节"
Write-Output ""

# 1yuan-shop 部署脚本（飞书妙搭）
# 在 PowerShell 里运行：  .\deploy.ps1
# 前提：本机已经 `lark-cli auth login --domain apps` 过，且身份 status=ready

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

# 1. 校验产物
$index = Join-Path $PSScriptRoot "index.html"
if (-not (Test-Path $index)) { throw "未找到 index.html，请先 cd 到 D:\codex\yuan-shop" }

# 2. 创建应用
$createOut = & lark-cli apps +create --name "1元灵感小店 · AI 解梦/抽签/写诗/起名/嘴替" --app-type HTML 2>&1
Write-Host $createOut
$app = ($createOut | Out-String | ConvertFrom-Json).data.app.app_id
if (-not $app) { throw "create 失败：$createOut" }
Write-Host "app_id = $app" -ForegroundColor Green

# 3. 发布 HTML
$pubOut = & lark-cli apps +html-publish --app-id $app --path $PSScriptRoot 2>&1
Write-Host $pubOut
$url = ($pubOut | Out-String | ConvertFrom-Json).data.url
if (-not $url) { throw "publish 失败：$pubOut" }
Write-Host "访问链接 = $url" -ForegroundColor Green

# 4. 设为企业全员可访问（如果想互联网公开，把 --scope tenant 改为 --scope public --require-login false）
$scopeOut = & lark-cli apps +access-scope-set --app-id $app --scope tenant 2>&1
Write-Host $scopeOut
Write-Host "`n✅ 完成。访问 $url 查看" -ForegroundColor Green

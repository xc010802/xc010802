# scrub-secrets.ps1
# PowerShell 脚本：清理 Git 历史中的敏感字符串并强制推送到远程（Windows 环境）
# 使用说明：
# 1) 在运行前，立即在相关服务（例如 QQ 邮箱）侧重置/撤销所有暴露的 SMTP 授权码。
# 2) 安装 Python + pip（如果尚未安装），并安装 git-filter-repo：
#      pip install git-filter-repo
# 3) 将本脚本与 replacements.txt 放在同一目录（或按需编辑路径），然后用管理员/开发者权限运行 PowerShell：
#      Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#      .\scrub-secrets.ps1
# 说明：此操作会重写仓库历史并强制推送（--force --mirror）。所有合作者之后必须重新克隆仓库。

# --- 配置（请根据你的仓库修改）
$repoUrl = 'https://github.com/xc010802/xc010802.git'   # 你的仓库 URL（替换为 SSH URL 也可）
$mirrorDir = 'repo-mirror.git'
$replacementsFile = 'replacements.txt'

Write-Host "请确保你已在邮箱服务端旋转/撤销 SMTP 授权码（强烈推荐）" -ForegroundColor Yellow
Write-Host "目标仓库： $repoUrl" -ForegroundColor Cyan

if (-not (Test-Path $replacementsFile)) {
  Write-Error "找不到 $replacementsFile，请先创建并写入要替换/移除的敏感字符串（见 README 范例）。脚本退出。"
  exit 1
}

# 检查 git-filter-repo 是否可用
if (-not (Get-Command git-filter-repo -ErrorAction SilentlyContinue)) {
  Write-Host "git-filter-repo 未安装。尝试通过 pip 安装..." -ForegroundColor Yellow
  python -m pip install --user git-filter-repo
  if (-not (Get-Command git-filter-repo -ErrorAction SilentlyContinue)) {
    Write-Error "git-filter-repo 安装失败。请手动安装： pip install git-filter-repo，然后重试。"
    exit 1
  }
}

# 克隆为镜像仓库
if (Test-Path $mirrorDir) {
  Write-Host "删除已有镜像目录 $mirrorDir" -ForegroundColor Yellow
  Remove-Item -Recurse -Force $mirrorDir
}

Write-Host "开始克隆（--mirror）..." -ForegroundColor Green
git clone --mirror $repoUrl $mirrorDir
if ($LASTEXITCODE -ne 0) { Write-Error "git clone --mirror 失败"; exit 1 }

# 运行 git-filter-repo 替换
Set-Location $mirrorDir
Write-Host "运行 git-filter-repo --replace-text ..\$replacementsFile ..." -ForegroundColor Green
git filter-repo --replace-text "..\$replacementsFile"
if ($LASTEXITCODE -ne 0) { Write-Error "git-filter-repo 运行失败"; exit 1 }

# 推送到远程（强制覆盖）
Write-Host "推送修改回远程（慎重：将重写远端历史）..." -ForegroundColor Red
git push --force --mirror $repoUrl
if ($LASTEXITCODE -ne 0) { Write-Error "git push --force --mirror 失败"; exit 1 }

Write-Host "清理完成。请让所有合作者重新克隆仓库： git clone <仓库URL>" -ForegroundColor Green
Write-Host "建议：在 README 添加说明，使用 .env 存放敏感配置，并在 GitHub 仓库设置中使用 Secrets 管理 CI/部署凭证。" -ForegroundColor Cyan

# 返回原目录
Set-Location ..\
环境变量与部署说明

请不要把真实凭证（如 SMTP 授权码、私钥、JWT_SECRET）提交到仓库。建议使用 .env 文件（在本地）和 GitHub Secrets（在远端 CI/CD）来管理敏感信息。

1. 本地开发
- 复制 .env.example 为 .env：
  cp .env.example .env
  （Windows PowerShell: Copy-Item .env.example .env）
- 填写 .env 中的 SMTP_USER / SMTP_PASS 等字段。
- 启动开发服务器：
  pnpm dev

2. 邮件配置（QQ 邮箱示例）
- 登录 QQ 邮箱网页版 -> 设置 -> 账户 -> POP3/SMTP 服务 -> 开启服务并生成授权码（授权码即 SMTP_PASS）。
- 请不要使用邮箱登录密码作为 SMTP_PASS；使用授权码，并在发现泄露时立即撤销/重置。

3. 在 GitHub 上配置 Secrets（用于生产部署或 GitHub Actions）
- 进入仓库 Settings -> Secrets and variables -> Actions -> New repository secret。
- 建议添加： SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, JWT_SECRET, DATABASE_URL（如适用）。

4. 强制发送真实邮件（仅在开发时慎用）
- 本项目在开发环境默认会直接返回验证码以便调试。如果你确实需要在开发环境发送真实邮件，请设置环境变量：
  FORCE_SEND_REAL_EMAIL=true
  并确保已正确配置 SMTP_* 环境变量。

5. 安全建议
- 发现凭证被提交后：立刻在服务端旋转凭证（更改/撤销授权码），然后使用 git-filter-repo 等工具从仓库历史中清理（脚本 scrub-secrets.ps1 已包含在仓库根目录）。
- 所有合作者在仓库历史被重写后需重新 clone 仓库。

如需，我可以：
- 把 .env.example 提交到仓库（已创建为 README-ENV.md，可改名或合并到主 README）；
- 帮你生成 README 的一段并提交为 README.md；
- 或者在仓库中添加 CI 配置示例，展示如何在 GitHub Actions 中使用 Secrets。
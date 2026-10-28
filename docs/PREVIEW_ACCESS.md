# 预览匿名访问修复

2026-10-28，用户反馈test域名被账号密码阻挡。preview环境免认证；regression及未知环境仍走原认证，Worker和R2桶的直接开发入口保持关闭。仅部署预览Worker，版本94c3b40e-3a73-4d8c-b96f-8e8ff4eec65e。没有改动SDK、游戏数据或原包/解包边界。

实际Wrangler生成类型一致、Worker严格类型检查通过。pnpm preview:check未发送Authorization，52文件3964825解码字节与本地dist相同、音频Range返回206且前64字节一致；testsdk匿名仍401。全新Playwright context未提供httpCredentials，实际首页200→原开始按钮→前导，单Canvas，0个401/页面异常。raw仅artifacts/public-preview。

运行：直接访问https://test.morgana.love/。回归使用testsdk.morgana.love，预览无下载限速。

# fata.morgana.love 正式入口

2026-11-07，用户选择独立正式域名 fata.morgana.love，与现有
requiem.morgana.love 并列。主域名属于另一粉丝站工程，本轮未修改它或
Requiem 的代码、SDK、Worker、R2、域名和存档。

发布判断：已验收范围内，没有已知阻断主线、普通图文存读档或已读持久化
的问题。此前27项线上检查、40,175已读的旧线上v4→v5存储布局升级和完整
预览字节闭包验证通过。不能据此说整作已经100%原作等价；长期便携备份的
JSON容量上限、原档互通、字体/确认动画、原生历史行缓冲等仍在差异清单中。

正式环境：

- Worker：fata-morgana，独立 production 环境与 generated/edge-production。
- Custom Domain：fata.morgana.love，workers.dev/版本预览URL关闭。
- 复用原有专用私有R2的SHA资产，原包/脚本/登录/日志不上传Git。
- production明确公开页面/媒体；regression和未知角色仍先验证认证。
- 正式构建在编译时关闭 __test 导入钩子，test-seed 动态模块不进入发布。
  正常玩家仍使用原标题、原菜单和同一正式SDK。

正式前端以小型独立构建覆盖已验收预览树的前端文件，程序/文本不重编。
7184个PB/预压缩二进制逐个SHA相同；SDK仍d222adf212da（源码bd2cab2）。
正式入口SHA：2715e0e45ceafd8ac1b69ad8cc7dffb097a738d06d92115d37f33823e88b52c7。

本地门槛：pnpm check/production build及Worker类型通过。实际workerd验证
原regression的Brotli/Range/缓存/鉴权，再重启为production验证匿名前端、
protobuf、R2及版本条件。10项正式前端浏览器通过：八语标题和钩子关闭；
中英通过实际按钮开局、缩略图保存、刷新、原载入菜单恢复，全程无开发钩子。
临时本地验证服务的ETag/immutable配置错误曾被SDK拒绝，修正测试服务后
完整10项通过；没有降低SDK完整性要求或修改产品协议迁就测试。

新域名的浏览器存档按来源隔离，不会自动出现测试站IndexedDB进度。保留
原test入口和旧域数据，不设置强制跳转、不将两作存档合并。大进度备份
限制尚未关闭，本轮不宣称跨域存档已经自动迁移。

实际命令：

```sh
pnpm exec wrangler types
pnpm build:production
python3 tooling/test-worker-cache.py
pnpm exec tsc -p tsconfig.worker.json
pnpm exec playwright test --config playwright.production.config.ts
pnpm exec wrangler deploy --env production --dry-run
# 实际发布CLI使用OAuth，并移除客户端HTTP(S)/ALL代理变量：
pnpm exec wrangler deploy --env production
# 上线后使用相同的真实UI检查：
FATA_PRODUCTION_ORIGIN=https://fata.morgana.love pnpm exec playwright test --config playwright.production.config.ts
```

原始结果、临时验证服务、截图/trace、清单/存档与日志均在被ignore的
artifacts/production-2026-11-07；生产前端临时目录dist.production同样ignore。

## 实际上线

源代码提交cb1b307已正常快进推送实例main，SDK仍为bd2cab2。本次没有重写
历史，也没有上传游戏载荷到GitHub。

- 正式版本：2e5c0234-5759-4f62-b856-e72134a4f39f，100%流量；
  HTTPS匿名200，X-Morgana-Deployment为production。
- 新Worker首次资源上传会话完成5092个后，上传JWT过期而停止；第二会话在
  同一冻结构建上复用已有文件，上传剩余1693个并成功发布。没有并行发布
  两个构建，也没有更改资源或摘要来绕过传输失败。
- 线上真实UI同一组10项全部通过，0失败、0跳过、0flaky，约3.8分钟。
  八语标题无pageerror；中英原菜单缩略图保存/刷新/载入成功，__fataTest关闭。
- 只读部署列表确认原preview仍7b65d519-05bf-4d8e-b620-d48c5791c568，
  regression仍6b39ba1b-5aff-4627-80f0-b5367e68caa7，Requiem仍
  4e89a3e2-beae-4e61-88f8-065958cfed60；Requiem首页HTTPS200、HTML摘要
  与发布前相同。正式Worker部署列表确认唯一当前版本承接100%流量。

正式静态树7195文件、3546724669字节（解码后）已全部逐文件通过本地build/
发布树/远端字节核验，0摘要差异。匿名页面、实际媒体Range 206及回归站匿名
401检查通过，没有服务端节流。本轮R2验证为实际UI资源加载与媒体Range，
完整对象字节闭包证据沿用前批记录；程序/文本/媒体的边界保持原样。

上线后字节检查实际命令：

```sh
FATA_CHECK_TARGET=production FATA_PREVIEW_VERSION=2e5c0234-5759-4f62-b856-e72134a4f39f FATA_PREVIEW_WORKERS=8 FATA_PREVIEW_TIMEOUT=90 python3 tooling/check-preview.py
pnpm exec wrangler deployments list --env production
pnpm exec wrangler deployments list --env ''
pnpm exec wrangler deployments list --env regression
pnpm exec wrangler deployments list --name requiem-morgana --env ''
```

部署列表与发布命令使用现有OAuth且移除客户端代理变量；网站核验保留本机
正常网络代理。断流只重试传输，不放宽逐文件本地build/发布树/远端摘要断言。

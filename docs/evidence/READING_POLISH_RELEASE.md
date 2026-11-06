# 阅读收尾发布（2026-11-07）

用户本轮明确授权继续推送、部署。独立实例和 SDK 都按现有历史快进推送，
仅更新各自 main；未强推、未推旧分支/tag。实例运行源码基线为5ef9bda，
SDK源码bd2cab2，实际独立依赖包SHA256：
`d222adf212da1921716a6b0c35b38d3672137388b0d5d96a40d02793a314e915`。

本批包括：标题展示数据最多4并发；源空书签提示；历史当前已揭示正文及
等待中的显完前缀；注释追加/明确换行；512记录显示窗口；v5存储布局消除
重复live head；530条普通角色名格式、103处明确角色重置、168处注释名字，
以及五语五/八章75地址的15主线点运行/存刷矩阵。仍不把记录数当作原生
500/2000行缓冲，也未扩大原档互通、逐像素或任意入口角色缓存的认证范围。

已发布可玩预览 `7b65d519-05bf-4d8e-b620-d48c5791c568`（100%流量），鉴权回归
`6b39ba1b-5aff-4627-80f0-b5367e68caa7`。回归站全部27项检查通过：网络3项、
五语75个明确重置地址的15项存刷、长历史5项、等待正文前缀4项，0失败/
0跳过/0不稳定。另有旧线上真实40,175已读存档的v4→v5布局升级检查通过，
原位置/历史/进度/缩略图保留。匿名预览保存刷新和两站八语身份核对通过。
预览7196文件/3546727202字节逐一等于本地dist；媒体Range206、匿名预览和
回归站匿名401边界均通过。传输截断按原界限重试，没有放宽任何摘要断言。

发布与验收：

- 原实例12个提交、SDK4个提交的远端main均为祖先；可达历史路径及新增
  对象未发现原包/KS/TJS/素材载荷、私有目录或凭据，两个main推送成功。
- pnpm build通过，3478个PB，2188916940解码/209381294压缩字节。
  独立的两个edge目录各7196个文件/3546727202字节，入口SHA为
  dbaaae629d89859b45cd3ff0bd20e65e89b5daa1562f64ef155ad5d3b5f5828c。
- 75点只读矩阵复核通过；Worker dry run通过；OAuth沿用已有本机登录。
- R2闭包仍为5134个原SHA对象，无新增。上次全量HTTPS证据保留；本轮将
  当前对象逐个与已验发布树generated/history-main比对，5134身份不变，
  Range/条件请求/鉴权和暖缓存复测通过。中止的全量探测不计作本轮全量完成。
- 在旧线上回归站通过实际旧前端保存40175条已读和缩略图，存储布局为v4，
  物理IndexedDB数据库版本仍为2。保留隔离浏览器目录用于升级后检查；
  不将存储布局版本混称为IndexedDB数据库版本。

实际命令：

```sh
git fetch origin main
git -C galbox fetch origin main
python3 artifacts/release-2026-11-07/git-audit.py
pnpm build
pnpm exec tsx tooling/audit-history-late-reset-matrix.ts
FATA_PUBLICATION_ROOT=generated/integrated python3 tooling/upload-r2.py --bulk --oauth
FATA_PUBLICATION_ROOT=generated/integrated python3 tooling/probe-r2.py --changed-from generated/history-main
pnpm exec tsx tooling/prepare-edge.ts regression
pnpm exec tsx artifacts/release-2026-11-07/storage-upgrade.ts prepare
env -u CLOUDFLARE_API_TOKEN pnpm exec wrangler deploy --env regression
pnpm exec tsx artifacts/release-2026-11-07/storage-upgrade.ts check
MORGANA_RUN=reading-release-network pnpm exec playwright test --config playwright.integrated.remote.config.ts
MORGANA_RUN=reading-release-roles pnpm exec playwright test --config playwright.reading-release.remote.config.ts
MORGANA_RUN=reading-release-storage pnpm exec playwright test --config playwright.reading-storage.remote.config.ts
MORGANA_RUN=reading-release-prefix pnpm exec playwright test --config playwright.reading-prefix.remote.config.ts
pnpm exec tsx tooling/prepare-edge.ts preview
# 下列Wrangler网络命令的客户端同时移除HTTP(S)/ALL代理变量，沿用OAuth：
pnpm exec wrangler versions upload
pnpm exec wrangler versions deploy 7b65d519-05bf-4d8e-b620-d48c5791c568@100% --env '' --yes
FATA_PREVIEW_VERSION=7b65d519-05bf-4d8e-b620-d48c5791c568 FATA_PREVIEW_WORKERS=8 FATA_PREVIEW_TIMEOUT=90 python3 tooling/check-preview.py
NODE_USE_ENV_PROXY=1 pnpm exec tsx artifacts/release-2026-11-07/verify-identity.ts preview
pnpm exec tsx artifacts/release-2026-11-07/preview-browser.ts
```

上传遇到客户端代理链路偏慢时，先终止原上传进程，再对同一冻结构建移除
发布客户端HTTP(S)/ALL代理变量重试；原已确认的1587个静态对象复用，仅剩
503个需传。没有并行发布同一Worker，也未修改Worker/R2/预览的流量策略。
两个域名继续为独立Worker/前端目录，共用原私有SHA资产桶。

登录资料、原资料、存档、依赖包、构建、完整日志/截图/trace/摘要收据均留在
ignored private/vendor/generated/artifacts目录；Git只收源码、测试和短报告。

回归站先通过后，可玩预览采用先上传版本、再100%切换；两站各自上传2090个
变化文件。Wrangler日志的7221条包含25目录，实际静态文件为7196个；未把
目录计入文件验收数量。QA配置和报告另作正常追加提交，运行构建源码不变。

最终收据：artifacts/release-2026-11-07/remote-results.json（27项）、
storage-upgrade.json（40175已读、v4→v5）、preview-browser.json（匿名存刷）、
preview-identity.json/regression-identity.json（各41文件/127496254字节、八语）、
preview-full-check.log与同preview UUID的7196条摘要收据。静态全站核对包括
历史兼容清单和预压缩文件；没有只抽样活动正文后宣称全站一致。

本轮没有重新认证原作像素、原生tft互通、全部结局累计耐久或原历史行缓冲。
这些差异继续列在REPLICA_GAPS；本批发布的是已通过的阅读/存储收尾。

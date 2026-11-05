# 历史注释整合发布（2026-11-05）

已发布preview 8edb1a99-1ecd-41ce-aa87-470fa775de18，regression
1c39b3f0-98fe-4722-8d4b-6ddd130d92da。八语普通/通关第四门共5672条历史专用
操作已合并完整主包；正文/调用返回/旧进度保留。默认显示仍64条，源行缓冲、
未确认正文、跨段追加/角色重置及字体族/像素差异继续记录，F-05/整作goal仍active。

八语精确差异、32个旧点迁移/冷恢复/继续、中英四项真实旧档/图文保存刷新、
第四门原门槛到第五门接续均通过。中英完整累计已读保留，其他语言通关夹具
范围明确，不冒称自身完整累计游玩。见[主包合并](HISTORY_MAIN_COMPOSITION.md)。
SDK实际包1216747da2fc4194c6fe01d855dcd97350a1c998218d9fe0ed51ced1b2162d15，
来源239ef68；470单元/跨模块/真实存储及独立实包消费此前已验收。

实际发布命令：

- pnpm exec tsx tooling/stage-history-main.ts --promote
- FATA_PUBLICATION_ROOT=generated/integrated python3 tooling/upload-r2.py --bulk --oauth
- pnpm build
- pnpm exec tsx tooling/prepare-edge.ts regression；env -u CLOUDFLARE_API_TOKEN pnpm exec wrangler deploy --env regression
- MORGANA_RUN=history-main-network pnpm exec playwright test --config playwright.integrated.remote.config.ts
- MORGANA_RUN=history-main-notes pnpm exec playwright test --config playwright.history-main.remote.config.ts --grep cleared
- pnpm exec tsx tooling/prepare-edge.ts preview；env -u CLOUDFLARE_API_TOKEN pnpm exec wrangler deploy
- FATA_PREVIEW_VERSION=8edb1a99-1ecd-41ce-aa87-470fa775de18 FATA_PREVIEW_WORKERS=4 FATA_PREVIEW_TIMEOUT=90 pnpm preview:check

门槛先核对父版、当前SDK/版本、旧指令、全部旧来源目录及原选择/自动存档点，
再写发布树与integrated，cuts未进入发布目录。素材5134对象/1178097269字节，
仅新增2个字体；旧闭包全部保留，上传与完整R2字节验证0失败。pnpm check/build
通过。两个Worker/前端目录隔离，共用私有SHA资产。

最终regression网络3项（旧回忆继续/中文CDP慢网/损坏代码拒绝重试）、中英累计
通关旧档2项（保留原位置/完整进度、继续新注释、图文保存刷新）共5通过，
0失败/0跳过。两站前端指纹均为
dda801c097d8906c7c0f6cd3457acd3fea081c97db346dd9a58d833e3697235f。
两站分别上传286个变化文件；regression原任务内网络重传成功，没有并行重启。

最终preview全部5136文件/2560647178解码字节逐文件等于dist，匿名200、媒体
Range206、regression匿名401隔离通过，无traffic shaping。首次核对因响应体
反复截断IncompleteRead终止，未报告摘要不一致；确认终态后沿同UUID/收据续跑，
仅验收客户端设并发4/读取90秒，所有hash/字节/访问断言与重试界限保持。生产
站/Worker/R2未限速。原结果在artifacts/history-main-preview-check-resume.log及
history-main-preview-verification.json；线上五项在artifacts/remote/history-main-*-results.json。

整作内容已贯通至终章，剩余功能/原作表现对照按原目标继续，不将本次发布
作为原生tft互通、全部历史缓冲或原作逐像素认证。

# 历史注释整合发布（2026-11-05）

八语普通/通关第四门已合并到完整主包，本地发布门槛通过。范围为补回原
hisout/hisname历史记录；默认仍显示64条，原行缓冲、未确认正文、角色重置/
跨段追加及字体族/像素差异仍跟踪，不将本批称为F-05或整作100%完成。

八语合计5672条新增操作，32个旧点迁移通过。原有指令顺序/
调用返回、全局/UI/布局/旧样式逐项核对保留；字体为源字符并集，其余旧资源
不变。中英真实浏览器4项、四门→五门接续与近四万已读保留通过，其他语言
通关夹具不冒充其自身累计进度。见HISTORY_MAIN_COMPOSITION.md。

实际命令：

- pnpm exec tsx tooling/stage-history-main.ts --promote
- FATA_PUBLICATION_ROOT=generated/integrated python3 tooling/upload-r2.py --bulk --oauth
- pnpm build

stage核对父版、当前SDK/版本、旧指令差异、旧源目录及选择/自动存档点元数据，
再生成发布目录和提升integrated；cuts未进入发布树。资源闭包5134对象/
1178097269字节，新增2个字体，其余SHA对象复用；上传已完成。

后续为regression部署、当前构建网络回归与preview最终字节核对，尚未完成前
不提前填写线上版本。当前线上仍ca5086fd；SDK实包为1216747da2fc，来源239ef68。

本地build已通过，regression独立目录准备完成。当前前端指纹
dda801c097d8906c7c0f6cd3457acd3fea081c97db346dd9a58d833e3697235f；
regression上传286个变化静态文件。完整R2闭包字节校验已通过，0失败；原结果
见artifacts/history-main-r2-verify.log。前端部署仍在执行，不提前标记线上更新。

regression已部署为1c39b3f0-98fe-4722-8d4b-6ddd130d92da，286个变化文件
上传完成，原任务内网络重传成功，未重新启动重复部署。正在运行
MORGANA_RUN=history-main-network pnpm exec playwright test --config
playwright.integrated.remote.config.ts，以及MORGANA_RUN=history-main-notes
pnpm exec playwright test --config playwright.history-main.remote.config.ts --grep cleared。
两组通过后再切preview，生产站未做CDP或服务端限速。

# 历史注释前导换行

2026-11-06，本地收尾。第四门开头的两次hr及若干注释前的明确换行此前未显示。
八语普通/通关共506个源地址现增加534次换行提示；剧情Program、指令顺序、
文字、调用、存档身份及资源均不改，展示数据只新增historyLeading字段。
SDK继续使用d222adf212da（bd2cab2），无引擎或原档格式变更。

## 有限来源与去重

计划只回溯注释前相邻的hr/已知格式；不越过标签、输出切换、控制流或角色
宏。按原始token的具体源位置标记已归入上一条注释尾部的hr，不重复计数。
空的/no-op历史注释不充当尾换行载体。韩语6处显式hr已由名字重置提示覆盖，
本轮不再附加。未知hr属性、源版本及有界计量之外的值明确拒绝。

MainWindow.hr调用及HistoryLayer.store/reline均核对实际源；reline的两种
源实现按SHA锁定，中日与韩/西文分开。正文/注释的对齐边界仍依据源元数据；
必要的DOM段落边界吸收一次实际换行，避免因切换居中再多出一行。

提示以实际rich.at绑定，只有仍保留的记录才显示。发现此前某些旧切点已
越过开头、初始注释不在历史中，因此另验“不从源后文补造已丢记录”，并
通过原章节菜单取得新的开头正例；没有把缺失旧记录重新塞回存档。

这补齐显式前导hr的显示，不等于原作500/2000行环形缓冲或全角色缓存完成。
其它非相邻hr、跨控制流/宏副作用和原作字体/逐像素行高仍另验。

## 实际验收

- 18项针对性测试：相邻格式/尾换行归属/输出开关、空注释、控制边界、未知
  参数与上限拒绝、真实protobuf提示传输、八语16种第四门源IR不变、旧历史
  分组/名字/分片回归；渲染不改Snapshot或已读，截掉目标记录也不重建空行。
- 八语16个普通/通关开头点，走正式SDK主线原章节菜单，非隔离回放、不手改
  PC。冷恢复/继续、只读渲染通过；另核对原迁移切点的记录不因显示变更增加。
  中英通关使用记录的七结局累计进度，其他六语通关沿用旧夹具的声明范围。
- 8项浏览器：英中韩普通/通关共6项，前导两次hr仅显示一次、原槽字节与
  修订保留，完整进度及图文保存刷新通过；韩语2项既有名字换行不重复。
- 提升门槛核对8个父清单/展示SHA、全部代码体SHA、仅新增该字段、16个冷点
  与8项浏览器的SDK/发行/展示身份，再只替换默认title文档。旧SHA对象保留，
  未新增媒体或代码模块。

实际命令：

```sh
pnpm exec tsx tooling/compile-history-leading.ts --clone
pnpm exec tsx tooling/compile-history-leading.ts all
pnpm exec tsx --test tests/history-leading.test.ts tests/history-linebreaks.test.ts tests/history-content.test.ts tests/history-speaker-hints.test.ts tests/history-parts.test.ts
pnpm exec tsx tooling/verify-history-leading.ts all
pnpm exec playwright test --config playwright.history-leading.config.ts
pnpm check
pnpm exec tsx tooling/promote-history-leading.ts
pnpm build
pnpm exec tsx artifacts/history-leading/default-smoke.ts
```

候选在generated/history-leading，来源收据、切点、测量与截图/trace在
artifacts/history-leading，均ignore。headless媒体仍由测试驱动模拟，浏览器
使用真实本地资源；这是源参数/浏览器验证，不冒充原作运行录制。
只正常追加本地提交，未推送/部署。

最终build通过：3478个PB，2188773602解码字节、209364343压缩字节。
4184默认入口以中文普通第四门实际切点验证两次前导换行，完整历史不变；
预览已启动，无pageerror。SDK子模块保持bd2cab2，未新增SDK提交。

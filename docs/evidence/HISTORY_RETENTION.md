# 阅读历史保留窗口

2026-11-06，本地收尾。八语正文的回收窗口与历史显示窗口统一为512条记录，
替换先前的64条显示及64/128条正文回收。Core还会保留当前窗口必需的少量额外记录，界面的当前已揭示、尚未确认正文仍计入
显示上限。菜单中明确保留1条的清空操作维持原意；回退切点仍最多64条，
实例继续关闭rollback，不增加整页回退快照。

这修复了长读时过早丢掉历史的问题。记录数不是原HistoryLayer的行数，
不据此宣称原作500/2000行环形缓冲已经完成。中日源增量折行、韩及西文延后
折行、动态名字缓存和跨提示连续正文等仍见F-05。旧档中已被旧程序裁掉的
文字不能恢复，不从已读标记或脚本后文补造历史。

## 实现与预算

通过现有SDK公开`HistoryPolicy.maxDisplayEntries`及标准`state.collect`
执行；剧情候选用实包a96c1fdc425f编译；最终运行接入9d74a79d211c，来源fda86d3。
未复制引擎、执行TJS或
增加剧情解释器。转换器的默认正文检查点、第一次调查整合中的旧64条夹限
同步修正；候选转换器仅允许64/128→512及已知1条菜单清空，其他值显式拒绝。

最初试验1024条时，英语样本通过，但法语实际长读触发
`INPUT_SIZE: JSON tree exceeds the supported bound`。该候选未提升默认。
最终收紧到512，并同时检查字符、节点、深度和模块闭包；没有放宽SDK现有
400万JSON字符、10万节点、64层深度及64模块的边界。原始失败日志保留在
`artifacts/history-retention/fr-it-verify.log`，最终证据按发行身份重新登记。

512条候选首次浏览器验收中，中文累计资料遇到热根4M限制：SDK重复保存
head及live activation中的完整Snapshot。本地默认包未提升。SDK W1-26以
布局v5精确head引用去重，旧布局原子升级、所有权/回执保留，限额不变；
480单元/check、13存储浏览器、隔离实包通过后才接入重跑。之前的失败在
`browser-before-v5.log/json`保留。百万字符PortableBackup限制并未解决。

八语候选由当前默认包克隆，只共享SHA命名的不可变文件；修改后的代码重新
按SHA命名。公开编译器验证全部ProgramModule及组合。提升检查逐指令确认
唯一剧情差异为回收上限，函数ABI、顺序、调用、正文/注释、变量、资源保持；
展示数据仅增加一个旧清单兼容来源，保留旧SHA文件，不覆盖旧槽。

## 验收

- 13项针对性测试：实际标准Core连续确认至超限、淘汰及冷恢复、只读权限、
  明确菜单清空、未知回收值拒绝，以及既有历史分组/提示/分片回归。
- 八语16个普通/通关旧点迁移、冷恢复和继续。八语普通态及中英实际累计通关态
  共10个长读样本达到512条后继续淘汰；其余六语通关态仅复用先前夹具的范围，
  运行8步并冷恢复，不冒充完整累计通关。与原64条版本逐步比较全部非绑定
  叙事状态、完整进度及保留历史后缀；仅发行/模块/UI/extras来源绑定按目标核对。
- 中英法第六门、第八门、终章共9个正文长读样本，各保留至少512条正文并
  冷恢复、继续。其中第八门完整遍历，英法各15405步、中文15596步；冷恢复
  从该路径最后一个合法采样切点继续，不冒充结尾切点。中英六/九门使用真实
  累计七结局进度，法语使用已有章节菜单解锁夹具；第八门为明确的解锁夹具，
  中英清空的是新建测试profile的read，不改原资料。测试只走声明SDK场景入口
  与驱动选择路径，不重新认证全部路线和结局。
- 中英普通/通关4项浏览器验证512条可查看、顶部/尾部可滚动、图文保存及
  刷新冷读完整保留；另1项英语旧发行槽迁移，确认不增加已丢失的记录，且
  IndexedDB原槽字节与修订号不变。每项登记目标发行与SDK实包SHA。

九个正文样本峰值为895057个Snapshot JSON字符、59282节点、11模块；
八语旧点长读样本峰值1077291字符、52976节点、5模块。Core检查全部投影，
报告的峰值另在周期切点采样，并非对所有瞬间峰值的精确记录。

编译及9个正文预算基线保留实际a96来源标签，不改写成新SDK证据；新版SDK
逐一解码/重新编码八语清单、展示及所有代码模块，逐SHA字节一致，随后重跑
八语16点和中英浏览器。存储修复未改变Core或剧情Snapshot ABI。

原始切点、测量和浏览器截图/trace仅在
`artifacts/history-retention/`。Core检查全部投影，报告另在周期切点采样。
媒体由headless驱动模拟完成；浏览器使用真实本地资源。未认证公网慢网、
真机、所有路线的最坏情况或原作逐像素行缓冲。本轮未部署。

## 实际命令

```sh
pnpm exec tsx tooling/compile-history-retention.ts --clone
# 初次1024试验的 all 在确认法语预算失败后终止；最终512重新编译：
pnpm exec tsx tooling/compile-history-retention.ts fr
pnpm exec tsx tooling/compile-history-retention.ts en,it,jp,ko,pt-br,ru,zh
pnpm exec tsx --test tests/reading-history-policy.test.ts tests/history-content.test.ts tests/history-parts.test.ts tests/history-speaker-hints.test.ts
pnpm check
```

```sh
# 新实包接入后的实际命令：
pnpm sdk:update
pnpm exec tsx tooling/verify-history-retention-wire.ts
pnpm exec tsx tooling/verify-history-retention.ts en,zh
pnpm exec tsx tooling/verify-history-retention.ts fr,it,jp,ko,pt-br,ru
# 正文预算基线的实际分批运行（a96）：
pnpm exec tsx tooling/verify-history-retention-routes.ts en
pnpm exec tsx tooling/verify-history-retention-routes.ts fr
pnpm exec tsx tooling/verify-history-retention-routes.ts en door8
pnpm exec tsx tooling/verify-history-retention-routes.ts fr door8
pnpm exec tsx tooling/verify-history-retention-routes.ts zh
pnpm exec playwright test --config playwright.history-retention.config.ts
pnpm exec tsx tooling/promote-history-retention.ts
pnpm build
pnpm exec tsx artifacts/history-retention/default-smoke.ts
```

提升前校验八语父清单/展示、完整逐指令差异、模块ABI/资源、数据/运行包来源、
16旧点、9正文样本和5浏览器身份；全部通过才替换本地默认入口，旧SHA对象保留。
源码及短报告正常追加提交；生成物、存档和日志不入Git。未推送或部署。

最终本地提升完成，`pnpm build`通过；3478个PB压缩前2188729356字节、
压缩后209358230字节。默认4184预览重新启动并冒烟通过，新发行
`historyretain-zh-18ca637567236aa14b8b`、512显示、rollback=false，
无pageerror。截图仅本地保留，不代表原作逐像素认证。

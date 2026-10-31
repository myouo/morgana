# 八语第四门收尾与线上发布

2026-10-31至2026-11-01，用户明确授权恢复资源上传并推进线上部署。

## 内容与隔离

- 三种坏结局执行后以明确Program边界返回原标题。前端只在已激活、未暂停的
  主线会话结束时调用SDK start；不在候选激活中途抢占，不修改Core PC。
- 八语第四门章节回放按原位缩略图接入。关闭回放后主线帧与profile不变。
  其余七语原脚本补齐memory1/2，中文旧脚本缺这两行；中文版仅在临时回放
  采用该修正，使回放可完成。新周目的记忆条件不改变。
- 旧活动探索菜单按原manifest验证后重绑定新的UI来源签名，字段、代次、舞台
  与控制栈保留。旧结局边界只按保存的正文/历史来源辨认，不能确认则拒绝。
- SDK ADR0094增加显式inheritExtrasCompatibility，继续保留已验证的旧鉴赏
  目录链；默认生产输出不变。SDK源7ed254a87e5e8b7df0b602cedb412cf7bfb03019，
  实包SHA f0ac40cae565491700095dc9a1e08084a4d3ff95a7872916346d2bd0751790dd。

## 资源

按相同SHA及扩展名共享完全相同的字节，不再重复发布跨语言路径。
旧闭包3218路径/974451216字节，新闭包2046唯一对象/458535980字节；包含
一至四门全部八语与兼容字体，并非一个玩家或一个章节的下载量。没有新增
电影、残像、心跳或菜单状态组合帧。增量上传1162对象，其余已有SHA对象复用；
既有对象不删。生成的测试PortableBackup不进入前端发布目录。

本地Vite production build与protobuf Brotli副本一并发布；媒体只进私有R2。
为旧Web槽保留的历史代码/清单仍在静态目录，不能作为当前剧情下载量统计。
Worker、前端目录及认证维持preview/regression隔离，节流和故障仅在测试浏览器。

## 本地验收

- `pnpm exec tsx tooling/prepare-release.ts all`：八语标准程序及发布元数据。
- `pnpm exec tsx tooling/verify-release.ts <locale>`：八语32条分支，三坏结局至
  返标题边界、正线至scenario5入口、回放双记忆三选项及旧活动菜单保持通过。
- `pnpm exec playwright test --config playwright.release.config.ts --grep 'zh '`：2项；
  `FATA_RELEASE_RUN=local-other ... --workers 2 --grep-invert 'zh '`：15项，含旧槽真实迁移；
  坏结局返标题、八语回放隔离、图文保存/冷刷新及64MiB估算驻留均通过。
- `FATA_RELEASE_RUN=local-fault ... release.spec.ts --grep 'corrupt code'`：1项，坏代码
  不接纳，重新加载恢复标题。
- `pnpm check`、`pnpm test:edge`：类型/94025条源控制及真实workerd协议检查通过。
- SDK `pnpm check`、82文件/430单元、`pnpm test:consumer`严格独立包通过。

## 发布操作

`tooling/stage-release.ts`仅整理真实闭包；本地构建为dist.next，
`tooling/prepare-edge.ts regression dist.next`与preview目录分开。
`tooling/upload-r2.py --bulk --oauth`只上传当前闭包，原名必须等于文件SHA。
`wrangler deploy --dry-run`通过后先部署regression，再执行线上回归与HTTPS摘要
校验，最后切换preview。回归站已发布版本8f0981fd-ce69-48cb-ba70-5ef6ed5a81ac；线上6类功能场景均通过（英文冷音乐等待从默认5秒改为资源就绪等待后单独复验）：
八语入口、英文/中文返标题与回放隔离、英文/中文菜单冷恢复；另含损坏代码重试。
中文150ms/750000B/s慢网只在测试CDP模拟。初轮5项通过，英文回放等待断言
超时1项，调整等待后该项复验通过，不将初轮失败写成全量一次通过。
全量HTTPS已校验2046对象/458535980字节、鉴权/HEAD/Range/条件请求及暖缓存通过。

认证资料、原KS/TJS、素材、字体、tarball、存档、构建、截图与原始日志均ignore。
仍止于第五门入口；通关后变体、原生tft、动画glyph与原作逐像素/真机长期认证
另验。没有执行原脚本或增加第二套解释器。

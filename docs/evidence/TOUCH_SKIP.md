# 触屏快进与未读文本选项

2026-11-08，按用户要求添加触屏快进与config选项，电脑继续按住Ctrl。

- 无悬停、主指针为coarse的设备显示右上角快进按钮，至少44 CSS px点击高度；
  点按锁定/取消SDK快进模式，激活态可见。原底栏重复的skip按钮在触屏隐藏，
  鼠标设备保留既有原底栏与Ctrl行为。
- config使用原复选框图加入“快进未读文本”，八语PO均维护。默认false，
  写SDK现有playback.skipUnread偏好，刷新保留，原Default按钮恢复false。
- 两种输入均调用公开Player.setFast；原已读判断、选择停止、强制等待、菜单/
  暂停取消仍由正式SDK负责，没有应用层逐帧推进或另一套解释器。
- 原作qmenu允许的正文阶段显示按钮；快进跨过演出/资源等待时保留停止入口。
  点击不冒泡为正文推进，桌面不出现新增触屏按钮。

系统文字独立重编为八份UI PB及Brotli副本，dev/build预先刷新当前UI。
正式准备只允许这16个固定路径采用当前PO输出，7168个其他PB与原正式版/
已验证父版逐SHA相同；SDK仍d222adf212da（bd2cab2），Program/release、
模块/正文/旧档身份及R2素材都不改。原强制取消Skip等复刻差异仍在清单中，
本批不宣称关闭它们。

本地验证：

1. pnpm check、59项无游戏资料单元通过。
2. 专项13场景通过：八语选项默认/勾选/刷新/恢复默认，中英横竖屏触控
   的未读保护/推进/再次点击停止，以及桌面左右Ctrl/松开停止。
3. 初版选项靠近原Default命中区；移到上方空白区后，八语再验不重叠、
   文字不溢出及持久化/恢复默认，8通过。
4. 两项中英真实触屏UI冒烟通过，全程无测试导入钩子。最初脚本使用旧DOM
   类名而阻塞；改用现行story-text标记后通过，产品逻辑没有为测试放宽。
5. 当前正式候选7195文件，与旧正式版逐文件比较：7173文件完全相同，
   22个新增/修改文件仅为前端及系统UI；旧5个前端hash入口被新构建替换。
   变更解码字节4279390，0剧情或兼容数据差异。

实际命令：

```sh
pnpm check
pnpm test
pnpm exec playwright test --config tests/config/touch-skip.config.ts
pnpm exec playwright test --config tests/config/touch-skip.config.ts --project=desktop --grep @settings --reporter=line --output artifacts/touch-skip-2026-11-08/layout
pnpm exec playwright test --config tests/config/local.config.ts touch.spec.ts --reporter=line --output artifacts/touch-skip-2026-11-08/ui-only
FATA_PRODUCTION_RUN=2026-11-08 pnpm build:production
```

原始日志、截图、差异摘要和测试产物位于ignored
artifacts/touch-skip-2026-11-08，正式准备收据位于artifacts/production-2026-11-08。
浏览器测试为Chromium的触屏模拟，未冒充真实iOS/Android设备认证。

## 正式上线

源提交a12c96d已正常推送main，正式Worker版本
6d5250de-4307-4ffc-bb3d-5218fa142067已承接100%流量。
fata.morgana.love匿名可用；Wrangler上传22个文件、复用7173个既有文件。

- 正式站12项真实UI验收通过，0失败/跳过/flaky，约5.2分钟：八语标题与测试
  钩子关闭、中英原菜单图文存刷读、中英触屏实际勾选和点按快进/停止。
- 22个变更文件及八语清单/标题共38项远端摘要与候选相同；中文UI实际Brotli
  返回解码匹配，音频Range携带正确If-Match并返回匹配字节，testsdk匿名仍401。
  首次鉴权探针使用默认urllib UA得到403；沿用既有验收UA重试返回401并确认
  regression响应头，没有修改Worker、WAF或放宽鉴权断言。
- 只读部署列表确认preview仍7b65d519-05bf-4d8e-b620-d48c5791c568，
  regression仍6b39ba1b-5aff-4627-80f0-b5367e68caa7，Requiem仍
  4e89a3e2-beae-4e61-88f8-065958cfed60；SDK与R2资产不变。

```sh
pnpm exec wrangler deploy --env production --dry-run
pnpm exec wrangler deploy --env production
FATA_PRODUCTION_ORIGIN=https://fata.morgana.love pnpm test:browser:production
```

发布与只读部署列表使用现有OAuth，移除本机API Token/HTTP代理变量；网站核验
使用正常网络。实际发布、差异/协议核验和生产浏览器日志均在本批ignored目录。
本次为有界增量验收，未把7173个本地未变文件冒称本轮逐个重新远端下载，
其完整远端字节闭包沿用首版正式发布证据；R2本轮为实际加载与Range验证。

# G1-04：滚轮、历史与存档事实

2026-10-28。当前实例消费SDK实际tarball 73bb065ba1a4ac3ecabfcd64e586095ec6f107befbd5aa931a8fb7a5ee535e39，仅公共exports。SDK实现/CI修正c1960da的run40650077493六任务全绿、174浏览器覆盖；wheel偏好为Schema派生布尔、protobuf可选字段7、旧v2默认开启，不改变剧情Snapshot。

- SDK check、271单元、原8项偏好/按键/字符等待、新增真实双Player滚轮、3项舞台复验、真实打包consumer（播放/存读档/备份）通过。原stage轮询失败沿用主线3dfd713修复，保持原5秒门槛；不是删测试或放大超时。
- 独立check、3 Python+32 TS、八语GNU UI PO检查、本地7项浏览器通过。按源HistoryLayer/ExtendedHistoryLayer配置保留各语margin/font/lineHeight和原massageback/reclose；中文实际截图已查看，未做原生逐像素认证。
- 下滚显完，下一独立手势推进；上滚打开历史。pixel/line/page统一，220ms内同串只一次；菜单/表单/原生滚动/缩放不推进。设置可关闭并跨刷新保留。历史只订阅真实backlog，不构造剧情或改PC。
- 测试直接打开IndexedDB `galbox-sdk`/`namespaces`，验证`quick`槽位真实快照、PNG缩略图和wheel偏好；刷新后使用原读取菜单确认恢复原textId。F5/F9与手动保存沿原正式Player API。
- menus:refresh只更新UI元数据；八语16个Program/Release文件SHA逐一与前轮相同。UI更新未改变已有存档身份。当前剧情仍32页；原版存档互通和整章回放未接通，见CAPABILITIES/CHAPTERS。

线上preview=92313587-fa73-488b-8845-6d84612cbe9e，regression=18f711c5-dc55-41db-9524-19592846d098。初轮移动3+滚轮历史1通过；存档用例先遇标题准备超时，再遇异步读档媒体Range等待。按相同15秒准备门槛等待实际激活（保留后续5秒UI断言），最终wheel-history-diagnostic复验通过，25.3秒完成。网络截断/时延失败全部保留，不能声称稳定性问题全解决。

预览52文件4057549解码字节与本地build匿名相同，媒体Range/回归401保持。新增9个资源6292289字节全部上传/HTTPS摘要通过，305个不可变资源与已全量验证的前版逐字节相同。当前总314对象71059996字节；本轮首次全量probe因IncompleteRead失败，随后只做有明确前版依据的增量验证，未伪称新全量成功。

原始证据在ignored artifacts/wheel、artifacts/remote；图片/素材/KS/TJS/日志/包不入Git。后续优先F-01E完整章节角色宏/演出/原章节解锁与隔离回放；加载超时反馈/网络恢复仍需进一步完善。

最终工具复验：增量probe在305未变身份比较基础上再次取回9新资源全部SHA相符、cache HIT；匿名52文件再次与本地build一致。check-preview仅为URLError/传输中断做有界重试，不对HTTP语义/摘要失败伪报通过；probe的--changed-from明确报告复用范围，默认仍全量。

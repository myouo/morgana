# 第五门主线与回放整合（2026-11-03）

## 实现与源依据

第五门八语全文已转换为正式 SDK ProgramModule/protobuf，并接入第四门正确
路线之后。已发布旧终点 `release:scenario5-entry` 经显式1ms续接等待进入第五门；
原槽位、帧、文字和已读进度保留。坏结局仍按原路线返回标题。第五门终点是
`scenario6.ks:*start`，目前不代表第六门正文或整作完成。

原章节书新增第四页，仅显示当前已实现的第五门，按原作 scenario5 进度门槛
进入。回放仍由同一 SDK 章节体执行，在临时会话中运行，关闭后主线状态不变。
新增源码书签及联合字体覆盖；暂停 BGM 的源引用与写入位置在片段重定位时
一并重定位，存档后可恢复。图片/字体/媒体仍走原资源闭包与私有SHA对象。

法语在同一剧情UUID处将音轨名写成 `Foule et rivière`，包内只有共享的
`Crowd and river`。没有替换音轨：静态核验原BGM.tjs的Wave路径、play停止
两个缓冲再调用playBuffer、缺失文件报告后返回，按该行为保留静音。此特例
锁定语言/章节/资源名/唯一UUID/系统脚本SHA；其他未知缺失仍拒绝，编译报告
明确记录 `SOURCE_BGM_ABSENT`。后续实际先fadeout再play另一首，未引入一个
不存在的播放任务。SE继续使用原有独立缓冲语义。

整合输入固定为 `generated/interfaces-shared`；接入前八语module/title字节
与已发布第四门完全相同，避免提升后把第五门输出再次当作第四门输入。旧代码
URI和资源保留。供体默认的五个基础声明标记遵循宿主原有
`foundationMarkers:false` 策略，全部实际扩展能力仍由SDK链接验证；没有提高
32项能力、256函数、图层/任务或资源预算。中文整合为221函数/42模块/1166资产。

## 验证及版本指纹

- `pnpm door5:build all`、`pnpm door5:verify all`：八语完整第五门及5个切点
  通过。中文4175段/4190片段，其他语言4191–4203片段；仍是原稿对应的段落
  差异，不按行号强行合并。
- `pnpm door5:connect all`、`pnpm door5:verify:main all`：从真实第四门正确
  路线的旧版终点继续，逐段核对第五门文本并检查回放。整合最大44对象/47任务。
  媒体回执来自显式虚拟Host，不据此宣称每轨已在物理设备完整播放。
- 收尾把资产目录纳入发布版本指纹，并使用原第五门标题。冻结八语全文遍历
  版本后，逐模块SHA/长度及函数顺序证明代码未变，核对全局/UI/布局/样式/
  缓冲和资产内容身份，再在最终版本冷恢复40切点。原完整遍历release与最终
  release分别保留在ignored记录，未把元数据修订冒充全新全文遍历。
- `FATA_SCOPED_ROOT=generated/fifth-connected pnpm exec tsx tooling/verify-scoped-save-cuts.ts all`：
  135个真实历史切点通过，每个至多6模块；保留原槽位DTO、帧、文本和任务时钟。
- 项目 `pnpm check`、`pnpm test`：119 Node与7 Python通过。针对性8项测试
  验证原生缺失BGM停止双缓冲、SE不受影响、普通缺失仍拒绝、暂停源重定位及
  旧终点仅续接一次。新增浏览器脚本另作严格类型检查。
- 最终 `PLAYWRIGHT_BLOB_OUTPUT_DIR=artifacts/fifth-connected/local-blob pnpm test:door5 --fully-parallel --workers=2 --add-reporter=blob`：
  13项真实浏览器通过（11.3分钟），无跳过/意外/不稳定项。覆盖英中旧终点
  续接、原菜单图文保存、刷新读回，中法暂停源保存恢复，以及八语第四页章节
  菜单/进入第五门/关闭临时回放后主线不变。截图人工检查了开场和新增章节页。
  较早串行任务被SIGTERM终止，不能当作完整套件通过；最终报告来自完整重跑。
  英语初版对照曾采到自动消字的临时切点，现先完成菜单暂停队列再取对照，
  保存/读回仍严格比较帧和文本，没有删必要断言或延长产品时限。

完整进度40图文槽及上一修订的刷新读回通过；串行已完成专项保存347–507ms，
完整双worker套件样本370–807ms。两者均保留13298条已读，未删历史来凑容量；
并行样本不作为独立延迟基准或P95。正式提升本地目录新增429文件、保留3261，
旧文件删除0；发布目录仅含 assets/compat/programs/text，测试切点包含0。

最终正式目录的 `FATA_LOAD_RUN=fifth-final pnpm exec playwright test --config playwright.performance.config.ts load-profile.spec.ts -g auto`
通过。独立无CPU采样样本：当前档冷1592ms、同页467–472ms；旧调查档迁移
冷2697ms、同页601–609ms。实际完成Core/画面/媒体接管与持久确认，停在
`search-places:wait`。这次没有并行构建或上传；与上轮相近，不宣称硬件负载
严格相等或所有公网请求都低于1秒。SDK实包在最终来源重建为同一888a7f175e3a。

## 存储与已知限制

SDK来源 `2c588b31fd25fd7a5c9c3df7cf42168fa6eccc68`，真实tarball SHA256
`888a7f175e3ad3fbf849fa0016807d975a7842f49efa9758fbbc6d65cd27f341`。
W1-11仅公开原生产IndexedDB适配器，调用方持有连接，Player借用时不关闭。
SDK check/449单元、5真实存储浏览器及独立安装包验收通过；实例没有私有入口
或另一套存储/剧情引擎。

完整进度已有13298条已读。部分第五门中后段超过原有便携备份100万JSON字符
上限，仍显式拒绝导出；未截断已读、历史或增加备份预算。浏览器验收使用完整
Snapshot/Profile protobuf，经公开ModuleProgram/Core验证，再通过正式Store
独立导入测试分支，保留所有进度。`__test`入口不出现在正常游戏界面。
正常游戏图文存档仍使用既有原子持久化流程；便携备份与普通存档分开验收。

源原生确认glyph在部分西文语言中的动画仍未认证；原作逐像素、全通重开变体、
原生存档codec、音轨seek精度和第六门正文未扩大认证。原包/KS/TJS/素材/
存档/日志/trace保持ignore，测试切点不会进入正式前端或R2媒体闭包。

## 发布接续

实例实现提交6f2f529；SDK main已正常快进到2c588b3。正式 `pnpm build`
通过，前端/程序/文本目录2188文件，R2闭包2569对象/578427880字节。
新增上传308个SHA对象/103957591字节。批量音频两次fetch失败，改为逐对象
续传后一个API 524再试成功；已完成标记保留，不重传已成功图片，不改站点限速。
`pnpm r2:verify`仅核对当前发布闭包（排除磁盘孤儿），结果789个既有不可变复用、
其余1780对象中1546本次抓取/234续验，失败0。只对传输/429/5xx重试，摘要或
状态/权限错误不会作为成功吞掉。所有回归固定在testsdk，R2仍为专用私有桶。

回归部署14ddeef6-fa98-4802-99b4-64c6b4ba61a6；通过公网验收后，同一构建
部署到预览fdd10623-99cb-463f-885c-09b8fb2bc6d2。两个前端目录/Worker继续分开。

同构建新增13项公网验收全部通过（13.2分钟，无跳过/意外/不稳定项）：
`FATA_FIFTH_ORIGIN=https://testsdk.morgana.love FATA_FIFTH_RUN=remote-final PLAYWRIGHT_BLOB_OUTPUT_DIR=artifacts/fifth-connected/remote-blob pnpm test:door5 --fully-parallel --workers=2 --add-reporter=blob`。
包括完整进度40槽/上一修订/刷新读回（13298已读，360–868ms并行样本）、
英中旧终点续接、中法暂停源恢复、八语章节页进入第五门及关闭回放后主线不变。
本轮没有在预览或Worker/R2加入限速/故障；实际设备整章逐轨及原生像素比较
仍与这些切点验收分开。

原有线上兼容用例4项已通过（4.7分钟）：刷新后确认读档、存档分页保护/
取消删除/删除，以及英中章节、结局列表和隔离探索回放。旧测试最初在标题
禁存状态调用capture来辨认release，按原SAVE_POLICY被拒绝；已改用只读
getSnapshot检测版本，没有放宽标题存档策略。坏结局fixture先经公开Core校验
迁到最终release，放在ignored artifacts中，不进入站点。
该轮公网两次连续读取1269/1205ms，仍存在网络/并行负载波动，不当作本机
独立467–609ms样本的等价延迟承诺。

最终 `pnpm preview:check` 通过：2188文件、858652683解码字节与本地dist逐
文件相同；匿名访问、媒体Range和回归鉴权隔离通过，无流量整形。两个仓库
均只正常追加并快进推送明确main，不强推/推旧分支或tag。实例可达历史路径
检查无原包、KS/TJS、提取素材、生成载荷、存档、tarball或日志；本轮SDK变更
只有通用入口、合成测试与短文档，原有原创fixture与真实作品数据分别核对。

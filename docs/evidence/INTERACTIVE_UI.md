# 过场交互与原存档、回放界面（2026-11-01）

本轮范围仍为已接通的序章、一至四门、调查与三种坏结局，不增加后续正文。
转换器仅解析 KS/TJS 数据，输出标准 Program；菜单演出、条件、按钮与等待由
正式 SDK 执行。实例只消费 tarball 与公开 exports，安装目录只读，载荷全部 ignore。

## 可观察变化

- OP、标题离场及序章演出保留逐段点击/Enter 跳过。只结束当前允许跳过的等待，
  不把时长补给音乐或下一段正文。Ctrl 快进同样只处理显式可跳过的视觉等待，
  每 tick 一次，强制等待和媒体结束仍是屏障，既有未读策略不变。
- OP 原本禁止保存，继续保持；旧档恢复在真实可保存的序章动画切点验证，
  保留任务、画面、逻辑时间与137ms进度，再分配新的输入身份。
- 存档页使用原背景、空槽图、400×100卡片、118×89缩略图、四态分页/锁/删除图、
  日期及最新标记。40个手动槽保持固定位置，空槽不折叠；其他版本有4个自动槽页。
  日文只有10个手动分页；中日分页起点250，其余235。法/意锁按钮位置独立。
  中日槽号与原作最新提示坐标保留。原代码已停用的确认开关不添加到画面。
- 存档页名来自 KAG 非空书签标签，以实际页身份生成有摘要的显示目录；不拿
  窗口标题代替。原来为空的页名仍显示原作 No Data，旧 Web 槽的既有标签保留。
- 删除先确认，锁定阻止覆盖和删除，刷新保留；PageUp/PageDown与滚轮按实际
  分页循环。日文不进入其源插件中不存在的第11个按钮，避免复刻越界错误。
- 特典、章节与结局列表由标准 SDK 场景绘制，保留原图、消息层边距、进出场
  时序、三态与悬停声音。原始 KAG 三态顺序在资源/游戏皮肤中明确适配；右缘
  按钮逐帧裁切，未拉伸命中区。调查回放入口已接入，回放保持主进度隔离。
- 回放历史继承正式配置，修复原先只留一页的问题；退出通过游戏菜单确认返标题，
  移除额外的回放浮动关闭按钮。会话切换不再让新界面引用已销毁的旧 Player。

## SDK 与资源边界

SDK任务 G4-03（ADR0095）和G1-06（ADR0096）。最终源码
`d0a00413fac5f79ccfad29f66c456148eef0a8fb`；实包SHA256
`29120fb290e44525e6c39e5df12dd18cd49f9aca71badf3b1272b2944554e047`。
最后一次提交仅同步包内README，279个dist文件与独立消费已验收包逐字节一致。

`protectSave(slot, revision, boolean)`采用存储事务/CAS，旧记录默认不锁定；两条
保存入口与删除均不能绕过保护。加载和备份仍可用，当前/上一快照与profile/head
不被锁操作替换。SDK手动策略允许1–64槽，实例选40；仍受既定存储容量限制，
这不保证任意40份最大体积历史/截图都能同时容纳。自动槽只能显式选择当前
profile的配置内位置，不得借此覆盖其他分支。

当前发布闭包2261对象、474470289字节；只跨全部八语言相同的字节共享，其余
按语言隔离，文件名为完整SHA。保留已登记旧清单/代码/字体、旧槽与全部旧对象。
本轮增量上传176张PNG；不上传日志、存档、KS/TJS、解包树或tarball到GitHub。

## 实际验收

- SDK：`pnpm check`、`pnpm test`（432单元）、`pnpm test:consumer`通过；
  图文存档与鉴赏17个真实浏览器场景、额外历史容量专项通过。新调度测试先在
  旧构建上得到失败，再重建得到通过，覆盖预算1/8/100、单tick单输入、Auto、
  强制等待、未读与不推进其他音频包络。
- 实例既有 `pnpm test`：115个Node与3个Python通过；新增等待权限负例后，
  `pnpm exec tsx --test tests/presentation.test.ts`三项通过，合计116个唯一Node。
  `pnpm check`通过类型、94025条源文本/控制关系与载荷/独立依赖边界。
- 构建：`compile-interactions.ts`八语、`refresh-interface-menus.ts`、
  `share-interface-assets.ts`，再以共享候选运行
  `FATA_INTERACTION_OUTPUT=generated/interfaces-shared pnpm exec tsx tooling/verify-interactions.ts all`：
  八语OP输入、旧动画切点、菜单来回、调查回放和结局列表通过。
- `FATA_INTERFACE_ROOT=generated/interfaces-shared FATA_INTERFACE_RUN=shared-final pnpm exec playwright test --config playwright.interactions.config.ts`：
  13项一次通过，含物理点击/Enter/Ctrl、锁定与刷新、确认删除、真实旧槽创建/迁移、
  英中回放隔离及八语画幅/分页。另1项损坏代码/干净重试通过。
- `native-states.spec.ts`真实调查菜单悬停/按下专项通过；初轮仅零位置CSS单位
  断言不符（0px与0%），改成实际计算值复验，未改变断言所要求的图帧顺序。
- `promote-interfaces.ts`先核验上述结果，再追加不可变文件并最后切清单，
  删除旧文件数为0。`vite build --outDir dist.next`和两套edge目录独立准备。
- `FATA_PUBLICATION_ROOT=generated/integrated python3 tooling/probe-r2.py`：
  2261对象全部经鉴权HTTPS读取并逐字节验SHA；Range/后缀/条件请求/暖缓存通过。

原始日志、截图、trace和校验明细在ignored `artifacts/interactions/`及相关日志。
没有把源素材合成图或浏览器截图冒充原作运行参照。

## 限制与剩余验收

**尚不能认证“百分百原作还原”。** 本轮用私有副本启动官方exe，仅取得黑帧，
未获得可用原作运行对照。原生字体/OS确认框、逐帧时序、原生tft、真实移动设备
仍未认证。当前可达回放与结局列表通过，不等于第五门以后、全通变体、全结局
奖励层与隐藏序章已完成；编译器显式记录这些未支持范围。主线仍止于第五门入口。

UI保持原素材与剧情内容；开发说明只在文档。网络节流只在testsdk浏览器CDP，
不写入预览、Worker或R2。线上版本与回归结果在发布完成后追加于下节。

## 发布记录

回归版本 `ad458dd4-a06a-49e9-a05c-1bb91358747d` 已部署至testsdk。
预览版本 `d32b687e-9d91-4ba7-888b-4c64ce70eca6` 已切换至100%流量，地址
https://test.morgana.love 。
`node --use-env-proxy --import tsx tooling/verify-preview-build.ts`通过：324份当前
前端/八语清单、代码、UI与标题/历史/章节/书签片段，185311996个解码字节与
`dist.next`逐字节一致；testsdk匿名请求仍为401。历史兼容代码另由承诺与迁移验收覆盖。
远程15项首轮14项通过；唯一OP检查在资源未就绪时连续发送输入。改为等待SDK
就绪后，OP点击/Enter与Ctrl两项保留相同行为断言重跑通过（2项）。没有把首轮
写成全量一次通过。中文150ms/750000B/s慢网仅在testsdk浏览器CDP中单独验证，1项通过。
调查按钮的原生悬停/按下帧远端专项也通过；Worker/R2/预览未加限速。
SDK已仅快进推送 main 至 `d0a00413`；未推其他引用或tag。

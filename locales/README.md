# 翻译贡献入口

直接修改对应语言的`story.po`（22页序言）、`prologue.po`（其后完整新周目序章）、`choices.po`（问候选项）、`chapters/door1/*.po`（完整第一门）或`ui.po`（系统界面）。例如中文是`zh-Hans/story.po`，日文是`ja/story.po`。可用Poedit、支持gettext的编辑器或普通文本编辑器。

每条记录的`msgctxt`是稳定文本ID，`msgid`通常是英文原文（各语言独有段落以该语言原文为准），`msgstr`是该语言实际显示的文字。贡献者修改`msgstr`，保留`msgctxt`和`msgid`。英文纠错也修改英文文件的`msgstr`。不按文件行号匹配译本。

```po
msgctxt "page:stable-page-id"
msgid "An original sentence."
msgstr "修正后的译文。"
```

`{{gb:break:0}}`表示原作显式换行，`{{gb:confirm:1}}`表示点击等待。`pause`/`speed`保留来源的毫秒停顿和文字速度；`style`/`endstyle`包住有样式的文字；`ruby`/`reading`/`endruby`分别包住注音正文与读音。样式和时长来自已校验源，PO只修改可见文字/注音，不能自行写入CSS或改变时长。编号、种类、数量及顺序须保留。意大利语原段落拆分与法国accent样式均独立保留；这些标记经过严格转换，不执行任意KAG/TJS或JavaScript。`controls.toml`记录从原作确认的控制关系，属于移植契约，翻译修正不要修改它。

`locales.toml`声明默认语言、名称、别名与显式回退。当前转换器支持原作的八种语言；增加新的语言还需要对应的资源/字体适配，不能只加一个配置项。

验证与预览：

```sh
# 不需要游戏素材；需要项目开发依赖及已安装的SDK包。
pnpm locales:check
# 可选：GNU gettext语法检查，不需要Node或SDK。
msgfmt --check locales/zh-Hans/story.po -o /dev/null

# 维护者拥有本地游戏资料时：
pnpm convert
pnpm test
pnpm build
pnpm dev
```

检查拒绝重复/缺失/额外ID、原文不匹配、空译文、fuzzy、非法UTF-8、错误语言、未知或被删除/重排的控制标记。当前只支持单数消息；复数消息显式拒绝，不假称完整gettext功能。

转换器读取PO后才生成字体子集，缺字检查仍执行。改动剧情文字会自动改变对应页的Revision和发布身份，避免沿用错误已读单位；没有隐式旧存档迁移。未修改的页面保留原Revision。`pnpm convert`不会覆写PO；`locales:seed`只初始化不存在的文件，已有翻译保持。

`.pb`仅是Schema校验后的发布产物，位于ignored `generated/site/text/`，不要手工修改。缺少最新转换时发布器拒绝旧Program与新PO混用。`private/`中的原KS/TJS、解包数据和二进制资产都不提交；这里仅包含用户授权纳入Git的整理后翻译文本及控制元数据。文本内容仍属于原作品，仓库未将其声明为新的开源授权。

旧`awakening.po`仅保留历史来源；首次初始化`prologue.po`时已继承其修订。当前发布读取story/prologue/choices/ui及chapters/door1五类PO。候选页总数95，意大利语96；两个实际选择路径各93页。`{{gb:pauseunits:N}}`保留按当前文字速度采样的字符单位等待；单位数来自源宏，中日韩为8、欧美为12。源时序参数不写在译文里，不能通过修改PO把它变成固定毫秒。

`chapters/door1/`已经是完整第一门的正式发布来源，保留⟪k:N⟫控制标记。`chapters/prologue/`仍是包含通关分支的研究目录，当前新周目序章采用前述story/prologue.po。`pnpm chapters:convert door1`按稳定标签批量合并并保护人工修订；`pnpm chapters:check`校验来源身份、控制标记与复核状态。未知动态内容和待对齐标签均记录，未通过整章运行验收不能当已可玩。详细规则与各章剩余工作见[CHAPTERS](../docs/CHAPTERS.md)。

历史查看与滚轮设置使用 `ui:history`、`ui:historyEmpty`、`ui:wheel`，八语同步维护；界面翻译不写回正文Program。原历史背景与布局从作品各语言资源/配置读取。

`prologue-sources.toml`锁定各语言原文身份，控制标记仍由`controls.toml`约束。维护者首次从实际源初始化完整序章可运行`TMPDIR=/dev/shm pnpm exec tsx tooling/seed-prologue.ts`；已有文件不覆盖。日文源的问候处没有autosave，其余七语有，差异不通过PO抹平。

浏览器从Worker静态资源的`/text/<language>.story.pb`加载正文，R2只放图片、音频、字体。Brotli只压缩HTTP传输，解压后的PB与本地构建逐字节一致，不改变翻译源或存档身份。

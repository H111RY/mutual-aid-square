# 个人中心 Web 端开发文档

## 文档信息
- **模块名称**：个人中心（个性化管理与适老化服务平台）
- **版本**：v1.0
- **身份**：社区技术人员 / 网站开发者
- **最后更新**：2026-06-02

---

## 一、功能概述

个人中心是社区互助平台的个人操作管理核心，整合**内容管理、消息设置、楼栋切换、适老化配置、意见反馈**五大功能模块。操作流程简洁直观、入口明显、层级浅显，重点提升老年人使用体验，让老年人实现自主操作、便捷管理，减少对家人的依赖。

### 核心目标
- 提供个人发布内容的统一管理入口，状态清晰、操作便捷
- 精细化消息通知控制，降低信息干扰，重点提醒不遗漏
- 支持跨楼栋需求对接，满足多场景灵活切换
- 一键适老化模式，全平台适配老年用户操作习惯
- 内置图文+语音使用指南，降低学习门槛
- 完整的意见反馈闭环，让老年人的声音被听到

### 四大子系统

| 子系统 | 定位 | 核心场景 |
|--------|------|----------|
| 我的发布 | 个人内容统一管理中心 | 求助/闲置/交流管理，状态跟踪，编辑删除，已解决标记 |
| 消息设置 | 个性化通知管理面板 | 评论提醒、防诈提醒、音量调节、免打扰时段 |
| 楼栋切换 | 跨楼栋需求快速对接 | 绑定多楼栋（≤3）、一键切换、数据实时刷新 |
| 基础设置与反馈 | 适老化服务与反馈通道 | 大字模式、语音输入/播报、使用指南、意见反馈 |

---

## 二、技术选型

沿用互助广场现有技术栈，新增个人中心相关能力：

| 层级 | 技术方案 | 说明 |
|------|----------|------|
| 前端框架 | Vue 3 + Vite | 响应式渲染，组件化开发 |
| UI 组件库 | 自研适老化组件 | 无第三方 UI 库依赖 |
| 状态管理 | Pinia | user、notification、building 三个独立 Store |
| 路由 | Vue Router 4 | SPA 路由，层级别 ≤ 1 |
| HTTP | Axios | 请求拦截、错误统一处理 |
| 本地缓存 | localStorage（主）+ IndexedDB | 设置持久化、发布草稿缓存 |
| 语音播报 | Web Speech API（SpeechSynthesis） | 全平台内容朗读，支持语速/音调调节 |
| 语音输入 | 复用 useVoiceInput composable | 意见反馈语音输入 |
| 图片上传 | 复用 ImageUploader + CompressorJS | 反馈截图上传 |

---

## 三、路由设计

### 3.1 个人中心路由

| 路径 | 组件 | 说明 |
|------|------|------|
| `/profile` | ProfileHome | 个人中心首页（聚合入口） |
| `/profile/posts` | MyPosts | 我的发布列表 |
| `/profile/posts/edit/:id` | PostEdit | 编辑发布内容 |
| `/profile/settings` | MessageSettings | 消息通知设置 |
| `/profile/building` | BuildingSwitch | 楼栋切换管理 |
| `/profile/preferences` | Preferences | 基础设置（适老化配置） |
| `/profile/guide` | UserGuide | 使用指南（图文+语音） |
| `/profile/feedback` | Feedback | 意见反馈 |

### 3.2 入口

| 入口位置 | 触发方式 | 目标路由 |
|----------|----------|----------|
| 底部导航栏 "我的" Tab | 点击 | `/profile` |
| 广场首页用户头像 | 点击 | `/profile` |
| 消息中心设置按钮 | 点击 | `/profile/settings` |

---

## 四、组件树

```
ProfileHome（个人中心首页）
├── ProfileHeader            # 头像 + 昵称 + 楼栋号 + 编辑资料按钮
├── UserStatBar              # 统计数字条（发布数/已解决数/收藏数）
├── QuickEntryGrid           # 快捷入口宫格
│   ├── EntryItem × 6        # 我的发布 / 消息设置 / 楼栋切换 / 适老设置 / 使用指南 / 意见反馈
│   │   ├── EntryIcon        # 入口图标（含未读角标）
│   │   └── EntryLabel       # 入口文字
├── RecentPosts              # 最近发布预览（3 条）
│   └── PostStatusCard × 3   # 发布状态卡片（类型+状态+时间）
├── SettingsPreview           # 当前设置摘要
│   ├── FontModeStatus        # 大字模式状态
│   ├── BuildingStatus        # 当前绑定楼栋
│   └── NotificationStatus   # 通知开关状态
└── PrivacyFooter             # 隐私说明 + 版本号

MyPosts（我的发布列表）
├── PageHeader               # 返回 + 标题 "我的发布" + 筛选下拉
├── PostFilterTabs            # 状态筛选：全部/求助/闲置/交流/医院/政策/防诈
├── PostList                  # 发布列表
│   └── PostManageCard × N    # 单条发布管理卡片
│       ├── PostTypeBadge      # 类型徽章（求助/闲置/交流 等）
│       ├── PostStatusTag      # 状态标签（未回复/已回复/已解决）
│       ├── PostContent        # 内容摘要（截断 3 行）
│       ├── PostMeta            # 发布时间 + 浏览/评论数
│       └── PostActions        # 操作按钮组（编辑/删除/标记已解决）
├── EmptyState                # 空状态提示
└── DeleteConfirm             # 删除确认弹窗

PostEdit（编辑发布）
├── PageHeader               # 返回 + 标题
├── CategorySelector          # 分类选择器（7 分类）
├── ContentEditor             # 内容编辑器（复用 SquarePublish 逻辑）
│   ├── TextEditor             # 文字编辑区
│   ├── ImageUploader          # 图片上传区（复用）
│   └── VoiceInput             # 语音输入（复用）
└── SubmitBar                 # 保存修改 + 取消按钮

MessageSettings（消息设置）
├── PageHeader               # 返回 + 标题
├── SettingsSection "广场互动"
│   ├── ToggleItem "评论提醒"
│   ├── ToggleItem "点赞提醒"
│   └── ToggleItem "回复提醒"
├── SettingsSection "防诈提醒"
│   ├── ToggleItem "防诈预警推送"
│   ├── ToggleItem "防诈预警声音"
│   └── VolumeSlider "预警音量"
├── SettingsSection "免打扰"
│   ├── ToggleItem "开启免打扰"
│   ├── TimeRangePicker "免打扰时段"（如 22:00-07:00）
│   └── ToggleItem "群聊消息汇总推送"
└── SettingsSection "语音通知"
    ├── ToggleItem "新消息语音播报"
    └── VolumeSlider "播报音量"

BuildingSwitch（楼栋切换）
├── PageHeader               # 返回 + 标题 + 帮助按钮
├── CurrentBuildingCard       # 当前楼栋（大卡片突出显示）
│   ├── BuildingIcon          # 楼栋图标
│   ├── BuildingName          # 楼栋号 + 单元号
│   ├── MemberCount           # 成员数
│   └── SwitchIndicator       # "当前"标识
├── BoundBuildingList          # 已绑定楼栋列表
│   └── BuildingCard × N      # 楼栋卡片
│       ├── BuildingInfo       # 楼栋信息
│       ├── SwitchButton       # 切换按钮（大尺寸，≥56px）
│       └── UnbindButton       # 解绑按钮（需二次确认）
├── AddBuildingButton          # 添加楼栋按钮（最多3个，达上限置灰）
├── BuildingSearch             # 楼栋搜索（输入楼栋号筛选）
├── BindConfirmModal           # 绑定确认弹窗
└── HelpTip                    # 帮助提示："切换楼栋后广场信息和群聊会自动更新"

Preferences（适老化设置）
├── PageHeader               # 返回 + 标题
├── SettingsSection "显示"
│   ├── ToggleItem "大字模式"（全局字体 +28%）
│   └── ToggleItem "高对比度模式"（增强色差）
├── SettingsSection "语音"
│   ├── ToggleItem "语音输入优先"（默认使用麦克风输入）
│   ├── ToggleItem "语音自动播报"（文字内容自动朗读）
│   ├── SpeedSlider "语速"（0.5x / 0.75x / 1x / 1.25x / 1.5x）
│   └── PitchSlider "音调"（低/中/高）
├── SettingsSection "操作"
│   ├── ToggleItem "长按确认"（重要操作需长按 1.5s 确认）
│   ├── ToggleItem "振动反馈"
│   └── ToggleItem "按钮提示文字"（按钮下方显示说明文字）
├── SettingsSection "存储"
│   ├── StorageInfo            # 缓存大小显示
│   └── BaseButton "清空缓存"（二次确认）
└── SettingsSection "关于"
    ├── VersionInfo             # 版本号
    └── PrivacyLink             # 隐私政策链接

UserGuide（使用指南）
├── PageHeader               # 返回 + 标题
├── GuideModeToggle           # 图文版 / 语音版切换
├── GuideCategoryTabs          # 分类 Tab：医院/政策/防诈/广场发布/私信群聊
├── GuideContent               # 指南内容区
│   ├── GuideStep × N          # 分步骤说明
│   │   ├── StepNumber          # 步骤编号（大圆形数字）
│   │   ├── StepImage           # 示意图（大图，清晰标注）
│   │   ├── StepText            # 步骤文字（简短、口语化）
│   │   └── VoicePlayBtn        # 语音朗读按钮（语音版突出显示）
│   └── GuideVideo              # 操作演示视频（预留）
└── GuideFAQ                   # 常见问题

Feedback（意见反馈）
├── PageHeader               # 返回 + 标题
├── FeedbackTypeSelector       # 反馈类型：建议/问题/投诉/其他
├── FeedbackInput              # 反馈内容输入
│   ├── TextEditor              # 文字描述（占位符示例："请描述您遇到的问题或建议..."）
│   ├── VoiceInput              # 语音输入（复用 VoiceRecorder）— 口述问题
│   └── ImageUploader           # 截图上传（复用 ImageUploader，最多 3 张）
├── ContactInfo                # 联系方式（选填）：手机号/微信号
├── PrivacyHint                # 隐私提示："您的联系方式仅用于问题跟进，不会公开"
├── SubmitButton               # 提交按钮（大尺寸明显）
├── SubmitSuccess              # 提交成功反馈页
│   ├── SuccessIcon             # 绿色对勾动画
│   ├── SuccessText             # "感谢您的反馈！"
│   └── ProgressHint            # "工作人员将在 1-3 个工作日内回复您"
└── MyFeedbackList             # 我的反馈历史
    └── FeedbackCard × N        # 反馈卡片（类型+状态+时间+回复）
```

---

## 五、详细功能规格

---

### 5.1 我的发布（MyPosts）

#### 5.1.1 内容列表

- **数据来源**：`GET /api/user/posts` 按发布时间倒序
- **分类筛选**：顶部 7 个分类 Tab（全部/求助/闲置/交流/医院便民/政策解读/防诈骗），横向滚动
- **状态标签**（颜色区分）：
  - `unreplied`（未回复）— 橙色标签，表示尚未有人互动
  - `replied`（已回复）— 蓝色标签，表示已有互动但未解决
  - `resolved`（已解决）— 绿色标签 + 对勾图标
- **老年人专属标色**：
  - 医院便民类 → 浅蓝底色卡片
  - 政策解读类 → 浅绿底色卡片
  - 防诈骗类 → 浅黄底色卡片
- **分页**：每页 20 条，滚动加载更多

#### 5.1.2 内容操作

**编辑**：
- 点击 "编辑" → `/profile/posts/edit/:id`
- 复用 SquarePublish 的内容编辑逻辑（文字/图片/语音）
- 医院/政策/防诈类型不可修改为其他类型（保证内容准确性）
- 保存后返回列表并 toast "修改已保存"

**删除**：
- 点击 "删除" → 弹出二次确认弹窗
- 弹窗文案："删除后不可恢复，确定删除？"
- 按钮：灰色 "取消"（左）+ 红色 "确认删除"（右）
- 确认后 `DELETE /api/user/posts/:id` → 列表移除该条 + toast "已删除"

**标记已解决**：
- 点击 "标记已解决" → 弹出确认："确认将此需求标记为已解决？标记后将在广场置顶展示24小时"
- 确认后 `POST /api/user/posts/:id/resolve`
- 状态变更为 `resolved`，卡片背景变为浅绿色
- 互助广场自动置顶展示 24 小时，之后自动下沉
- 可手动取消已解决状态（"取消标记"按钮）

#### 5.1.3 列表交互

- **下拉刷新**：下拉重新加载列表
- **长按操作**：长按卡片弹出操作菜单（编辑/删除/标记已解决），适配老年人操作习惯
- **空状态**："还没有发布过内容，去互助广场发布第一条吧" + 跳转按钮

---

### 5.2 消息设置（MessageSettings）

#### 5.2.1 广场互动提醒

- **评论提醒**：Toggle 开关，默认开启。开启后有人评论我的帖子时推送通知
- **点赞提醒**：Toggle 开关，默认开启
- **回复提醒**：Toggle 开关，默认开启。有人回复我的评论时推送
- 所有开关即时生效，`POST /api/user/settings/notification`

#### 5.2.2 防诈专属提醒

- **防诈预警推送**：Toggle 开关，默认强制开启且不可关闭（红色文字说明"为保障您的财产安全，此项不可关闭"）
- **防诈预警声音**：Toggle 开关，默认开启。收到防诈预警时播放特殊提示音
- **预警音量**：Slider 0-100，默认 80，大滑动条 ≥ 56px 触控区

#### 5.2.3 免打扰设置

- **开启免打扰**：Toggle 开关，默认关闭
- **免打扰时段**：TimeRangePicker（22:00 - 07:00 默认），时间段内不推送通知，消息静默收集
- **群聊消息汇总推送**：Toggle 开关，默认关闭。开启后群聊消息不在免打扰时段逐条推送，而是在免打扰结束后汇总推送一次（"您有 5 条新群聊消息"）

#### 5.2.4 语音通知

- **新消息语音播报**：Toggle 开关，默认关闭。开启后收到新消息时自动语音播报："您有一条来自[昵称]的新消息"
- **播报音量**：Slider 0-100，默认 60

#### 5.2.5 大字体适配

- 所有 Toggle 开关 ≥ 56px 高
- Slider 触控区 ≥ 56px
- 设置项间距 ≥ 16px（大字模式 24px）
- 每项设置左侧图标 + 文字说明，图标 ≥ 28px

---

### 5.3 楼栋切换（BuildingSwitch）

#### 5.3.1 当前楼栋展示

- 顶部大卡片突出当前楼栋，浅色背景 + "当前"标识
- 显示：楼栋图标 + 完整楼栋号 + 单元号 + 成员数
- 卡片底部显示"切换后广场信息和群聊内容将自动更新"提示

#### 5.3.2 绑定楼栋

- 最多绑定 **3 个**楼栋
- **添加入口**：底部固定大按钮 "＋ 添加楼栋"（≥ 56px 高）
- 点击 → 弹出楼栋选择器（搜索 + 列表）
- 搜索：输入楼栋号实时筛选，如输入 "7" → 显示 "7号楼 1单元"、"7号楼 2单元"...
- 选择楼栋 → 弹出确认弹窗："确认绑定 [楼栋号]？绑定后可在该楼栋的群聊中发言"
- 确认后 `POST /api/user/buildings` → 刷新列表
- 已达 3 个上限时按钮置灰并显示"最多绑定 3 个楼栋"

#### 5.3.3 切换楼栋

- 已绑定楼栋列表中，点击 "切换至此" 大按钮（≥ 56px × 56px）
- 切换后触发：
  - `PUT /api/user/current-building` → 更新当前楼栋
  - 刷新互助广场信息流（`useSquareStore.fetchPosts(true)`）
  - 刷新群聊列表（`useGroupStore.fetchGroups()`）
  - Toast："已切换到 [楼栋号]"
- 当前选中的楼栋卡片自动移至顶部 + 高亮边框

#### 5.3.4 解绑楼栋

- 每个楼栋卡片右上角 "解绑" 按钮
- 当前楼栋不可解绑（先切换到其他楼栋）
- 解绑 → 二次确认弹窗："解绑后你将退出该楼栋的群聊，确定？"
- 确认后 `DELETE /api/user/buildings/:buildingId`

#### 5.3.5 适老化设计

- 绑定/切换按钮大尺寸（≥ 56px）
- 当前楼栋卡片突出（边框 + 背景色）
- 操作按钮固定位置，不随滚动隐藏
- 切换后 Toast 提示停留 3 秒，大字显示
- 帮助提示使用通俗语言："换楼栋就像换频道，不影响你原来的消息"

---

### 5.4 基础设置与反馈

#### 5.4.1 适老化设置（Preferences）

**显示设置**：
- **大字模式**：Toggle，默认关闭。开启后全平台字体 +28%、行高 1.8、触控区 ≥ 56px
  - 复用 `useSquareStore.toggleFontMode()` 全局生效
- **高对比度模式**：Toggle，默认关闭。开启后文字对比度 ≥ 7:1（AAA级），按钮边框加粗

**语音设置**：
- **语音输入优先**：Toggle，默认关闭。开启后输入框默认显示麦克风按钮（大字+突出），点击直接开始语音识别
  - 复用 `useVoiceInput` composable
- **语音自动播报**：Toggle，默认关闭。开启后全平台文字内容支持语音朗读
  - 技术：Web Speech API（SpeechSynthesis）
  - 朗读触发：帖子标题旁增加 🔊 按钮，点击朗读标题+内容
  - 朗读时显示播放进度条
  - 再次点击停止朗读
- **语速**：分段 Slider，0.5x / 0.75x / 1x（默认）/ 1.25x / 1.5x
  - 每个速度点有文字标签，方便老年人理解
- **音调**：三段选择器，低 / 中（默认）/ 高

**操作设置**：
- **长按确认**：Toggle，默认关闭。开启后删除、退出群聊等重要操作需长按 1.5 秒确认，防误触
- **振动反馈**：Toggle，默认开启。点击按钮时轻微振动（移动端）
- **按钮提示文字**：Toggle，默认开启。图标按钮下方显示小字说明

**存储管理**：
- 显示当前缓存大小（localStorage + IndexedDB 合计）
- "清空缓存"按钮 → 二次确认弹窗 → 清除图片缓存、聊天记录缓存（保留设置和草稿）

**关于**：
- 版本号显示
- 隐私政策链接
- 用户协议链接

#### 5.4.2 使用指南（UserGuide）

**模式切换**：
- 顶部 "图文版" / "语音版" Tab 切换
- 语音版：每个步骤旁有 🔊 大按钮，点击朗读步骤内容

**分类指南**（5 个板块）：
1. **医院便民**：如何查看医院便民信息、如何联系医院联系人、如何使用需求确认卡片
2. **政策解读**：如何查看政策、如何收藏政策、如何咨询政策
3. **防诈预警**：如何识别诈骗信息、收到预警怎么办、如何举报
4. **广场发布**：如何发布求助/闲置、如何上传图片、如何标记已解决
5. **私信群聊**：如何发私信、如何在群聊中发言、如何发语音/图片消息

**指南设计规范**：
- 每个板块 4-8 个步骤
- 每步：大编号（圆形 + 数字）+ 一句话说明 + 示意图
- 文字简短、口语化，避免技术术语（如不说"点击提交按钮"而说"点这里发送"）
- 示意图：手机界面截图 + 红色箭头/圆圈标注
- `语言版本`：所有文字内容支持语音朗读（SpeechSynthesis）
- 预留视频演示位置（后续迭代）

**常见问题**（FAQ）：
- "怎么知道有人回复我了？" → 消息中心红点提示
- "怎么换到其他楼栋？" → 个人中心 → 楼栋切换
- "字太小看不清怎么办？" → 个人中心 → 大字模式
- "怎么举报骚扰消息？" → 聊天页右上角 → 举报

#### 5.4.3 意见反馈（Feedback）

**反馈类型**：
- 单选：建议 / 问题 / 投诉 / 其他

**反馈内容**：
- 文字描述：textarea，占位符示例引导
- 语音输入：复用 VoiceRecorder，老年人口述问题
- 截图上传：复用 ImageUploader，最多 3 张

**联系方式**：
- 手机号/微信号（选填）
- 隐私提示文字："仅用于问题跟进，不会公开"

**提交**：
- 大提交按钮（≥ 56px）
- `POST /api/feedback` → 成功后跳转成功页
- 成功页显示："感谢您的反馈！工作人员将在 1-3 个工作日内回复您"
- 管理员后台实时收到推送

**反馈历史**：
- 列表展示我的历史反馈
- 每条显示：类型 + 状态（处理中/已回复/已解决）+ 提交时间 + 管理员回复
- 有新回复时消息中心红点提醒
- 管理员回复支持语音播报（语音版）

---

## 六、数据接口

### 6.1 个人中心接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/user/profile` | 获取个人信息（头像/昵称/楼栋/统计） |
| PUT | `/api/user/profile` | 编辑个人信息 |

### 6.2 我的发布接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/user/posts` | 获取我的发布列表（分页+筛选） |
| GET | `/api/user/posts/:id` | 获取单条发布详情 |
| PUT | `/api/user/posts/:id` | 编辑发布内容 |
| DELETE | `/api/user/posts/:id` | 删除发布 |
| POST | `/api/user/posts/:id/resolve` | 标记已解决 |
| DELETE | `/api/user/posts/:id/resolve` | 取消已解决标记 |

### 6.3 消息设置接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/user/settings/notification` | 获取通知设置 |
| PUT | `/api/user/settings/notification` | 更新通知设置 |

### 6.4 楼栋切换接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/user/buildings` | 获取已绑定楼栋列表 |
| POST | `/api/user/buildings` | 绑定新楼栋 |
| PUT | `/api/user/buildings/:id/current` | 切换当前楼栋 |
| DELETE | `/api/user/buildings/:id` | 解绑楼栋 |
| GET | `/api/buildings/search` | 搜索楼栋（?keyword=xx） |

### 6.5 适老化设置接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/user/settings/preferences` | 获取偏好设置 |
| PUT | `/api/user/settings/preferences` | 更新偏好设置 |

### 6.6 反馈接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/feedback` | 提交反馈 |
| GET | `/api/feedback/my` | 获取我的反馈列表 |
| GET | `/api/feedback/:id` | 获取反馈详情（含回复） |

### 6.7 核心数据结构

```typescript
// ==================== 用户信息 ====================

interface UserProfile {
  uid: string;
  nickname: string;
  avatar: string;
  building: string;           // 当前楼栋号（如"7号楼2单元"）
  role: 'resident' | 'admin' | 'volunteer';
  stats: UserStats;
}

interface UserStats {
  total_posts: number;        // 总发布数
  resolved_posts: number;     // 已解决数
  favorited_posts: number;    // 收藏数
  total_feedback: number;     // 反馈数
}

// ==================== 我的发布 ====================

interface MyPost {
  id: string;
  category: 'help' | 'idle' | 'chat' | 'hospital' | 'policy' | 'anti_fraud';
  content: string;
  images: ImageItem[];
  status: 'unreplied' | 'replied' | 'resolved';
  view_count: number;
  comment_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
  is_elderly_type: boolean;   // 医院/政策/防诈 = true
}

interface ImageItem {
  original: string;           // 原图 URL
  thumb: string;              // 缩略图 URL
}

// ==================== 消息设置 ====================

interface NotificationSettings {
  // 广场互动
  comment_notify: boolean;       // 评论提醒（默认 true）
  like_notify: boolean;          // 点赞提醒（默认 true）
  reply_notify: boolean;         // 回复提醒（默认 true）
  // 防诈提醒
  anti_fraud_push: boolean;      // 防诈预警推送（强制 true）
  anti_fraud_sound: boolean;     // 防诈预警声音（默认 true）
  anti_fraud_volume: number;     // 预警音量 0-100（默认 80）
  // 免打扰
  do_not_disturb: boolean;       // 免打扰开关（默认 false）
  dnd_start: string;             // 免打扰开始 "22:00"
  dnd_end: string;               // 免打扰结束 "07:00"
  group_digest: boolean;         // 群聊消息汇总推送（默认 false）
  // 语音通知
  voice_notify: boolean;         // 语音播报（默认 false）
  voice_volume: number;          // 播报音量 0-100（默认 60）
}

// ==================== 楼栋 ====================

interface BoundBuilding {
  id: string;
  building_name: string;      // 如"7号楼"
  unit_name: string;          // 如"2单元"
  full_name: string;          // 如"7号楼2单元"
  member_count: number;
  is_current: boolean;
  bound_at: string;
}

// ==================== 适老化设置 ====================

interface Preferences {
  // 显示
  large_font: boolean;           // 大字模式
  high_contrast: boolean;        // 高对比度
  // 语音
  voice_input_priority: boolean; // 语音输入优先
  voice_auto_read: boolean;      // 语音自动播报
  speech_rate: number;           // 语速 0.5-1.5（默认 1.0）
  speech_pitch: string;          // 音调 'low' | 'mid' | 'high'（默认 'mid'）
  // 操作
  long_press_confirm: boolean;   // 长按确认
  haptic_feedback: boolean;      // 振动反馈（默认 true）
  show_button_hints: boolean;    // 按钮提示文字（默认 true）
}

// ==================== 反馈 ====================

interface Feedback {
  id: string;
  type: 'suggestion' | 'problem' | 'complaint' | 'other';
  content: string;             // 文字描述
  voice_url?: string;          // 语音描述 URL
  images: string[];            // 截图 URL 列表
  contact?: string;            // 联系方式（选填）
  status: 'pending' | 'processing' | 'replied' | 'resolved';
  admin_reply?: string;        // 管理员回复
  created_at: string;
  updated_at: string;
}
```

---

## 七、适老化开发 Checklist

### 视觉
- [ ] 所有页面字号 ≥ 18px（正常）/ ≥ 22px（大字模式）
- [ ] 文字对比度 ≥ 4.5:1（正常）/ ≥ 7:1（大字+高对比度）
- [ ] 按钮最小触控区 ≥ 44px（正常）/ ≥ 56px（大字）
- [ ] 图标尺寸 ≥ 24px（正常）/ ≥ 32px（大字）
- [ ] 操作按钮固定位置，不随滚动变化
- [ ] 重要状态用颜色+图标双标识（如已解决=绿色+✓）
- [ ] 老年人专属内容（医院/政策/防诈）单独标色

### 交互
- [ ] 关键操作（删除/解绑/退出）二次确认弹窗
- [ ] 长按确认模式（可选）防误触
- [ ] 切换楼栋后 Toast 提示停留 ≥ 3 秒
- [ ] 语音朗读按钮明显且大（≥ 48px）
- [ ] 设置项间距 ≥ 16px（大字模式 24px）
- [ ] Slider 触控区 ≥ 56px
- [ ] 搜索框 ≥ 48px 高，placeholder 文字清晰
- [ ] 操作反馈即时（按钮态变化 / Toast / 振动）

### 语音
- [ ] 语音播报支持语速调节（0.5x-1.5x）
- [ ] 语音播报支持暂停/继续/停止
- [ ] 语音输入复用现有 VoiceRecorder
- [ ] 使用指南语音版每步骤可独立朗读
- [ ] 管理员反馈回复支持语音播报

### 隐私
- [ ] 意见反馈联系方式选填、仅用于跟进
- [ ] 隐私提示文字在提交前清晰展示
- [ ] 缓存清空保留设置和草稿
- [ ] 不解绑当前楼栋时不允许退出（防止误操作）

### 技术
- [ ] 设置项即时保存（Toggle 切换即请求）
- [ ] 楼栋切换后数据实时刷新（广场+群聊）
- [ ] 缓存大小计算准确
- [ ] 发布编辑复用现有编辑逻辑
- [ ] 反馈内容脱敏后推送管理员
- [ ] SpeechSynthesis 降级处理（不支持时隐藏语音按钮）

---

## 八、目录结构

```
src/
├── views/
│   └── profile/
│       ├── ProfileHome.vue              # 个人中心首页
│       ├── MyPosts.vue                  # 我的发布列表
│       ├── PostEdit.vue                 # 编辑发布
│       ├── MessageSettings.vue          # 消息设置
│       ├── BuildingSwitch.vue           # 楼栋切换
│       ├── Preferences.vue              # 适老化设置
│       ├── UserGuide.vue                # 使用指南
│       ├── Feedback.vue                 # 意见反馈
│       └── components/
│           ├── ProfileHeader.vue        # 头像+昵称+楼栋
│           ├── UserStatBar.vue          # 统计数字条
│           ├── QuickEntryGrid.vue       # 快捷入口宫格
│           ├── EntryItem.vue            # 单个入口项
│           ├── PostManageCard.vue       # 发布管理卡片
│           ├── PostFilterTabs.vue       # 分类筛选 Tab
│           ├── SettingsSection.vue      # 设置分组容器（可复用）
│           ├── ToggleItem.vue           # 开关设置项（可复用）
│           ├── VolumeSlider.vue         # 大触控区音量滑块
│           ├── TimeRangePicker.vue      # 时间段选择器
│           ├── BuildingCard.vue         # 楼栋卡片
│           ├── BuildingSearch.vue       # 楼栋搜索
│           ├── GuideContent.vue         # 指南内容区
│           ├── GuideStep.vue            # 单个指南步骤
│           ├── FeedbackCard.vue         # 反馈卡片
│           └── DeleteConfirm.vue        # 删除确认弹窗（可复用）
├── stores/
│   ├── user.js                          # 用户信息 + 发布管理
│   ├── notification.js                  # 通知设置状态
│   └── building.js                      # 楼栋管理状态
├── api/
│   ├── user.js                          # 用户接口封装
│   ├── posts.js                         # 发布管理接口（可扩展 square.js）
│   ├── notification.js                  # 通知设置接口
│   ├── building.js                      # 楼栋接口封装
│   └── feedback.js                      # 反馈接口封装
├── composables/
│   ├── useSpeechSynthesis.js            # 语音播报（朗读文字内容）
│   ├── useLongPress.js                  # 长按确认手势
│   └── useStorageSize.js               # 缓存大小计算
└── components/
    └── ui/
        └── BaseSlider.vue               # 大触控区滑块组件
```

---

## 九、开发排期

| 阶段 | 内容 | 预估工时 |
|------|------|----------|
| P0-1 | 路由 + ProfileHome（Header/StatBar/QuickEntry/设置摘要） | 1 天 |
| P0-2 | MyPosts 发布列表 + PostManageCard + 筛选/删除/标记已解决 | 1.5 天 |
| P0-3 | PostEdit 编辑页（复用 SquarePublish 组件） | 0.5 天 |
| P0-4 | MessageSettings 消息设置（Toggle/Slider/TimeRangePicker） | 1.5 天 |
| P0-5 | BuildingSwitch 楼栋切换（搜索/绑定/切换/解绑） | 1.5 天 |
| P1-1 | Preferences 适老化设置（大字/对比度/语音/操作偏好） | 1.5 天 |
| P1-2 | useSpeechSynthesis 语音播报 composable | 1 天 |
| P1-3 | UserGuide 使用指南（5 板块图文+语音版） | 2 天 |
| P1-4 | Feedback 意见反馈（文字/语音/截图/历史列表） | 1.5 天 |
| P2-1 | 适老化细节联调（字号/按钮/对比度/语音交互/长按确认） | 1.5 天 |
| P2-2 | 隐私安全走查（联系方式保护/脱敏/清空缓存逻辑） | 0.5 天 |
| P2-3 | 浏览器兼容性测试（Chrome/Edge/Safari + 微信内置浏览器） | 1 天 |
| P2-4 | 老年用户灰度测试（邀请 5-10 位 60+ 用户测试全流程） | 1 天 |
| **合计** | | **~16 天** |

---

## 十、测试要点

### 我的发布测试

1. **列表加载**：分页加载正常，下拉刷新正常，空状态显示正确
2. **分类筛选**：7 个分类 Tab 筛选正确，切换流畅
3. **状态标签**：未回复/已回复/已解决 颜色正确，老年人类型标色正确
4. **编辑功能**：进入编辑页 → 修改内容 → 保存 → 列表更新
5. **删除功能**：二次确认弹窗 → 确认删除 → 列表移除 → Toast
6. **标记已解决**：确认弹窗 → 标记成功 → 状态变更 → 广场置顶
7. **长按操作**：长按 ≥ 1.5s → 弹出操作菜单（适老化模式下）

### 消息设置测试

8. **开关即时生效**：Toggle 切换 → 设置保存 → 实际通知行为变化
9. **防诈强制开启**：防诈推送不可关闭，关闭按钮置灰
10. **音量调节**：Slider 调节 → 预览音量 → 保存
11. **免打扰时段**：设置时段 → 时段内无推送 → 时段外正常推送
12. **语音播报**：开启 → 收到新消息 → 语音朗读

### 楼栋切换测试

13. **绑定楼栋**：搜索→选择→确认→列表增加，上限 3 个时禁止添加
14. **切换楼栋**：点击切换 → 广场数据刷新 → 群聊列表刷新 → Toast
15. **当前楼栋保护**：当前楼栋解绑按钮置灰
16. **解绑确认**：二次确认 → 解绑成功 → 退出群聊
17. **数据同步**：切换后广场信息/群聊内容/成员列表实时更新

### 适老化设置测试

18. **大字模式**：开启 → 全平台字体 +28% → 按钮触控区 ≥ 56px
19. **高对比度**：开启 → 对比度 ≥ 7:1 → 按钮边框加粗
20. **语音输入优先**：开启 → 输入框默认显示麦克风
21. **语音播报**：开启 → 帖子旁有 🔊 → 点击朗读 → 再次点击停止
22. **语速调节**：切换语速 → 朗读速度变化
23. **长按确认**：开启 → 删除操作需长按 1.5s
24. **缓存清空**：显示缓存大小 → 清空 → 设置保留

### 使用指南测试

25. **图文版/语音版切换**：切换正常，语音版有朗读按钮
26. **5 个板块内容完整**：每个板块 4-8 步骤，图文明晰
27. **语音朗读**：每步骤可独立朗读，语速可调
28. **FAQ 可点击展开**：答案清晰准确

### 意见反馈测试

29. **类型选择**：4 种类型单选正常
30. **文字+语音+截图**：文字输入、语音录制、图片上传均正常
31. **隐私提示**：提交前隐私文字可见
32. **提交成功**：成功页显示 + 管理员后台收到推送
33. **反馈历史**：列表正确，管理员回复可见，语音可播报

### 适老化测试（整体）

34. **字号/对比度达标**：正常模式下 AA，大字+高对比度下 AAA
35. **点击区达标**：所有可交互元素 ≥ 56px（大字模式）
36. **操作流程简洁**：核心操作 ≤ 3 步完成
37. **文字通俗**：无技术术语，老年人可独立理解
38. **语音覆盖**：关键信息均有语音播报入口

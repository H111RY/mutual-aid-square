# 沟通中心 Web 端开发文档

## 文档信息
- **模块名称**：沟通中心（精准对接与隐私安全保障体系）
- **版本**：v1.0
- **身份**：社区技术人员 / 网站开发者
- **最后更新**：2026-06-02

---

## 一、功能概述

沟通中心是社区平台精准互动渠道核心模块，实现**"一对一精准对接 + 小范围楼栋沟通 + 专属便民对接"**三重沟通需求。全程遵循隐私保护原则——不收集非必要信息、不对外泄露隐私。

### 核心目标
- 解决邻里求助对接难、楼栋信息传播不及时、老年人便民需求对接无固定渠道等问题
- 保障沟通效率、信息触达率与使用安全感
- 适配老年人接收信息节奏慢、操作不灵活的特点

### 两大子系统

| 子系统 | 定位 | 核心场景 |
|--------|------|----------|
| 一对一私信 | 安全高效的私密沟通通道 | 邻里互助对接、医院陪诊咨询、政策咨询 |
| 楼栋专属群聊 | 圈层化的邻里沟通阵地 | 楼栋通知、邻里交流、便民信息置顶 |

---

## 二、技术选型

沿用互助广场现有技术栈，新增即时通讯相关能力：

| 层级 | 技术方案 | 说明 |
|------|----------|------|
| 前端框架 | Vue 3 + Vite | 响应式渲染，组件化开发 |
| UI 组件库 | 自研适老化组件 | 无第三方 UI 库依赖 |
| 实时消息 | WebSocket（主）+ 轮询降级 | 消息实时推送，断线自动重连 |
| 语音消息 | Web Speech API + MediaRecorder | 录制 → 上传 → 播放，支持暂停/续播 |
| 图片处理 | compressor.js + OSS | 前端压缩后上传，生成缩略图 |
| 状态管理 | Pinia | chat、group 两个独立 Store |
| 路由 | Vue Router 4 | SPA 路由 |
| HTTP | Axios | 请求拦截、错误统一处理 |
| 本地缓存 | IndexedDB（主）+ localStorage | 聊天记录本地缓存，可手动删除 |
| 存储 | localStorage | 已读状态、草稿、使用习惯持久化 |

---

## 三、路由设计

### 3.1 私信路由

| 路径 | 组件 | 说明 |
|------|------|------|
| `/chat` | ChatList | 私信会话列表页 |
| `/chat/:conversationId` | ChatConversation | 一对一私信聊天页 |
| `/chat/new/:userId` | ChatConversation | 新建私信（从用户头像进入） |

### 3.2 群聊路由

| 路径 | 组件 | 说明 |
|------|------|------|
| `/group` | GroupList | 我的群聊列表页 |
| `/group/:groupId` | GroupChat | 楼栋群聊页 |

### 3.3 入口路由

| 路径 | 说明 |
|------|------|
| `/messages` | 消息中心聚合页（私信 + 群聊 未读汇总） |

---

## 四、组件树

```
ChatList（私信会话列表）
├── MessageTopNav            # 顶部导航（标题 + 字体切换）
├── ConversationList         # 会话列表
│   └── ConversationItem × N # 单条会话
│       ├── Avatar           # 对方头像（点击可看大图）
│       ├── ConversationInfo # 昵称 + 楼栋号 + 最后消息预览 + 时间
│       └── UnreadBadge      # 未读红点/数字
├── EmptyState               # 空状态（暂无私信）
└── SearchBar                # 搜索会话（可选）

ChatConversation（一对一私信页）
├── ChatHeader               # 顶部栏（返回 + 对方昵称+楼栋 + 举报按钮）
├── MessageList              # 消息列表（虚拟滚动）
│   └── MessageBubble × N    # 单条消息气泡
│       ├── TextBubble       # 文字消息
│       ├── ImageBubble      # 图片消息（点击放大）
│       └── VoiceBubble      # 语音消息（播放/暂停 + 时长 + 波形）
├── DemandConfirm            # 需求确认快捷卡片（医院/政策场景）
├── ChatInput                # 底部输入栏
│   ├── TextInput            # 文字输入
│   ├── VoiceRecordBtn       # 语音录制按钮
│   └── ImageUploadBtn       # 图片发送按钮
└── ReportPanel              # 举报面板（诈骗/违规/可疑）

GroupList（群聊列表页）
├── MessageTopNav            # 顶部导航
├── GroupListContent         # 群列表
│   └── GroupItem × N        # 单个群聊条目
│       ├── GroupAvatar      # 群头像（楼栋图标）
│       ├── GroupInfo        # 群名称 + 最后消息 + 时间
│       └── UnreadBadge      # 未读标记
└── EmptyState               # 空状态

GroupChat（楼栋群聊页）
├── GroupHeader              # 顶部栏（返回 + 群名 + 成员数）
├── GroupNoticeBar           # 群公告置顶条（可展开/收起）
├── MessageList              # 消息列表
│   ├── PinnedMessage × N    # 置顶消息（医院/政策/防诈/紧急）
│   └── MessageBubble × N    # 普通消息
├── GroupMemberDrawer        # 群成员侧边栏（群主可见管理按钮）
└── ChatInput                # 底部输入栏（同私信）
```

---

## 五、详细功能规格

---

### 5.1 一对一私信（ChatConversation）

#### 5.1.1 发起私信

- **入口**：
  - 帖子详情页：点击发布者头像 → `/chat/new/:userId`
  - 评论列表：点击评论者头像 → `/chat/new/:userId`
  - 私信列表页：「新建私信」按钮 → 搜索用户（按楼栋号筛选）
- **隐私规则**：
  - 聊天界面仅展示双方**"楼栋号 + 昵称"**，不泄露手机号、真实姓名、门牌号
  - 用户 ID 采用服务端生成的匿名标识，前端不暴露数据库主键
- **首次私信**：系统自动发送一条友好提示：「你的楼栋号和昵称将对对方可见，请放心交流」

#### 5.1.2 消息类型

**文字消息**：
- `<textarea>` 自适应高度（1-4 行），支持换行
- 回车键发送（Shift+Enter 换行）
- 发送后清空输入框，消息即时显示在聊天区（乐观插入）
- 发送失败 → 消息旁显示红色感叹号 + 「重新发送」按钮

**图片消息**：
- 点击输入栏「📷」按钮 → 唤起文件选择器 `accept="image/*"`
- 发送前压缩至宽度 ≤ 1200px、质量 0.8
- 发送中显示模糊占位 + 进度环
- 点击图片 → 全屏灯箱预览（复用 ImageViewer 组件）
- 支持从相册选图 + 拍照（移动端 `capture` 属性）

**语音消息**：
- 输入栏「🎤」按钮 → 长按录音（复用 VoiceFallback 组件逻辑）
- 录音时显示：声波动画 + 计时器 + 「上滑取消」提示
- 松开自动发送，上滑 ≥ 80px 取消
- 语音气泡显示时长标签（如"15″"），点击播放
- **播放交互**：
  - 点击播放 → 波形进度动画 + 时长倒计时
  - 再次点击 → 暂停，记录播放位置
  - 支持反复播放、暂停续播
  - 播放完毕 → 波形归零
- 语音消息最大时长 60 秒，超时自动停止并发送

#### 5.1.3 消息列表

- **排序**：按时间正序（最新消息在底部）
- **自动滚动**：新消息到达 → 自动滚到底部；用户手动上滑查看历史时不自动滚
- **加载历史**：滚动到顶部 → 自动加载上一页（每页 30 条）
- **时间分隔**：消息间隔超过 5 分钟 → 插入时间标签（如"14:30"、"昨天 09:15"）
- **消息状态**：
  - `sending` — 发送中（灰色 + 转圈）
  - `sent` — 已发送（无标记）
  - `read` — 已读（对方头像旁显示"已读"）
  - `failed` — 发送失败（红色感叹号）

#### 5.1.4 实时推送

- **WebSocket 连接**：进入聊天页时建立连接，离开时断开
  ```
  ws://host/ws/chat?token=xxx
  ```
- **心跳机制**：每 30 秒发送 ping，60 秒未收到 pong 则重连
- **重连策略**：指数退避，1s → 2s → 4s → 8s → 16s（最大），重连成功后拉取增量消息
- **降级方案**：WebSocket 连接失败时，降级为每 5 秒轮询 `GET /api/chat/poll`
- **消息推送格式**：
  ```json
  {
    "type": "new_message",
    "payload": {
      "id": "msg_001",
      "conversation_id": "conv_001",
      "sender_uid": "u_123",
      "msg_type": "text",
      "content": "你好，请问明天可以帮忙吗？",
      "created_at": "2026-06-02T14:30:00Z"
    }
  }
  ```

#### 5.1.5 未读提醒

- 私信列表页：有未读的会话置顶，会话条目右侧显示**红色圆点 + 未读数**
- 全局消息入口（顶部导航栏「消息」图标）：所有会话未读总数角标
- 进入聊天页 → 自动标记已读（`POST /api/chat/:conversationId/read`）
- 页面标题闪烁提醒：`document.title = '【新消息】互助广场'`（仅在页面不可见时）

#### 5.1.6 需求确认快捷卡片（医院/政策高频场景）

- **触发条件**：对方是医院便民或政策咨询相关联系人（由后台配置角色标签）
- **卡片形式**：聊天区顶部固定区域，浅蓝色背景卡片
- **内容模板**：
  ```
  ┌─────────────────────────────────────┐
  │  🏥 陪诊需求确认                    │
  │  就诊时间：____年____月____日        │
  │  就诊医院：____________________      │
  │  需要帮助：□挂号 □取药 □陪同检查    │
  │  联系电话（选填）：____________      │
  │            [确认发送]               │
  └─────────────────────────────────────┘
  ```
- 点击「确认发送」→ 以卡片消息形式发送给对方
- 对方收到后可直接回复确认/修改

#### 5.1.7 举报机制

- **入口**：聊天页顶部右侧「⋯」菜单 → 「举报」
- **举报面板**（ReportPanel）：
  - 举报类型单选：诈骗信息 / 骚扰信息 / 违规广告 / 其他
  - 补充说明 textarea（选填）
  - 自动附带最近 10 条聊天记录截图（脱敏处理）
  - 提交按钮 → `POST /api/report`
- **反馈**：提交成功 → Toast「举报已提交，社区工作人员将尽快处理」

#### 5.1.8 聊天记录管理

- **本地缓存**：聊天记录存入 IndexedDB（`chat_messages` store），离线可查看历史
- **手动删除**：长按会话 → 「删除聊天记录」→ 二次确认弹窗 → 删除本地 + 服务端标记
- **删除提示**：「删除后不可恢复，确定删除？」
- **隐私保护**：删除操作不通知对方，不留痕迹

---

### 5.2 楼栋专属群聊（GroupChat）

#### 5.2.1 自动入群机制

- **触发条件**：用户首次手机号登录 + 完成楼栋/单元选择
- **匹配规则**：根据用户选择的楼栋号 + 单元号，自动匹配对应群聊
  - 示例：选择"7号楼 2单元" → 自动加入"7号楼2单元群"
- **白名单机制**：
  - 成员仅限该楼栋/单元注册用户
  - 非本楼栋用户无法搜索、无法加入
  - 用户迁出楼栋 → 自动移出旧群、加入新群
- **入群欢迎语**：系统自动发送「👋 欢迎 [昵称] 加入本群，你的楼栋号和昵称将对群成员可见」

#### 5.2.2 群聊功能

**消息类型**：文字、图片、语音（同私信 5.1.2）

**群公告**：
- 顶部固定公告栏（GroupNoticeBar），黄色背景
- 仅群主（社区居委会工作人员）可发布/编辑
- 支持文字 + 链接，最多 500 字
- 新成员入群时自动弹窗展示（仅一次）
- 可展开/收起，默认展示前 2 行

**消息置顶**：
- 群主可将消息置顶展示
- 适用内容：医院便民通知、政策解读、防诈预警、紧急公告
- 置顶消息在消息列表顶部固定显示，浅黄色背景 + 📌 图标
- 最多同时置顶 3 条
- 已读后用户可手动取消（仅取消自己的置顶显示）

**群成员管理**（群主权限）：
- 成员列表侧边栏（GroupMemberDrawer）：头像 + 昵称 + 楼栋号
- 群主可：移出成员、禁言（30分钟/2小时/24小时）、设为管理员
- 操作需二次确认弹窗
- 禁言用户发送消息时提示：「你已被禁言，剩余 xx 分钟」

**消息免打扰**：
- 群设置页：「消息免打扰」开关
- 开启后：新消息不推送、不红点提醒
- 群聊列表仍显示未读数（灰色数字）
- 持久化到 localStorage

#### 5.2.3 成员列表侧边栏

- **入口**：群聊页顶部右侧「成员」按钮
- **展示**：右侧滑出抽屉，头像网格排列
- **排序**：群主 → 管理员 → 按入群时间倒序
- **搜索**：顶部搜索框，按昵称/楼栋号过滤
- **点击成员**：群主 → 弹出管理菜单；普通成员 → 显示信息卡片（昵称+楼栋号）→ 「发私信」按钮

#### 5.2.4 群聊消息推送

- WebSocket 推送格式：
  ```json
  {
    "type": "group_message",
    "payload": {
      "id": "msg_001",
      "group_id": "g_7_2",
      "sender": { "uid": "u_123", "nickname": "王阿姨", "avatar": "..." },
      "msg_type": "text",
      "content": "今天下午有人一起去卫生院吗？",
      "is_pinned": false,
      "created_at": "2026-06-02T14:30:00Z"
    }
  }
  ```
- 免打扰模式下不推送通知，仅进入群聊时加载新消息

#### 5.2.5 群聊设置页

- **入口**：群聊页顶部右侧「⋯」菜单 → 「群设置」
- **内容**：
  - 群名称（仅群主可编辑）
  - 群公告（展示 + 编辑，仅群主）
  - 我在本群的昵称（可编辑，仅本群生效）
  - 消息免打扰开关
  - 清空聊天记录
  - 退出群聊（二次确认弹窗）

---

### 5.3 消息中心聚合页（Messages）

#### 5.3.1 页面布局

- 顶部两个 Tab：私信 / 群聊
- 每个 Tab 下列表展示：
  - 头像 + 名称 + 最后消息预览（截断 20 字）+ 时间
  - 未读红色角标
- 点击条目 → 进入对应聊天页
- 下拉刷新会话列表

#### 5.3.2 未读聚合

- 页面 Title 显示总未读数：`消息中心 (3) - 互助广场`
- Tab 标签上显示分类未读数角标
- 全局底部导航栏「消息」图标角标 = 私信未读 + 群聊未读（免打扰除外）

---

### 5.4 隐私安全设计（核心）

#### 5.4.1 信息最小化原则

- 私信聊天仅展示「楼栋号 + 昵称」，不显示手机号、真实姓名、门牌号
- 群聊仅展示「昵称 + 楼栋号」，群成员列表不展示手机号
- 举报附带的聊天记录自动脱敏（隐藏手机号、身份证号等敏感信息）
- 服务端不存储明文聊天内容超过 30 天（定期归档加密）

#### 5.4.2 交互安全

- 首次私信自动提示隐私规则
- 举报入口醒目但不可滥用（同一用户 10 分钟内仅可举报 1 次）
- 群聊白名单机制，非本楼栋用户无法通过任何方式入群
- 群主权限操作（移出、禁言）记录审计日志

#### 5.4.3 数据安全

- 聊天记录本地缓存采用 IndexedDB，用户可手动清空
- 语音消息文件存储使用带签名的临时 URL，有效期 1 小时
- 图片消息使用缩略图 + 原图分离存储，缩略图公开、原图鉴权访问
- WebSocket 连接使用 Token 鉴权，连接时校验用户身份

---

### 5.5 适老化适配（沟通场景专项）

#### 5.5.1 消息气泡

- 文字消息默认字号 18px（大字体模式 22px），行高 1.8
- 自己发送的气泡：蓝色背景 + 白色文字（对比度 ≥ 4.5:1）
- 对方发送的气泡：白色背景 + 深色文字（对比度 ≥ 7:1）
- 气泡最大宽度 75%，防止长文本阅读疲劳
- 气泡间距 12px（大字体模式 20px）

#### 5.5.2 输入区域

- 输入框最小高度 48px（大字体模式 56px）
- 语音录制按钮最小 56px × 56px（大字体模式 64px × 64px）
- 发送按钮最小 56px × 56px
- 所有按钮间距 ≥ 12px

#### 5.5.3 语音消息（老年人友好）

- 语音气泡显示大播放按钮 ▶️（≥ 44px）
- 播放时显示大进度条（≥ 6px 粗）
- 时长文字加粗显示
- 未播放的语音消息有红色圆点提醒
- 支持重复播放（老年人可能需要多次听）

#### 5.5.4 通知提醒

- 新消息标题闪烁（吸引注意但不侵扰）
- 未读消息红色圆点 ≥ 10px（正常）/ ≥ 14px（大字）
- 群公告使用黄色背景 + 大字号，确保第一眼可见
- 免打扰提示文案：灰色小字「已开启免打扰」，不制造焦虑

---

## 六、数据接口

### 6.1 私信接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/chat/conversations` | 获取会话列表（分页） |
| POST | `/api/chat/conversations` | 创建/获取会话（传入对方 userId） |
| GET | `/api/chat/conversations/:id/messages` | 获取历史消息（分页，每页 30 条） |
| POST | `/api/chat/conversations/:id/messages` | 发送消息（文字/图片/语音） |
| POST | `/api/chat/conversations/:id/read` | 标记已读 |
| DELETE | `/api/chat/conversations/:id` | 删除会话（本地+服务端标记） |
| POST | `/api/chat/demand-confirm` | 发送需求确认卡片 |
| GET | `/api/chat/poll` | 轮询增量消息（WebSocket 降级） |

### 6.2 群聊接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/group/list` | 获取我的群聊列表 |
| GET | `/api/group/:id/info` | 获取群信息（名称/公告/成员数） |
| GET | `/api/group/:id/messages` | 获取历史消息（分页，每页 30 条） |
| POST | `/api/group/:id/messages` | 发送群消息 |
| GET | `/api/group/:id/members` | 获取成员列表 |
| POST | `/api/group/:id/mute` | 消息免打扰开关（仅自己） |
| POST | `/api/group/:id/notice` | 编辑群公告（仅群主） |
| POST | `/api/group/:id/pin/:messageId` | 置顶消息（仅群主） |
| DELETE | `/api/group/:id/pin/:messageId` | 取消置顶（仅群主） |
| POST | `/api/group/:id/kick/:userId` | 移出成员（仅群主） |
| POST | `/api/group/:id/ban/:userId` | 禁言成员（仅群主） |
| POST | `/api/group/:id/leave` | 退出群聊 |

### 6.3 举报接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/report` | 提交举报（类型 + 描述 + 聊天记录快照） |

### 6.4 通用接口

| 方法 | 路径 | 说明 |
|------|------|------|
| WS | `/ws/chat` | WebSocket 实时消息推送 |
| POST | `/api/upload/image` | 图片上传（复用广场接口） |
| POST | `/api/voice/recognize` | 语音转文字（复用） |

### 6.5 核心数据结构

```typescript
// ==================== 私信 ====================

interface Conversation {
  id: string;
  peer: UserBrief;                   // 对方用户信息
  last_message: MessageBrief | null; // 最后一条消息
  unread_count: number;              // 未读数
  updated_at: string;                // 最后活跃时间
}

interface UserBrief {
  uid: string;          // 匿名标识
  nickname: string;     // 昵称
  avatar: string;       // 头像 URL
  building: string;     // 楼栋号（如"7号楼2单元"）
  role_tag?: string;    // 角色标签（hospital_contact / policy_contact）
}

interface Message {
  id: string;
  conversation_id: string;
  sender_uid: string;
  msg_type: 'text' | 'image' | 'voice' | 'demand_card';
  content: string;                   // 文字内容 / 图片URL / 语音URL
  extra?: Record<string, any>;       // 扩展字段（图片宽高、语音时长等）
  status: 'sending' | 'sent' | 'read' | 'failed';
  created_at: string;
}

interface MessageBrief {
  msg_type: string;
  content_preview: string;           // 截断 20 字
  created_at: string;
}

interface DemandCard {
  type: 'hospital' | 'policy';
  title: string;
  fields: DemandField[];
}

interface DemandField {
  key: string;
  label: string;
  type: 'date' | 'text' | 'checkbox' | 'phone';
  required: boolean;
  options?: string[];               // checkbox 选项
}

// ==================== 群聊 ====================

interface Group {
  id: string;
  name: string;                      // 如"7号楼2单元群"
  building: string;                  // 楼栋号
  unit: string;                      // 单元号
  avatar: string;                    // 群头像 URL
  notice: string;                    // 群公告
  member_count: number;
  owner_uid: string;                 // 群主 uid
  last_message: MessageBrief | null;
  unread_count: number;
  is_muted: boolean;                 // 是否免打扰
  updated_at: string;
}

interface GroupMember {
  uid: string;
  nickname: string;
  avatar: string;
  building: string;
  role: 'owner' | 'admin' | 'member';
  is_muted: boolean;                 // 是否被禁言
  mute_until?: string;               // 禁言截止时间
  joined_at: string;
}

interface GroupMessage {
  id: string;
  group_id: string;
  sender: UserBrief;
  msg_type: 'text' | 'image' | 'voice' | 'system';
  content: string;
  extra?: Record<string, any>;
  is_pinned: boolean;
  created_at: string;
}

// ==================== 举报 ====================

interface Report {
  target_type: 'user' | 'group' | 'message';
  target_id: string;
  report_type: 'fraud' | 'harassment' | 'ad' | 'other';
  description: string;
  evidence_snapshot?: string;        // 聊天记录截图（脱敏后）
}

// ==================== 列表响应 ====================

interface ConversationListResponse {
  list: Conversation[];
  total: number;
  page: number;
  page_size: number;
}

interface MessageListResponse {
  list: Message[];
  total: number;
  page: number;
  page_size: number;
}
```

---

## 七、适老化开发 Checklist

### 视觉

- [ ] 消息气泡字号 ≥ 18px（正常）/ ≥ 22px（大字）
- [ ] 气泡文字对比度 ≥ 4.5:1（正常）/ ≥ 7:1（大字）
- [ ] 语音播放按钮 ≥ 44px，进度条 ≥ 6px 粗
- [ ] 未读红点 ≥ 10px（正常）/ ≥ 14px（大字）
- [ ] 群公告黄色背景醒目可见
- [ ] 置顶消息 📌 图标 + 浅黄色背景突出

### 交互

- [ ] 所有可点击元素最小 44px × 44px（正常）/ 56px × 56px（大字）
- [ ] 语音录制按钮 ≥ 56px × 56px（正常）/ 64px × 64px（大字）
- [ ] 发送按钮 ≥ 56px × 56px
- [ ] 输入框最小高度 48px（正常）/ 56px（大字）
- [ ] 按钮间距 ≥ 12px
- [ ] 长按语音录制支持上滑取消（阈值 80px）
- [ ] 语音消息支持暂停/续播/重播

### 隐私

- [ ] 私信仅显示"楼栋号 + 昵称"，无手机号/真实姓名/门牌号
- [ ] 群聊成员列表无手机号
- [ ] 举报聊天记录自动脱敏
- [ ] 聊天记录本地缓存，用户可手动清空
- [ ] 删除操作二次确认弹窗
- [ ] 语音/图片使用签名的临时 URL

### 技术

- [ ] WebSocket 断线自动重连（指数退避）
- [ ] WebSocket 失败降级为轮询（5 秒间隔）
- [ ] IndexedDB 缓存聊天记录，离线可查看历史
- [ ] 语音录制最大 60 秒自动停止
- [ ] 图片发送前压缩至 ≤ 1MB
- [ ] 消息发送乐观插入 + 失败重试
- [ ] 进入聊天页自动标记已读
- [ ] 群聊白名单机制，非本楼栋无法入群

---

## 八、目录结构

```
src/
├── views/
│   └── chat/
│       ├── ChatList.vue                  # 私信会话列表
│       ├── ChatConversation.vue          # 一对一私信聊天页
│       ├── GroupList.vue                 # 群聊列表页
│       ├── GroupChat.vue                 # 楼栋群聊页
│       ├── Messages.vue                  # 消息中心聚合页
│       └── components/
│           ├── MessageTopNav.vue         # 消息模块顶部导航
│           ├── ConversationList.vue      # 会话列表
│           ├── ConversationItem.vue      # 单条会话条目
│           ├── MessageList.vue           # 消息列表（虚拟滚动容器）
│           ├── MessageBubble.vue         # 消息气泡容器
│           ├── TextBubble.vue            # 文字气泡
│           ├── ImageBubble.vue           # 图片气泡
│           ├── VoiceBubble.vue           # 语音气泡（播放控制）
│           ├── ChatInput.vue             # 底部输入栏
│           ├── ChatHeader.vue            # 私信顶部栏
│           ├── DemandConfirm.vue         # 需求确认快捷卡片
│           ├── ReportPanel.vue           # 举报面板
│           ├── GroupListContent.vue      # 群聊列表内容
│           ├── GroupItem.vue             # 单个群聊条目
│           ├── GroupHeader.vue           # 群聊顶部栏
│           ├── GroupNoticeBar.vue        # 群公告条
│           ├── GroupMemberDrawer.vue     # 群成员侧边栏
│           ├── GroupSettings.vue         # 群设置页
│           ├── PinnedMessage.vue         # 置顶消息
│           └── UnreadBadge.vue           # 未读角标（可复用）
├── stores/
│   ├── chat.js                           # 私信状态管理
│   └── group.js                          # 群聊状态管理
├── api/
│   ├── chat.js                           # 私信接口封装
│   ├── group.js                          # 群聊接口封装
│   └── report.js                         # 举报接口封装
├── composables/
│   ├── useWebSocket.js                   # WebSocket 连接管理（心跳/重连/降级）
│   ├── useMessages.js                    # 消息加载/发送/乐观更新
│   └── useVoicePlayback.js              # 语音消息播放控制（暂停/续播）
└── utils/
    ├── messageFormatter.js               # 消息时间格式化/内容截断
    └── voiceRecorder.js                  # 语音录制工具（长按/取消/超时）
```

---

## 九、开发排期

| 阶段 | 内容 | 预估工时 |
|------|------|----------|
| P0-1 | 路由 + ChatList/GroupList + MessageTopNav + ConversationItem + GroupItem | 1 天 |
| P0-2 | ChatConversation 私信页 + MessageBubble（文字/图片/语音） + ChatInput | 2 天 |
| P0-3 | WebSocket 连接管理（心跳/重连/降级轮询） + 消息实时推送 | 1.5 天 |
| P0-4 | 语音录制/播放组件（长按/取消/超时/暂停续播） | 1.5 天 |
| P0-5 | IndexedDB 聊天记录缓存 + 离线查看 + 删除管理 | 1 天 |
| P1-1 | GroupChat 群聊页 + GroupNoticeBar + PinnedMessage | 1.5 天 |
| P1-2 | GroupMemberDrawer + 群成员管理（移出/禁言/管理员） | 1 天 |
| P1-3 | GroupSettings 群设置页（免打扰/退群/昵称） | 1 天 |
| P1-4 | DemandConfirm 需求确认卡片 + ReportPanel 举报面板 | 1 天 |
| P1-5 | Messages 消息中心聚合页（双 Tab + 未读汇总） | 0.5 天 |
| P2-1 | 适老化细节联调（气泡字号/按钮大小/语音交互/红点） | 1 天 |
| P2-2 | 隐私安全走查（显示信息/脱敏/删除/URL 签名） | 1 天 |
| P2-3 | 浏览器兼容性测试（Chrome/Edge/Safari/Firefox + 微信内置浏览器） | 1 天 |
| P2-4 | 老年用户灰度测试（邀请 5-10 位 60+ 用户测试私信+群聊） | 1 天 |
| **合计** | | **~16 天** |

---

## 十、测试要点

### 私信功能测试

1. **发起私信**：从帖子详情/评论头像/搜索三种入口进入，验证隐私信息展示正确
2. **消息类型**：文字/图片/语音三种消息发送、接收、展示正常
3. **实时推送**：WebSocket 消息实时到达，断线重连后增量消息拉取完整
4. **降级方案**：关闭 WebSocket → 5 秒轮询正常，恢复 WebSocket → 切回推送
5. **图片消息**：压缩上传、发送中占位、点击全屏预览
6. **语音消息**：长按录制、上滑取消、播放/暂停/续播、60 秒超时
7. **未读提醒**：列表红点、总数角标、进入聊天自动已读、页面标题闪烁
8. **需求确认卡片**：触发条件、表单填写、发送/接收展示
9. **举报**：类型选择、聊天记录脱敏、提交成功反馈、10 分钟频率限制
10. **删除聊天**：二次确认、本地+服务端清除

### 群聊功能测试

11. **自动入群**：首次登录选择楼栋后自动匹配入群、入群欢迎语
12. **白名单**：非本楼栋用户无法搜索/加入群聊
13. **群公告**：群主编辑发布、新成员弹窗、展开/收起
14. **消息置顶**：群主置顶/取消置顶，最多 3 条，成员可取消自己的显示
15. **群成员管理**：移出/禁言/管理员设置、禁言用户发送提示
16. **免打扰**：开关持久化、开启后无推送无红点
17. **群设置**：群名称编辑、本群昵称、清空记录、退出群聊

### 适老化测试

18. **气泡字号**：大字模式下字号 + 行高达标
19. **对比度**：WCAG AA/AAA 检测通过
20. **点击区**：所有交互元素 ≥ 56px（大字模式）
21. **语音播放**：播放按钮大、进度条粗、支持重播
22. **未读红点**：大小醒目、颜色鲜艳

### 隐私安全测试

23. **信息展示**：私信/群聊不出现手机号、真实姓名、门牌号
24. **聊天脱敏**：举报附带的聊天记录手机号等已隐藏
25. **URL 鉴权**：语音/图片使用签名临时 URL，过期后不可访问
26. **本地缓存**：IndexedDB 数据可手动清空，删除后不可恢复
27. **白名单**：非本楼栋用户通过直接 URL/API 无法获取群信息

### 性能测试

28. **消息列表**：1000+ 条消息滚动流畅（虚拟滚动）
29. **WebSocket**：1000 并发连接不崩溃
30. **语音录制**：录音文件 ≤ 1MB（60 秒）
31. **图片压缩**：发送图片 ≤ 1MB

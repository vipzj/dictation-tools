# Dictation Tools v6 听写工具 v6

[![Vue](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js)](https://vuejs.org/)
[![Quasar](https://img.shields.io/badge/Quasar-2.16-1976d2?logo=quasar)](https://quasar.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A modern dictation and vocabulary learning application with spaced repetition support
>
> 现代化的听写与词汇学习应用，支持间隔重复记忆算法

---

[English](#english) | [中文](#中文)

---

<a name="english"></a>

## English

### Features

- **Vocabulary Management**
  - Organize vocabulary into units and tags
  - Support for both Chinese and English vocabulary
  - Custom audio recording for each word
  - Text-to-speech fallback for words without audio

- **Dictation Practice**
  - Audio-based dictation exercises
  - Customizable playback settings (play count, intervals)
  - Real-time accuracy tracking
  - Detailed dictation history and statistics

- **Spaced Repetition Review System**
  - Ebbinghaus forgetting curve algorithm
  - 8-level memory mastery system (0-7)
  - Adaptive difficulty adjustment
  - Priority scheduling based on memory strength
  - Track error count and success streak

- **Statistics & Analytics**
  - Comprehensive dashboard with learning metrics
  - Visual progress tracking
  - Session history and performance analysis
  - Memory level distribution charts

- **Cross-Platform**
  - Progressive Web App (PWA) support
  - Responsive design for desktop and mobile
  - Local data storage using IndexedDB

- **Internationalization**
  - English and Chinese language support
  - Easy to add new languages

### Tech Stack

- **Framework**: Vue 3 + Quasar Framework
- **Language**: TypeScript
- **State Management**: Pinia
- **Database**: Dexie (IndexedDB wrapper)
- **Internationalization**: Vue I18n
- **Routing**: Vue Router

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/dictation-tools-v6.git
cd dictation-tools-v6

# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
# Start development server with hot-reload
npm run dev
# or
quasar dev
```

### Build for Production

```bash
# Build the application
npm run build
# or
quasar build

# The built files will be in the dist/spa directory
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
dictation-tools-v6/
├── src/
│   ├── components/      # Reusable Vue components
│   ├── pages/          # Page-level components
│   ├── layouts/        # Layout components
│   ├── services/       # Business logic and API services
│   ├── stores/         # Pinia stores
│   ├── types/          # TypeScript type definitions
│   ├── i18n/           # Internationalization files
│   ├── router/         # Vue Router configuration
│   └── boot/           # Quasar boot files
├── public/             # Static assets
└── quasar.config.js    # Quasar configuration
```

### Memory Levels

The review system uses an 8-level memory mastery system based on the Ebbinghaus forgetting curve:

| Level | Name       | Review Interval | Description         |
| ----- | ---------- | --------------- | ------------------- |
| 0     | New        | -               | Not yet learned     |
| 1     | Learning   | 1 day           | First exposure      |
| 2     | Familiar   | 2 days          | Basic recognition   |
| 3     | Known      | 4 days          | Can recall          |
| 4     | Recognized | 7 days          | Good retention      |
| 5     | Mastered   | 15 days         | Strong memory       |
| 6     | Proficient | 30 days         | Excellent retention |
| 7     | Expert     | 30 days         | Fully mastered      |

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<a name="中文"></a>

## 中文

### 功能特性

- **词汇管理**
  - 按单元和标签组织词汇
  - 支持中文和英文词汇
  - 为每个单词录制自定义音频
  - 无音频词汇自动使用语音合成

- **听写练习**
  - 基于音频的听写练习
  - 可自定义播放设置（播放次数、间隔时间）
  - 实时准确率追踪
  - 详细的听写历史记录和统计

- **间隔重复复习系统**
  - 艾宾浩斯遗忘曲线算法
  - 8级记忆掌握体系（0-7级）
  - 自适应难度调整
  - 基于记忆强度的优先级调度
  - 追踪错误次数和连续成功次数

- **统计分析**
  - 综合仪表板显示学习指标
  - 可视化进度追踪
  - 会话历史和性能分析
  - 记忆等级分布图表

- **跨平台支持**
  - 渐进式 Web 应用 (PWA) 支持
  - 响应式设计，支持桌面和移动设备
  - 使用 IndexedDB 本地数据存储

- **国际化**
  - 支持英文和中文界面
  - 易于添加新语言

### 技术栈

- **框架**: Vue 3 + Quasar Framework
- **语言**: TypeScript
- **状态管理**: Pinia
- **数据库**: Dexie (IndexedDB 封装)
- **国际化**: Vue I18n
- **路由**: Vue Router

### 安装

```bash
# 克隆仓库
git clone https://github.com/vipzj/dictation-tools.git
cd dictation-tools

# 安装依赖
npm install
# 或
yarn install
```

### 开发

```bash
# 启动开发服务器（支持热重载）
npm run dev
# 或
quasar dev
```

### 生产构建

```bash
# 构建应用
npm run build
# 或
quasar build

# 构建产物将位于 dist/spa 目录
```

### 代码质量检查

```bash
# 代码检查
npm run lint

# 代码格式化
npm run format
```

### 项目结构

```
dictation-tools-v6/
├── src/
│   ├── components/      # 可复用的 Vue 组件
│   ├── pages/          # 页面级组件
│   ├── layouts/        # 布局组件
│   ├── services/       # 业务逻辑和 API 服务
│   ├── stores/         # Pinia 状态存储
│   ├── types/          # TypeScript 类型定义
│   ├── i18n/           # 国际化文件
│   ├── router/         # Vue Router 配置
│   └── boot/           # Quasar 启动文件
├── public/             # 静态资源
└── quasar.config.js    # Quasar 配置文件
```

### 记忆等级

复习系统采用基于艾宾浩斯遗忘曲线的 8 级记忆掌握体系：

| 等级 | 名称     | 复习间隔 | 描述     |
| ---- | -------- | -------- | -------- |
| 0    | 未掌握   | -        | 尚未学习 |
| 1    | 初识     | 1 天     | 初次接触 |
| 2    | 认识     | 2 天     | 基本识别 |
| 3    | 熟悉     | 4 天     | 能够回忆 |
| 4    | 掌握     | 7 天     | 记忆良好 |
| 5    | 熟练     | 15 天    | 记忆牢固 |
| 6    | 精通     | 30 天    | 保持优秀 |
| 7    | 完全掌握 | 30 天    | 完全掌握 |

### 贡献

欢迎贡献！请随时提交 Pull Request。

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

---

<div align="center">

**Made with ❤️ by [newone]**

**Star ⭐ this repo if it helped you!**

</div>

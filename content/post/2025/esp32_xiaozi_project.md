---
title: "ESP32 智能语音助手项目技术分析"
date: 2025-03-04
draft: false
categories:
  - "嵌入式开发"
  - "物联网"
  - "人工智能"
  - "语音交互"
description: "本文详细分析基于 ESP32 的智能语音助手项目，包括系统架构、核心功能实现、开发板支持等技术细节，为开发者提供完整的项目参考。"
keywords:
  - "ESP32"
  - "语音助手"
  - "物联网"
  - "语音识别"
  - "人工智能"
  - "嵌入式开发"
  - "AI 小智"
slug: "esp32-xiaozi-voice-assistant"
image: "https://img.ququ123.top/img/20250307121847669.png?imageView2/2/w/900/h/480"
---

# ESP32 智能语音助手项目分析

## 一、项目概述
这是一个基于 ESP32 的智能语音助手项目，支持多种开发板，具有语音交互、显示界面、网络连接等功能。项目采用 C++ 开发，使用 ESP-IDF 框架。

### 主要特点
- 支持 Wi-Fi / ML307 Cat.1 4G 网络连接
- 离线语音唤醒（基于 ESP-SR）
- 多语言语音识别（支持国语、粤语、英语、日语、韩语）
- 声纹识别功能
- 大模型对话（支持 Qwen、DeepSeek、Doubao 等）
- 流式语音对话（WebSocket/UDP）
- 可配置的提示词和音色
- 短期记忆与对话总结
- 支持多种显示方案（OLED/LCD）

### 支持的开发板
- 立创·实战派 ESP32-S3
- 乐鑫 ESP32-S3-BOX3
- M5Stack CoreS3
- AtomS3R + Echo Base
- 神奇按钮 2.4
- 微雪电子 ESP32-S3-Touch-AMOLED-1.8
- 更多开发板持续适配中...

## 二、系统架构

### 文件结构
```
main/
├── audio_codecs/          # 音频编解码器实现
├── led/                   # LED控制相关
├── display/              # 显示器驱动
├── protocols/            # 通信协议实现
├── iot/                 # IoT设备管理
├── boards/              # 不同开发板适配
│   ├── common/         # 通用板级支持
│   └── [board_name]/   # 特定开发板支持
├── assets/              # 资源文件
│   ├── en-US/          # 英文资源
│   └── zh-CN/          # 中文资源
├── application.h        # 应用程序核心类
├── application.cc       # 应用程序实现
└── main.cc             # 程序入口
```

### 开发板继承体系

```
Board (抽象基类)
├── CommonBoard
│   ├── LiChuangBoard
│   ├── BoxBoard
│   ├── CoreS3Board
│   ├── AtomBoard
│   │   ├── AtomS3RBoard
│   │   └── AtomMatrixBoard
│   └── ...
└── CustomBoard
```

## 三、运行流程

### 启动流程
1. 系统初始化
2. 硬件外设初始化
3. 网络连接
4. 进入主循环

```cpp
void Application::Start() {
    SetDeviceState(kDeviceStateStarting);
    auto display = board.GetDisplay();
    auto codec = board.GetAudioCodec();
    xTaskCreate(MainLoop);
    board.StartNetwork();
    protocol_->Start();
    CheckNewVersion();
    SetDeviceState(kDeviceStateIdle);
}
```

### 主循环流程
1. 等待系统事件
2. 处理音频输入
3. 处理音频输出
4. 执行调度任务

```cpp
void Application::MainLoop() {
    while (true) {
        // 等待事件
        auto bits = xEventGroupWaitBits(
            SCHEDULE_EVENT | 
            AUDIO_INPUT_READY_EVENT | 
            AUDIO_OUTPUT_READY_EVENT
        );
        
        // 处理各类事件
        if (bits & AUDIO_INPUT_READY_EVENT) {
            InputAudio();
        }
        if (bits & AUDIO_OUTPUT_READY_EVENT) {
            OutputAudio();
        }
        if (bits & SCHEDULE_EVENT) {
            ProcessScheduledTasks();
        }
    }
}
```

## 四、类继承体系


### 开发板抽象
```
Board (抽象基类)
├── CommonBoard (通用开发板基类)
│   ├── LiChuangBoard (立创实战派)
│   ├── BoxBoard (ESP32-S3-BOX3)
│   ├── CoreS3Board (M5Stack CoreS3)
│   ├── AtomBoard (Atom系列基类)
│   │   ├── AtomS3RBoard
│   │   └── AtomMatrixBoard
│   ├── MagicClickBoard (神奇按钮)
│   ├── WaveShareBoard (微雪系列)
│   └── LilyGoBoard (LilyGO系列)
└── CustomBoard (自定义开发板)
```

### 核心类关系
```
Application (系统核心，单例)
├── Board (开发板抽象)
├── Protocol (通信协议)
├── AudioCodec (音频处理)
├── Display (显示接口)
├── Led (LED控制)
└── Thing (IoT设备)
```

### 音频系统
```
AudioCodec (抽象基类)
├── NoAudioCodec
├── BoxAudioCodec 
├── ES8311AudioCodec
├── ES8388AudioCodec
└── CoreS3AudioCodec
```

### 显示系统
```
Display (抽象基类)
├── NoDisplay
├── LcdDisplay
│   ├── ST7789Display
│   ├── ST7735Display
│   ├── ILI9341Display
│   └── GC9A01Display
└── OledDisplay
    ├── SSD1306_128x32Display
    └── SSD1306_128x64Display
```

### 通信系统
```
Protocol (抽象基类)
├── WebsocketProtocol
└── MqttProtocol
```

### 按键系统
```
Button (抽象基类)
├── GpioButton (GPIO按键)
├── TouchButton (触摸按键)
└── MatrixButton (矩阵按键)
```

## 五、核心类方法

### Application 类
```cpp
class Application {
public:
    // 单例访问
    static Application& GetInstance();
    
    // 状态管理
    DeviceState GetDeviceState();
    void SetDeviceState(DeviceState state);
    
    // 核心功能
    void Start();
    void ToggleChatState();
    void StartListening();
    void StopListening();
    
private:
    // 内部处理
    void InputAudio();
    void OutputAudio();
    void ProcessScheduledTasks();
};
```

### Protocol 类
```cpp
class Protocol {
public:
    virtual bool Start() = 0;
    virtual bool OpenAudioChannel() = 0;
    virtual void CloseAudioChannel() = 0;
    virtual void SendAudio(const std::vector<uint8_t>& data) = 0;
    virtual void SendStartListening() = 0;
    virtual void SendStopListening() = 0;
    
protected:
    // 回调接口
    virtual void OnNetworkError() = 0;
    virtual void OnIncomingAudio() = 0;
    virtual void OnAudioChannelStateChanged() = 0;
};
```

### AudioCodec 类
```cpp
class AudioCodec {
public:
    virtual void Start() = 0;
    virtual void Stop() = 0;
    virtual void EnableInput(bool enable) = 0;
    virtual void EnableOutput(bool enable) = 0;
    virtual int input_sample_rate() const = 0;
    virtual int output_sample_rate() const = 0;
    
protected:
    // 音频处理
    virtual void ProcessInput() = 0;
    virtual void ProcessOutput() = 0;
};
```

## 六、使用指南

### 环境配置
1. **开发环境要求**
   - Cursor 或 VSCode
   - ESP-IDF 插件（SDK 5.3+）
   - 推荐使用 Linux 开发环境

2. **配置步骤**
```bash
# 配置项目
idf.py menuconfig

# 编译
idf.py build

# 烧录
idf.py flash
```

## 七、常见问题

### Q: 如何设定开发板？
A: 开发板设定流程如下：
- idf.py menuconfig 会更改sdkconfig （当然你也可以手动改其中的东西）
- sdkconfig会声明开发板name
- 在CMakeLists.txt中，会根据sdkconfig的BOARD_TYPE声明，选择对应的开发板的源文件加入到编译
- 在每个开发板的cc文件中都有宏定义 DECLARE_BOARD，这样编译期就把全局的create_board函数设置为对应board的初始化了
- 在main.cc中，调用Application::GetInstance().Start()，会调用Board::GetInstance()，就是调用create_board函数

### Q: 如何添加新开发板？
A: 请参考：https://www.ququ123.top/2025/03/esp32-add-new-board-support/
import React from 'react';
import { Button } from '@/components/aily/Button';
import { Card } from '@/components/aily/Card';

const features = [
  {
    title: '精力来源',
    subtitle: '外向(E) vs 内向(I)',
    description: '了解你获取能量的方式，是倾向于外部世界还是内心世界',
  },
  {
    title: '认知方式',
    subtitle: '实感(S) vs 直觉(N)',
    description: '发现你如何接收和处理信息，是注重现实细节还是整体可能性',
  },
  {
    title: '判断方式',
    subtitle: '思考(T) vs 情感(F)',
    description: '探索你如何做决定，是基于逻辑分析还是个人价值观',
  },
  {
    title: '生活方式',
    subtitle: '判断(J) vs 知觉(P)',
    description: '了解你如何应对外部世界，是偏好计划有序还是灵活适应',
  },
];

export default function HomePage() {
  const startTest = () => {
    alert('测试功能即将上线，敬请期待！');
  };

  return (
    <div>
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          发现你的MBTI人格类型
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          基于荣格心理学理论，探索你的性格特点、优势与发展方向
        </p>
        <div className="mt-8">
          <Button size="lg" className="text-lg" onClick={startTest}>
            开始测试
          </Button>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          MBTI的四个维度
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="h-full">
              <div className="p-6">
                <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 mt-1">
                  {feature.subtitle}
                </p>
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-16 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            为什么了解你的MBTI类型很重要？
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            MBTI人格类型理论帮助你更好地理解自己的行为模式、决策方式和沟通风格。
            通过了解自己的人格类型，你可以：
          </p>
          <ul className="mt-4 space-y-2 text-left max-w-xl mx-auto">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>提高自我认知和个人成长</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>改善人际关系和沟通效果</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>找到更适合的职业发展方向</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>理解并欣赏他人的差异</span>
            </li>
          </ul>
          <div className="mt-8">
            <Button variant="secondary">了解更多</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
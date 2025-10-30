import React from 'react';
import { Card } from '@/components/aily/Card';

const dimensions = [
  {
    dimension: '精力来源',
    types: [
      {
        name: '外向 (E)',
        description: '倾向于从外部世界获取能量，喜欢与人互动，思维和行动较为外显',
        characteristics: ['喜欢社交活动', '表达想法前会说出来', '通过交流获得能量']
      },
      {
        name: '内向 (I)',
        description: '倾向于从内心世界获取能量，喜欢独处或小团体，思维和行动较为内敛',
        characteristics: ['享受独处时光', '先思考后表达', '在安静环境中恢复能量']
      }
    ]
  },
  {
    dimension: '认知方式',
    types: [
      {
        name: '实感 (S)',
        description: '关注现实和具体信息，注重实际经验和细节',
        characteristics: ['关注当下现实', '注重细节和事实', '喜欢具体明确的指示']
      },
      {
        name: '直觉 (N)',
        description: '关注可能性和整体图景，注重抽象概念和未来展望',
        characteristics: ['关注未来可能性', '注重整体和模式', '喜欢创新和概念']
      }
    ]
  },
  {
    dimension: '判断方式',
    types: [
      {
        name: '思考 (T)',
        description: '基于逻辑和客观分析做决定，注重公平和原则',
        characteristics: ['重视逻辑和客观性', '分析利弊做决定', '注重公平公正']
      },
      {
        name: '情感 (F)',
        description: '基于个人价值观和他人感受做决定，注重和谐和同理心',
        characteristics: ['重视人际关系和谐', '考虑他人感受', '基于价值观做决定']
      }
    ]
  },
  {
    dimension: '生活方式',
    types: [
      {
        name: '判断 (J)',
        description: '偏好有计划、有组织的生活方式，喜欢做决定和完成事项',
        characteristics: ['喜欢计划和组织', '做决定后不易改变', '重视截止日期']
      },
      {
        name: '知觉 (P)',
        description: '偏好灵活、自发的生活方式，喜欢保持开放性和适应性',
        characteristics: ['喜欢灵活应变', '保持选项开放性', '享受过程多于结果']
      }
    ]
  }
];

export default function KnowledgeBasePage() {
  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          MBTI理论基础
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          MBTI（迈尔斯-布里格斯类型指标）是一种人格分类理论，由凯瑟琳·布里格斯和她的女儿伊莎贝尔·布里格斯·迈尔斯基于荣格的心理学类型理论发展而来。
        </p>
      </div>

      <Card className="mb-12">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            理论起源
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            MBTI理论源于瑞士心理学家卡尔·荣格(Carl Jung)在1921年出版的《心理类型》一书。荣格提出人类在感知世界和做出判断时存在根本差异，这些差异形成了个体独特的人格类型。
          </p>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            在20世纪40年代，凯瑟琳·布里格斯和伊莎贝尔·布里格斯·迈尔斯母女基于荣格的理论开发了MBTI测评工具，将人格分为16种不同的类型，每种类型由四个字母组成。
          </p>
        </div>
      </Card>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        人格的四个维度
      </h2>
      
      <div className="space-y-10">
        {dimensions.map((section, index) => (
          <div key={index}>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {section.dimension}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.types.map((type, typeIndex) => (
                <Card key={typeIndex}>
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {type.name}
                      </h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {type.description}
                    </p>
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        典型特征：
                      </h5>
                      <ul className="space-y-1">
                        {type.characteristics.map((char, charIndex) => (
                          <li key={charIndex} className="flex">
                            <span className="text-blue-500 mr-2">•</span>
                            <span className="text-gray-600 dark:text-gray-300">{char}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gray-50 dark:bg-gray-800 rounded-xl p-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          16种人格类型
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          四个维度的不同组合形成了16种不同的人格类型，每种类型都有其独特的特征和行为模式：
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 
            'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'].map((type) => (
            <div 
              key={type} 
              className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center shadow-sm border border-gray-200 dark:border-gray-600"
            >
              <div className="text-lg font-medium text-blue-600 dark:text-blue-400">
                {type}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
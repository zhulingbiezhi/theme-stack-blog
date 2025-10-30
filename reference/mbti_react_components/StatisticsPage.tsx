import React from 'react';
import { BarChart } from '@/components/aily/BarChart';
import { Card } from '@/components/aily/Card';
import { ProgressCircle } from '@/components/aily/ProgressCircle';

// 模拟数据
const dimensionData = [
  { name: '外向(E)', value: 65 },
  { name: '内向(I)', value: 35 },
  { name: '实感(S)', value: 42 },
  { name: '直觉(N)', value: 58 },
  { name: '思考(T)', value: 38 },
  { name: '情感(F)', value: 62 },
  { name: '判断(J)', value: 47 },
  { name: '知觉(P)', value: 53 },
];

const typeDistribution = [
  { name: 'INFJ', value: 12 },
  { name: 'ENFP', value: 18 },
  { name: 'INTP', value: 9 },
  { name: 'ISTJ', value: 14 },
  { name: 'ESFJ', value: 11 },
  { name: 'ENTJ', value: 8 },
  { name: 'ISFP', value: 7 },
  { name: 'ESTP', value: 6 },
  { name: '其他', value: 15 },
];

const userStats = [
  { name: '已完成测试', value: 12432 },
  { name: '平均完成时间', value: '12分钟' },
  { name: '最常见类型', value: 'ENFP' },
  { name: '最罕见类型', value: 'INFJ' },
];

export default function StatisticsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        测试数据分析
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {userStats.map((stat, index) => (
          <Card key={index} className="flex flex-col items-center justify-center p-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-gray-600 dark:text-gray-300 mt-2 text-center">
              {stat.name}
            </div>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              各维度分布比例
            </h2>
            <div className="h-80">
              <BarChart
                data={dimensionData}
                index="name"
                categories={['value']}
                colors={['blue']}
                showLegend={false}
                showXAxis={true}
                showYAxis={true}
                yAxisWidth={50}
              />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              人格类型分布
            </h2>
            <div className="h-80">
              <BarChart
                data={typeDistribution}
                index="name"
                categories={['value']}
                colors={['violet']}
                showLegend={false}
                showXAxis={true}
                showYAxis={true}
                yAxisWidth={50}
              />
            </div>
          </div>
        </Card>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 mb-10">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          各人格类型占比
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-6">
          {typeDistribution.map((type, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="mb-2">
                <ProgressCircle value={type.value} size="md" />
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {type.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {type.value}%
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            用户特征分析
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                最常见的职业领域
              </h3>
              <ul className="space-y-2">
                {['教育/咨询', '创意行业', '技术开发', '医疗健康', '商业管理'].map((item, index) => (
                  <li key={index} className="flex">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-600 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                最常报告的优势
              </h3>
              <ul className="space-y-2">
                {['共情能力', '创造力', '逻辑分析', '执行力', '适应性'].map((item, index) => (
                  <li key={index} className="flex">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-600 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
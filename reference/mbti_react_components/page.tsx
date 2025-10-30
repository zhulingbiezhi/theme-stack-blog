'use client';
import React, { useState } from 'react';
import { TabNavigation, TabNavigationLink } from '@/components/aily/TabNavigation';
import HomePage from '@/components/HomePage';
import KnowledgeBasePage from '@/components/KnowledgeBasePage';
import StatisticsPage from '@/components/StatisticsPage';

export default function MBTIPage() {
  const [activeTab, setActiveTab] = useState('home');
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold">
                M
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                MBTI人格测试
              </h1>
            </div>
            <TabNavigation>
              <TabNavigationLink 
                active={activeTab === 'home'}
                onClick={() => setActiveTab('home')}
              >
                首页
              </TabNavigationLink>
              <TabNavigationLink 
                active={activeTab === 'knowledge'}
                onClick={() => setActiveTab('knowledge')}
              >
                知识库
              </TabNavigationLink>
              <TabNavigationLink 
                active={activeTab === 'statistics'}
                onClick={() => setActiveTab('statistics')}
              >
                统计
              </TabNavigationLink>
            </TabNavigation>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'knowledge' && <KnowledgeBasePage />}
        {activeTab === 'statistics' && <StatisticsPage />}
      </main>
      
      <footer className="bg-white dark:bg-gray-800 mt-12 py-6 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400">
          <p>© 2023 MBTI人格测试 | 基于荣格心理学理论</p>
        </div>
      </footer>
    </div>
  );
}
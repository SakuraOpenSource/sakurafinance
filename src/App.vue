<script setup>
import { Money, TrendCharts, Wallet } from '@element-plus/icons-vue'
</script>

<template>
  <el-config-provider>
    <main class="page-shell">
      <section class="hero-card">
        <div>
          <p class="eyebrow">SakuraFinance</p>
          <h1>Vue.js + Vite + Element Plus 环境已就绪</h1>
          <p class="description">
            一个轻量、简洁、易用的云计算财务管理系统前端起点。
          </p>
          <div class="actions">
            <el-button type="primary" size="large">开始使用</el-button>
            <el-button size="large">查看文档</el-button>
          </div>
        </div>

        <el-card class="status-card" shadow="hover">
          <template #header>
            <div class="status-header">
              <el-icon><TrendCharts /></el-icon>
              <span>运行状态</span>
            </div>
          </template>
          <el-space direction="vertical" alignment="stretch" fill>
            <el-tag type="success" size="large">Vite Dev Server Ready</el-tag>
            <el-tag type="primary" size="large">Element Plus Loaded</el-tag>
            <el-tag type="warning" size="large">pnpm Workspace Ready</el-tag>
          </el-space>
        </el-card>
      </section>

      <section class="feature-grid">
        <el-card shadow="never">
          <el-icon class="feature-icon"><Money /></el-icon>
          <h2>成本管理</h2>
          <p>快速构建云资源费用、账单、预算等业务页面。</p>
        </el-card>
        <el-card shadow="never">
          <el-icon class="feature-icon"><Wallet /></el-icon>
          <h2>财务看板</h2>
          <p>基于 Element Plus 组件库搭建清晰直观的管理界面。</p>
        </el-card>
        <el-card shadow="never">
          <el-icon class="feature-icon"><TrendCharts /></el-icon>
          <h2>趋势分析</h2>
          <p>使用 Vite 获得快速启动、热更新和现代化构建体验。</p>
        </el-card>
      </section>
    </main>
  </el-config-provider>
</template>

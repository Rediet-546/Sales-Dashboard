/// <reference types="node" />

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================================
// COMPLETE SEED DATA FOR ALL DASHBOARD FEATURES
// ============================================================

const seedData = {
  // ===== USERS =====
  users: [
    {
      email: 'admin@dashboard.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
    },
    {
      email: 'demo@example.com',
      password: 'password123',
      name: 'Demo User',
      role: 'user',
    },
    {
      email: 'john@example.com',
      password: 'john123',
      name: 'John Doe',
      role: 'user',
    },
    {
      email: 'jane@example.com',
      password: 'jane123',
      name: 'Jane Smith',
      role: 'user',
    },
  ],

  // ===== METRICS DATA (For Dashboard Page) =====
  metrics: {
    revenue: [
      { name: 'Monthly Revenue', value: 45230.00, unit: '$', category: 'revenue' },
      { name: 'Annual Revenue', value: 542760.00, unit: '$', category: 'revenue' },
      { name: 'Revenue Growth', value: 12.5, unit: '%', category: 'revenue' },
      { name: 'Average Order Value', value: 147.32, unit: '$', category: 'revenue' },
      { name: 'Customer Lifetime Value', value: 1240.50, unit: '$', category: 'revenue' },
    ],
    users: [
      { name: 'Active Users', value: 1247, unit: '', category: 'users' },
      { name: 'New Signups', value: 89, unit: '', category: 'users' },
      { name: 'Website Traffic', value: 4523, unit: '', category: 'users' },
      { name: 'Social Media Engagement', value: 2345, unit: '', category: 'users' },
      { name: 'Mobile Users', value: 678, unit: '', category: 'users' },
    ],
    performance: [
      { name: 'Conversion Rate', value: 3.87, unit: '%', category: 'performance' },
      { name: 'Customer Satisfaction', value: 4.8, unit: '/5', category: 'performance' },
      { name: 'Email Open Rate', value: 28.5, unit: '%', category: 'performance' },
      { name: 'Bounce Rate', value: 15.2, unit: '%', category: 'performance' },
      { name: 'Page Load Time', value: 1.8, unit: 's', category: 'performance' },
    ],
    sales: [
      { name: 'Q1 Sales', value: 125000, unit: '$', category: 'sales' },
      { name: 'Q2 Sales', value: 145000, unit: '$', category: 'sales' },
      { name: 'Q3 Sales', value: 162000, unit: '$', category: 'sales' },
      { name: 'Q4 Sales', value: 189000, unit: '$', category: 'sales' },
      { name: 'Year-over-Year Growth', value: 18.5, unit: '%', category: 'sales' },
    ],
    marketing: [
      { name: 'Campaign ROI', value: 245, unit: '%', category: 'marketing' },
      { name: 'Cost Per Acquisition', value: 45.50, unit: '$', category: 'marketing' },
      { name: 'Lead Conversion', value: 234, unit: '', category: 'marketing' },
      { name: 'Marketing Spend', value: 12500, unit: '$', category: 'marketing' },
      { name: 'Channel Performance', value: 8.5, unit: '/10', category: 'marketing' },
    ],
  },

  // ===== ALERTS DATA (For Alerts Page) =====
  alerts: [
    { name: 'Revenue Threshold Alert', condition: 'greater_than', threshold: 50000 },
    { name: 'User Growth Alert', condition: 'greater_than', threshold: 1000 },
    { name: 'Performance Alert', condition: 'less_than', threshold: 2.0 },
    { name: 'Sales Target Alert', condition: 'greater_than', threshold: 150000 },
    { name: 'Marketing Campaign Alert', condition: 'greater_than', threshold: 200 },
    { name: 'Conversion Rate Alert', condition: 'less_than', threshold: 3.0 },
    { name: 'Customer Satisfaction Alert', condition: 'less_than', threshold: 4.0 },
    { name: 'Revenue Drop Alert', condition: 'less_than', threshold: 40000 },
  ],

  // ===== REPORTS DATA (For Reports Page) =====
  reports: [
    { name: 'Monthly Performance Report', type: 'summary' },
    { name: 'Revenue Analytics Report', type: 'analytics' },
    { name: 'Quarterly Forecast Report', type: 'forecast' },
    { name: 'Detailed Metrics Report', type: 'detailed' },
    { name: 'Marketing Effectiveness Report', type: 'analytics' },
    { name: 'Sales Pipeline Report', type: 'forecast' },
  ],

  // ===== REPORT INSIGHTS (For Reports Page) =====
  reportInsights: [
    'Revenue increased by 15% this month',
    'User engagement is up 8%',
    'Conversion rate improved by 2.5%',
    'Customer satisfaction at all-time high',
    'Marketing ROI increased by 12%',
    'Sales pipeline is strong this quarter',
    'Operational efficiency improved by 5%',
    'New user acquisition up 20%',
    'Average order value increased by 10%',
    'Customer retention rate at 85%',
    'Social media engagement doubled',
    'Email open rate hit record high',
    'Page load time improved by 30%',
    'Bounce rate decreased by 15%',
    'Mobile users now 45% of total traffic',
  ],

  // ===== NLP QUERY DATA (For NLP Page) =====
  nlpQueries: [
    {
      query: 'Show me revenue trends for last month',
      response: 'Revenue increased by 12.5% last month, reaching $45,230. The growth was driven by a 15% increase in average order value and a 8% increase in new customers.',
      confidence: 0.92,
    },
    {
      query: 'What are our top performing metrics?',
      response: 'Your top performing metrics are: Annual Revenue ($542,760), Active Users (1,247), and Conversion Rate (3.87%). Customer Satisfaction is also performing well at 4.8/5.',
      confidence: 0.88,
    },
    {
      query: 'Analyze user growth',
      response: 'User growth has been steady at 8.2% month-over-month. Active users now stand at 1,247, with 89 new signups this month. Social media engagement is up 12%, and mobile users represent 54% of all traffic.',
      confidence: 0.85,
    },
    {
      query: 'What is our current revenue?',
      response: 'Current total revenue is $542,760 annually. Monthly revenue is $45,230 with an average order value of $147.32. Customer lifetime value is $1,240.50.',
      confidence: 0.95,
    },
  ],

  // ===== WHAT-IF ANALYSIS DATA (For What-If Page) =====
  whatIfScenarios: [
    {
      name: 'Optimistic Growth',
      description: 'Best case scenario - 20% growth across all metrics',
      change: 20,
      impact: 'positive',
      confidence: 0.75,
    },
    {
      name: 'Moderate Growth',
      description: 'Most likely scenario - 10% growth',
      change: 10,
      impact: 'positive',
      confidence: 0.85,
    },
    {
      name: 'Pessimistic Scenario',
      description: 'Worst case - 10% decline',
      change: -10,
      impact: 'negative',
      confidence: 0.70,
    },
    {
      name: 'Aggressive Marketing',
      description: 'Increase marketing spend by 50%',
      change: 15,
      impact: 'positive',
      confidence: 0.65,
    },
    {
      name: 'Cost Optimization',
      description: 'Reduce costs by 15% while maintaining growth',
      change: 5,
      impact: 'positive',
      confidence: 0.80,
    },
  ],

  // ===== ANALYTICS DATA (For Analytics Page) =====
  analytics: {
    categories: ['revenue', 'users', 'performance', 'sales', 'marketing'],
    timeframes: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    metrics: ['total', 'average', 'growth', 'conversion', 'engagement'],
    sampleTrends: [
      { period: 'Week 1', value: 32000 },
      { period: 'Week 2', value: 34000 },
      { period: 'Week 3', value: 38000 },
      { period: 'Week 4', value: 42000 },
      { period: 'Week 5', value: 45230 },
    ],
  },

  // ===== DASHBOARD NAMES =====
  dashboardNames: [
    'Sales Dashboard',
    'Marketing Dashboard',
    'Executive Dashboard',
    'Operations Dashboard',
    'Analytics Dashboard',
  ],

  // ===== ALERT CONDITIONS =====
  alertConditions: ['greater_than', 'less_than', 'equal_to'],

  // ===== REPORT TYPES =====
  reportTypes: ['summary', 'analytics', 'forecast', 'detailed'],
};

// ============================================================
// SEEDING FUNCTIONS
// ============================================================

async function seedUsers() {
  console.log('📝 Seeding users...');
  const createdUsers = [];

  for (const userData of seedData.users) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!existing) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await prisma.user.create({
        data: { ...userData, password: hashedPassword },
      });
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.email} (${user.role})`);
    } else {
      createdUsers.push(existing);
      console.log(`⚠️ User ${userData.email} already exists`);
    }
  }

  return createdUsers;
}

async function seedDashboards(users: any[]) {
  console.log('📊 Seeding dashboards...');
  const createdDashboards = [];

  for (let i = 0; i < seedData.dashboardNames.length; i++) {
    const user = users[i % users.length];
    const existing = await prisma.dashboard.findFirst({
      where: { name: seedData.dashboardNames[i], userId: user.id },
    });

    if (!existing) {
      const dashboard = await prisma.dashboard.create({
        data: {
          name: seedData.dashboardNames[i],
          description: `Dashboard for ${seedData.dashboardNames[i].toLowerCase()}`,
          userId: user.id,
        },
      });
      createdDashboards.push(dashboard);
      console.log(`✅ Created dashboard: ${dashboard.name}`);
    } else {
      createdDashboards.push(existing);
      console.log(`⚠️ Dashboard ${seedData.dashboardNames[i]} already exists`);
    }
  }

  return createdDashboards;
}

// ===== SEED METRICS (For Dashboard Page) =====
async function seedMetrics(dashboards: any[]) {
  console.log('📈 Seeding metrics...');

  let metricCount = 0;
  const allMetrics = Object.values(seedData.metrics).flat();

  for (const dashboard of dashboards) {
    const shuffled = [...allMetrics].sort(() => Math.random() - 0.5);
    const metricsToAdd = shuffled.slice(0, 8 + Math.floor(Math.random() * 7));

    for (const metricData of metricsToAdd) {
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const randomValue = metricData.value * (0.7 + Math.random() * 0.6);
      const adjustedValue = Math.round(randomValue * 100) / 100;

      const existing = await prisma.metric.findFirst({
        where: {
          name: metricData.name,
          dashboardId: dashboard.id,
        },
      });

      if (!existing) {
        await prisma.metric.create({
          data: {
            ...metricData,
            value: adjustedValue,
            dashboardId: dashboard.id,
            userId: dashboard.userId,
            date: new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000),
          },
        });
        metricCount++;
      }
    }
  }

  console.log(`✅ Created ${metricCount} new metrics`);
  return metricCount;
}

// ===== SEED ALERTS (For Alerts Page) =====
async function seedAlerts(users: any[]) {
  console.log('🔔 Seeding alerts...');

  let alertCount = 0;
  const metrics = await prisma.metric.findMany({ take: 20 });

  for (let i = 0; i < seedData.alerts.length; i++) {
    const alertData = seedData.alerts[i];
    const metric = metrics[i % metrics.length];
    if (!metric) continue;

    const existing = await prisma.alert.findFirst({
      where: { name: alertData.name, metricId: metric.id },
    });

    if (!existing) {
      await prisma.alert.create({
        data: {
          ...alertData,
          threshold: metric.value * (0.5 + Math.random() * 0.5),
          status: ['active', 'active', 'active', 'inactive'][i % 4],
          metricId: metric.id,
          userId: metric.userId,
        },
      });
      alertCount++;
    }
  }

  console.log(`✅ Created ${alertCount} new alerts`);
  return alertCount;
}

// ===== SEED REPORTS (For Reports Page) =====
async function seedReports(users: any[], dashboards: any[]) {
  console.log('📄 Seeding reports...');

  let reportCount = 0;

  for (let i = 0; i < seedData.reports.length; i++) {
    const reportData = seedData.reports[i];
    const user = users[i % users.length];
    const dashboard = dashboards[i % dashboards.length];
    const reportMetrics = await prisma.metric.findMany({
      where: { dashboardId: dashboard.id },
      take: 5,
    });

    const existing = await prisma.report.findFirst({
      where: { name: reportData.name, userId: user.id },
    });

    if (!existing) {
      const shuffledInsights = [...seedData.reportInsights]
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);

      await prisma.report.create({
        data: {
          name: reportData.name,
          description: `Generated ${reportData.type} report for ${dashboard.name}`,
          type: reportData.type,
          data: {
            dashboard: dashboard.name,
            metrics: reportMetrics,
            generated: new Date().toISOString(),
            summary: `This is a ${reportData.type} report for ${dashboard.name}`,
            insights: shuffledInsights,
          },
          userId: user.id,
        },
      });
      reportCount++;
    }
  }

  console.log(`✅ Created ${reportCount} new reports`);
  return reportCount;
}

// ===== SEED NLP QUERIES (For NLP Page) =====
async function seedNLPQueries(users: any[]) {
  console.log('🧠 Seeding NLP queries...');

  let nlpCount = 0;
  for (const nlpData of seedData.nlpQueries) {
    const user = users[nlpCount % users.length];

    const existing = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "NLPQuery" 
      WHERE query = ${nlpData.query} AND "userId" = ${user.id}
    `;

    if (!existing || Number((existing as any)[0]?.count) === 0) {
      await prisma.$executeRaw`
        INSERT INTO "NLPQuery" (id, query, response, confidence, "userId", "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(), 
          ${nlpData.query}, 
          ${nlpData.response}, 
          ${nlpData.confidence}, 
          ${user.id}, 
          NOW(), 
          NOW()
        )
      `;
      nlpCount++;
      console.log(`✅ Created NLP query: ${nlpData.query.substring(0, 30)}...`);
    }
  }

  return nlpCount;
}

// ===== SEED WHAT-IF SCENARIOS (For What-If Page) =====
async function seedWhatIfScenarios(users: any[]) {
  console.log('📊 Seeding What-If scenarios...');

  let scenarioCount = 0;
  for (const scenarioData of seedData.whatIfScenarios) {
    const user = users[scenarioCount % users.length];

    const existing = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "WhatIfScenario" 
      WHERE name = ${scenarioData.name} AND "userId" = ${user.id}
    `;

    if (!existing || Number((existing as any)[0]?.count) === 0) {
      await prisma.$executeRaw`
        INSERT INTO "WhatIfScenario" (id, name, description, change, impact, confidence, "userId", "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(), 
          ${scenarioData.name}, 
          ${scenarioData.description}, 
          ${scenarioData.change}, 
          ${scenarioData.impact}, 
          ${scenarioData.confidence}, 
          ${user.id}, 
          NOW(), 
          NOW()
        )
      `;
      scenarioCount++;
      console.log(`✅ Created What-If scenario: ${scenarioData.name}`);
    }
  }

  return scenarioCount;
}

// ============================================================
// MAIN SEED FUNCTION
// ============================================================

async function main() {
  console.log('🌱 Starting database seeding...\n');
  console.log('===========================================');
  console.log('  SEEDING ALL DASHBOARD DATA');
  console.log('===========================================\n');

  try {
    // 1. Seed Users
    const users = await seedUsers();

    // 2. Seed Dashboards
    const dashboards = await seedDashboards(users);

    // 3. Seed Metrics (Dashboard Page)
    const metricCount = await seedMetrics(dashboards);

    // 4. Seed Alerts (Alerts Page)
    const alertCount = await seedAlerts(users);

    // 5. Seed Reports (Reports Page)
    const reportCount = await seedReports(users, dashboards);

    // 6. Seed NLP Queries (NLP Page)
    const nlpCount = await seedNLPQueries(users);

    // 7. Seed What-If Scenarios (What-If Page)
    const scenarioCount = await seedWhatIfScenarios(users);

    // 8. Summary
    console.log('\n===========================================');
    console.log('🎉 DATABASE SEEDING COMPLETED!');
    console.log('===========================================');
    console.log('\n📊 SEED SUMMARY:');
    console.log(`   👤 Users: ${users.length}`);
    console.log(`   📊 Dashboards: ${dashboards.length}`);
    console.log(`   📈 Metrics: ${metricCount}`);
    console.log(`   🔔 Alerts: ${alertCount}`);
    console.log(`   📄 Reports: ${reportCount}`);
    console.log(`   🧠 NLP Queries: ${nlpCount}`);
    console.log(`   📊 What-If Scenarios: ${scenarioCount}`);

    console.log('\n📋 TEST CREDENTIALS:');
    console.log('-------------------');
    console.log('Admin: admin@dashboard.com / admin123');
    console.log('Demo: demo@example.com / password123');
    console.log('User: john@example.com / john123');
    console.log('User: jane@example.com / jane123');

    console.log('\n📌 DASHBOARD ROUTES WITH DATA:');
    console.log('   ✅ /dashboard - Metrics seeded');
    console.log('   ✅ /dashboard/alerts - Alerts seeded');
    console.log('   ✅ /dashboard/reports - Reports seeded');
    console.log('   ✅ /dashboard/analytics - Analytics seeded');
    console.log('   ✅ /dashboard/nlp - NLP queries seeded');
    console.log('   ✅ /dashboard/what-if - What-If scenarios seeded');
    console.log('   ✅ /dashboard/settings - Ready for use');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// ============================================================
// RUN SEEDER
// ============================================================

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
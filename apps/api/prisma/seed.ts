/// <reference types="node" />

import { PrismaClient, Role, SaleStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateSKU(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'PRD-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
}

// ============================================================
// SEED DATA
// ============================================================

const USERS = [
  {
    email: 'superadmin@dashboard.com',
    password: 'superadmin123',
    name: 'Super Admin',
    role: 'SUPER_ADMIN' as Role,
    team: 'Executive',
    department: 'Management',
    isActive: true,
  },
  {
    email: 'admin@dashboard.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'ADMIN' as Role,
    team: 'Executive',
    department: 'Management',
    isActive: true,
  },
  {
    email: 'manager1@dashboard.com',
    password: 'manager123',
    name: 'Sarah Johnson',
    role: 'MANAGER' as Role,
    team: 'Sales Team A',
    department: 'Sales',
    isActive: true,
  },
  {
    email: 'manager2@dashboard.com',
    password: 'manager123',
    name: 'Mike Chen',
    role: 'MANAGER' as Role,
    team: 'Sales Team B',
    department: 'Sales',
    isActive: true,
  },
  {
    email: 'john@example.com',
    password: 'john123',
    name: 'John Doe',
    role: 'USER' as Role,
    team: 'Sales Team A',
    department: 'Sales',
    isActive: true,
  },
  {
    email: 'jane@example.com',
    password: 'jane123',
    name: 'Jane Smith',
    role: 'USER' as Role,
    team: 'Sales Team A',
    department: 'Sales',
    isActive: true,
  },
  {
    email: 'mike@example.com',
    password: 'mike123',
    name: 'Mike Johnson',
    role: 'USER' as Role,
    team: 'Sales Team B',
    department: 'Sales',
    isActive: true,
  },
  {
    email: 'sarah@example.com',
    password: 'sarah123',
    name: 'Sarah Wilson',
    role: 'VIEWER' as Role,
    team: 'Marketing',
    department: 'Marketing',
    isActive: true,
  },
  {
    email: 'chris@example.com',
    password: 'chris123',
    name: 'Chris Brown',
    role: 'USER' as Role,
    team: 'Sales Team B',
    department: 'Sales',
    isActive: true,
  },
  {
    email: 'lisa@example.com',
    password: 'lisa123',
    name: 'Lisa Taylor',
    role: 'USER' as Role,
    team: 'Sales Team B',
    department: 'Sales',
    isActive: true,
  },
];

const PRODUCTS = [
  {
    name: 'Enterprise License',
    description: 'Full enterprise license with all features',
    price: 12500.00,
    cost: 8500.00,
    category: 'Software',
    stock: 50,
    minStock: 10,
    unit: 'license',
  },
  {
    name: 'Pro Plan',
    description: 'Professional plan for growing teams',
    price: 8500.00,
    cost: 5500.00,
    category: 'Software',
    stock: 100,
    minStock: 20,
    unit: 'subscription',
  },
  {
    name: 'Premium Suite',
    description: 'Complete premium software suite',
    price: 25000.00,
    cost: 18000.00,
    category: 'Software',
    stock: 30,
    minStock: 5,
    unit: 'suite',
  },
  {
    name: 'Business Plan',
    description: 'Business plan for mid-size companies',
    price: 6200.00,
    cost: 4200.00,
    category: 'Software',
    stock: 75,
    minStock: 15,
    unit: 'subscription',
  },
  {
    name: 'Team Plan',
    description: 'Team collaboration plan',
    price: 4500.00,
    cost: 3200.00,
    category: 'Software',
    stock: 120,
    minStock: 25,
    unit: 'subscription',
  },
  {
    name: 'Basic Plan',
    description: 'Basic plan for startups',
    price: 3200.00,
    cost: 2200.00,
    category: 'Software',
    stock: 200,
    minStock: 30,
    unit: 'subscription',
  },
  {
    name: 'Custom Solution',
    description: 'Customized solution for specific needs',
    price: 18000.00,
    cost: 12000.00,
    category: 'Custom',
    stock: 20,
    minStock: 3,
    unit: 'solution',
  },
  {
    name: 'Integration Package',
    description: 'Integration package with third-party tools',
    price: 7500.00,
    cost: 5200.00,
    category: 'Integration',
    stock: 40,
    minStock: 8,
    unit: 'package',
  },
  {
    name: 'Consulting Services',
    description: 'Professional consulting and implementation',
    price: 15000.00,
    cost: 9500.00,
    category: 'Service',
    stock: 15,
    minStock: 2,
    unit: 'service',
  },
  {
    name: 'Training Package',
    description: 'Comprehensive training for teams',
    price: 3800.00,
    cost: 2500.00,
    category: 'Service',
    stock: 60,
    minStock: 10,
    unit: 'package',
  },
];

const CUSTOMERS = [
  'Acme Corp', 'TechStart Inc', 'Global Enterprises', 'Corporate Solutions',
  'HealthTech Inc', 'FinTech Corp', 'Cloud Solutions', 'Data Analytics Co',
  'Global Logistics', 'Creative Agency', 'Digital Agency', 'E-commerce Co',
  'BioTech Labs', 'AI Innovations', 'Blockchain Ventures', 'Quantum Computing',
];

const STATUSES: SaleStatus[] = ['COMPLETED', 'PENDING', 'COMPLETED', 'COMPLETED', 'PENDING', 'CANCELLED'];

const METRICS = [
  { name: 'Total Revenue', value: 542760.00, unit: '$', category: 'revenue' },
  { name: 'Monthly Revenue', value: 45230.00, unit: '$', category: 'revenue' },
  { name: 'Revenue Growth', value: 12.5, unit: '%', category: 'revenue' },
  { name: 'Average Deal Size', value: 8500.00, unit: '$', category: 'revenue' },
  { name: 'Customer Lifetime Value', value: 1240.50, unit: '$', category: 'revenue' },
  { name: 'Q1 Sales', value: 125000.00, unit: '$', category: 'sales' },
  { name: 'Q2 Sales', value: 145000.00, unit: '$', category: 'sales' },
  { name: 'Q3 Sales', value: 162000.00, unit: '$', category: 'sales' },
  { name: 'Q4 Sales', value: 189000.00, unit: '$', category: 'sales' },
  { name: 'Year-over-Year Growth', value: 18.5, unit: '%', category: 'sales' },
  { name: 'Sales Pipeline Value', value: 450000.00, unit: '$', category: 'sales' },
  { name: 'Win Rate', value: 42.5, unit: '%', category: 'sales' },
  { name: 'Active Users', value: 1247, unit: '', category: 'users' },
  { name: 'New Signups', value: 89, unit: '', category: 'users' },
  { name: 'Website Traffic', value: 4523, unit: '', category: 'users' },
  { name: 'Team Members', value: 10, unit: '', category: 'users' },
  { name: 'Conversion Rate', value: 3.87, unit: '%', category: 'performance' },
  { name: 'Customer Satisfaction', value: 4.8, unit: '/5', category: 'performance' },
  { name: 'Sales Target Achievement', value: 94.5, unit: '%', category: 'performance' },
  { name: 'Team Performance', value: 87.3, unit: '%', category: 'performance' },
  { name: 'Campaign ROI', value: 245.0, unit: '%', category: 'marketing' },
  { name: 'Cost Per Acquisition', value: 45.50, unit: '$', category: 'marketing' },
  { name: 'Lead Conversion', value: 234, unit: '', category: 'marketing' },
  { name: 'Marketing Spend', value: 12500.00, unit: '$', category: 'marketing' },
];

const ALERTS = [
  { name: 'Revenue Target Alert', condition: 'greater_than', threshold: 50000 },
  { name: 'Sales Pipeline Alert', condition: 'less_than', threshold: 300000 },
  { name: 'Win Rate Alert', condition: 'less_than', threshold: 35 },
  { name: 'Monthly Sales Target', condition: 'greater_than', threshold: 100000 },
  { name: 'User Growth Alert', condition: 'greater_than', threshold: 1000 },
  { name: 'Conversion Rate Alert', condition: 'less_than', threshold: 3.0 },
  { name: 'Revenue Drop Alert', condition: 'less_than', threshold: 40000 },
  { name: 'Low Stock Alert', condition: 'less_than', threshold: 10 },
];

const REPORTS = [
  { name: 'Monthly Sales Report', type: 'summary' },
  { name: 'Revenue Analytics Report', type: 'analytics' },
  { name: 'Sales Forecast Report', type: 'forecast' },
  { name: 'Team Performance Report', type: 'detailed' },
  { name: 'Product Performance Report', type: 'analytics' },
  { name: 'Quarterly Business Review', type: 'summary' },
];

const REPORT_INSIGHTS = [
  'Revenue increased by 15% this month to $542,760',
  'User engagement is up 8% with 1,247 active users',
  'Conversion rate improved by 2.5% to 3.87%',
  'Customer satisfaction at all-time high of 4.8/5',
  'Marketing ROI increased by 12% to 245%',
  'Sales pipeline is strong at $450,000 this quarter',
  'Team performance at 87.3% of target',
  'Q4 sales reached $189,000, up 18.5% year-over-year',
  'Average deal size is $8,500, up 10% from last quarter',
  'Customer lifetime value is $1,240.50, showing strong retention',
  'New product launch generated $45,000 in first month',
  'Customer acquisition cost decreased by 8%',
];

const NLP_QUERIES = [
  {
    query: 'Show me revenue trends for last month',
    response: 'Revenue increased by 12.5% last month, reaching $45,230. The growth was driven by a 15% increase in average order value and 8% increase in new customers.',
    confidence: 0.92,
  },
  {
    query: 'What is our total revenue?',
    response: 'Total revenue is $542,760 annually. Monthly revenue is $45,230 with an average deal size of $8,500.',
    confidence: 0.95,
  },
  {
    query: 'Analyze sales performance',
    response: 'Sales are up 18.5% year-over-year. Q4 sales reached $189,000 with a win rate of 42.5%. Pipeline value is $450,000.',
    confidence: 0.88,
  },
  {
    query: 'What are our top metrics?',
    response: 'Top metrics: Total Revenue ($542,760), Active Users (1,247), Win Rate (42.5%), and Customer Satisfaction (4.8/5).',
    confidence: 0.90,
  },
  {
    query: 'Show me low stock products',
    response: 'You have 5 products with low stock. Enterprise License (10 left), Pro Plan (20 left), Custom Solution (3 left).',
    confidence: 0.85,
  },
];

const WHAT_IF_SCENARIOS = [
  { name: 'Optimistic Growth', description: '20% growth across all metrics', change: 20, impact: 'positive', confidence: 0.75 },
  { name: 'Moderate Growth', description: '10% growth scenario', change: 10, impact: 'positive', confidence: 0.85 },
  { name: 'Pessimistic Scenario', description: '10% decline scenario', change: -10, impact: 'negative', confidence: 0.70 },
  { name: 'Aggressive Marketing', description: '50% marketing spend increase', change: 15, impact: 'positive', confidence: 0.65 },
  { name: 'Cost Optimization', description: '15% cost reduction', change: 5, impact: 'positive', confidence: 0.80 },
  { name: 'Market Expansion', description: 'Entering 3 new markets', change: 25, impact: 'positive', confidence: 0.60 },
];

const ACTIVITIES = [
  { action: 'login', description: 'User logged in to dashboard', type: 'login' },
  { action: 'view', description: 'Viewed sales dashboard', type: 'view' },
  { action: 'create', description: 'Created new sales report', type: 'create' },
  { action: 'export', description: 'Exported sales data to PDF', type: 'export' },
  { action: 'view', description: 'Analyzed revenue trends', type: 'view' },
  { action: 'create', description: 'Set up new alert for revenue threshold', type: 'create' },
  { action: 'view', description: 'Reviewed team performance', type: 'view' },
  { action: 'export', description: 'Exported monthly report', type: 'export' },
  { action: 'create', description: 'Registered new product', type: 'product' },
  { action: 'update', description: 'Updated product inventory', type: 'product' },
];

const DASHBOARD_NAMES = [
  'Sales Dashboard',
  'Marketing Dashboard',
  'Executive Dashboard',
  'Operations Dashboard',
  'Analytics Dashboard',
];

// ============================================================
// SEEDING FUNCTIONS
// ============================================================

async function seedUsers() {
  console.log('📝 Seeding users...');
  const createdUsers: any[] = [];

  for (const userData of USERS) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!existing) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
          team: userData.team,
          department: userData.department,
          isActive: userData.isActive,
        },
      });
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.email} (${user.role})`);
    } else {
      createdUsers.push(existing);
      console.log(`⚠️ User ${userData.email} already exists`);
    }
  }

  // Assign managers
  const managers = createdUsers.filter((u: any) => u.role === 'MANAGER');
  const teamA = createdUsers.filter((u: any) => u.team === 'Sales Team A' && u.role === 'USER');
  const teamB = createdUsers.filter((u: any) => u.team === 'Sales Team B' && u.role === 'USER');

  if (managers.length >= 2) {
    for (const user of teamA) {
      await prisma.user.update({
        where: { id: user.id },
        data: { managerId: managers[0].id },
      });
    }
    for (const user of teamB) {
      await prisma.user.update({
        where: { id: user.id },
        data: { managerId: managers[1].id },
      });
    }
    console.log('✅ Assigned managers to teams');
  }

  return createdUsers;
}

async function seedProducts(users: any[]) {
  console.log('📦 Seeding products...');
  let productCount = 0;
  const managers = users.filter((u: any) => u.role === 'MANAGER' || u.role === 'ADMIN');

  for (const productData of PRODUCTS) {
    const user = getRandomItem(managers);
    const sku = generateSKU();

    const existing = await prisma.product.findFirst({
      where: { sku },
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          ...productData,
          sku,
          userId: user.id,
          images: [`/images/products/${sku.toLowerCase()}.jpg`],
        },
      });
      productCount++;
    }
  }

  console.log(`✅ Created ${productCount} products`);
  return productCount;
}

async function seedSalesRecords(users: any[]) {
  console.log('💰 Seeding sales records...');
  let recordCount = 0;
  const salesReps = users.filter((u: any) => u.role === 'USER' || u.role === 'MANAGER');
  const products = await prisma.product.findMany();

  for (let i = 0; i < 50; i++) {
    const user = getRandomItem(salesReps);
    const product = getRandomItem(products);
    const quantity = Math.floor(Math.random() * 5) + 1;
    const amount = product.price * quantity;

    await prisma.salesRecord.create({
      data: {
        amount,
        customer: getRandomItem(CUSTOMERS),
        productId: product.id,
        quantity,
        status: getRandomItem(STATUSES),
        date: getRandomDate(90),
        userId: user.id,
        notes: `Sale #${i + 1} - ${product.name}`,
      },
    });
    recordCount++;
  }

  console.log(`✅ Created ${recordCount} sales records`);
  return recordCount;
}

async function seedDashboards(users: any[]) {
  console.log('📊 Seeding dashboards...');
  const createdDashboards: any[] = [];

  for (const name of DASHBOARD_NAMES) {
    const user = getRandomItem(users);
    const existing = await prisma.dashboard.findFirst({
      where: { name, userId: user.id },
    });

    if (!existing) {
      const dashboard = await prisma.dashboard.create({
        data: {
          name,
          description: `${name} for ${user.name}`,
          userId: user.id,
          type: 'sales',
        },
      });
      createdDashboards.push(dashboard);
    }
  }

  console.log(`✅ Created ${createdDashboards.length} dashboards`);
  return createdDashboards;
}

async function seedMetrics(dashboards: any[]) {
  console.log('📈 Seeding metrics...');
  let metricCount = 0;

  for (const dashboard of dashboards) {
    for (const metricData of METRICS) {
      const existing = await prisma.metric.findFirst({
        where: {
          name: metricData.name,
          dashboardId: dashboard.id,
        },
      });

      if (!existing) {
        const variation = 0.85 + Math.random() * 0.3;
        await prisma.metric.create({
          data: {
            ...metricData,
            value: Math.round(metricData.value * variation * 100) / 100,
            dashboardId: dashboard.id,
            userId: dashboard.userId,
            date: getRandomDate(30),
          },
        });
        metricCount++;
      }
    }
  }

  console.log(`✅ Created ${metricCount} metrics`);
  return metricCount;
}

async function seedMetricData(metrics: any[]) {
  console.log('📉 Seeding metric data...');
  let dataCount = 0;

  const revenueMetric = metrics.find((m: any) => m.name === 'Monthly Revenue');
  if (!revenueMetric) return 0;

  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const factor = 0.7 + Math.random() * 0.6;
    const value = Math.round(45230 * factor * 100) / 100;

    await prisma.metricData.create({
      data: {
        metricId: revenueMetric.id,
        value,
        timestamp: date,
        metadata: { source: 'generated' },
      },
    });
    dataCount++;
  }

  console.log(`✅ Created ${dataCount} metric data points`);
  return dataCount;
}

async function seedAlerts(users: any[]) {
  console.log('🔔 Seeding alerts...');
  let alertCount = 0;
  const metrics = await prisma.metric.findMany({ take: 20 });

  for (const alertData of ALERTS) {
    const metric = getRandomItem(metrics);
    if (!metric) continue;

    const existing = await prisma.alert.findFirst({
      where: { name: alertData.name, metricId: metric.id },
    });

    if (!existing) {
      await prisma.alert.create({
        data: {
          ...alertData,
          threshold: metric.value * (0.5 + Math.random() * 0.5),
          status: ['active', 'active', 'active', 'inactive'][alertCount % 4],
          metricId: metric.id,
          userId: metric.userId,
        },
      });
      alertCount++;
    }
  }

  console.log(`✅ Created ${alertCount} alerts`);
  return alertCount;
}

async function seedReports(users: any[], dashboards: any[]) {
  console.log('📄 Seeding reports...');
  let reportCount = 0;

  for (const reportData of REPORTS) {
    const user = getRandomItem(users);
    const dashboard = getRandomItem(dashboards);
    const existing = await prisma.report.findFirst({
      where: { name: reportData.name, userId: user.id },
    });

    if (!existing) {
      const insights = [...REPORT_INSIGHTS]
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);

      await prisma.report.create({
        data: {
          name: reportData.name,
          description: `${reportData.type} report for ${dashboard.name}`,
          type: reportData.type,
          data: {
            dashboard: dashboard.name,
            generated: new Date().toISOString(),
            summary: `This is a ${reportData.type} report for ${dashboard.name}`,
            insights,
          },
          userId: user.id,
        },
      });
      reportCount++;
    }
  }

  console.log(`✅ Created ${reportCount} reports`);
  return reportCount;
}

async function seedNLPQueries(users: any[]) {
  console.log('🧠 Seeding NLP queries...');
  let nlpCount = 0;

  for (const queryData of NLP_QUERIES) {
    const user = getRandomItem(users);
    const existing = await prisma.nLPQuery.findFirst({
      where: { query: queryData.query, userId: user.id },
    });

    if (!existing) {
      await prisma.nLPQuery.create({
        data: { ...queryData, userId: user.id },
      });
      nlpCount++;
    }
  }

  console.log(`✅ Created ${nlpCount} NLP queries`);
  return nlpCount;
}

async function seedWhatIfScenarios(users: any[]) {
  console.log('📊 Seeding What-If scenarios...');
  let scenarioCount = 0;

  for (const scenarioData of WHAT_IF_SCENARIOS) {
    const user = getRandomItem(users);
    const existing = await prisma.whatIfScenario.findFirst({
      where: { name: scenarioData.name, userId: user.id },
    });

    if (!existing) {
      await prisma.whatIfScenario.create({
        data: { ...scenarioData, userId: user.id },
      });
      scenarioCount++;
    }
  }

  console.log(`✅ Created ${scenarioCount} What-If scenarios`);
  return scenarioCount;
}

async function seedActivities(users: any[]) {
  console.log('📝 Seeding activities...');
  let activityCount = 0;

  for (const activityData of ACTIVITIES) {
    const user = getRandomItem(users);
    const date = getRandomDate(7);

    await prisma.activity.create({
      data: {
        action: activityData.action,
        description: activityData.description,
        type: activityData.type,
        userId: user.id,
        metadata: { timestamp: date.toISOString() },
        createdAt: date,
      },
    });
    activityCount++;
  }

  console.log(`✅ Created ${activityCount} activities`);
  return activityCount;
}

// ============================================================
// MAIN SEED FUNCTION
// ============================================================

async function main() {
  console.log('🌱 Starting database seeding...\n');
  console.log('===========================================');
  console.log('  SALES MANAGEMENT SYSTEM SEEDING');
  console.log('===========================================\n');

  try {
    // 1. Users
    const users = await seedUsers();

    // 2. Products
    const productCount = await seedProducts(users);

    // 3. Sales Records
    const salesCount = await seedSalesRecords(users);

    // 4. Dashboards
    const dashboards = await seedDashboards(users);

    // 5. Metrics
    const metricCount = await seedMetrics(dashboards);

    // 6. Metric Data (for graphs)
    const metrics = await prisma.metric.findMany();
    const metricDataCount = await seedMetricData(metrics);

    // 7. Alerts
    const alertCount = await seedAlerts(users);

    // 8. Reports
    const reportCount = await seedReports(users, dashboards);

    // 9. NLP Queries
    const nlpCount = await seedNLPQueries(users);

    // 10. What-If Scenarios
    const scenarioCount = await seedWhatIfScenarios(users);

    // 11. Activities
    const activityCount = await seedActivities(users);

    // Summary
    console.log('\n===========================================');
    console.log('🎉 SEEDING COMPLETE!');
    console.log('===========================================');
    console.log(`\n📊 SEED SUMMARY:`);
    console.log(`   👤 Users: ${users.length}`);
    console.log(`   📦 Products: ${productCount}`);
    console.log(`   💰 Sales Records: ${salesCount}`);
    console.log(`   📊 Dashboards: ${dashboards.length}`);
    console.log(`   📈 Metrics: ${metricCount}`);
    console.log(`   📉 Metric Data Points: ${metricDataCount}`);
    console.log(`   🔔 Alerts: ${alertCount}`);
    console.log(`   📄 Reports: ${reportCount}`);
    console.log(`   🧠 NLP Queries: ${nlpCount}`);
    console.log(`   📊 Scenarios: ${scenarioCount}`);
    console.log(`   📝 Activities: ${activityCount}`);

    console.log('\n📋 TEST CREDENTIALS:');
    console.log('-------------------');
    console.log('🔴 Super Admin: superadmin@dashboard.com / superadmin123');
    console.log('🟠 Admin: admin@dashboard.com / admin123');
    console.log('🟢 Manager 1: manager1@dashboard.com / manager123');
    console.log('🟢 Manager 2: manager2@dashboard.com / manager123');
    console.log('🔵 User: john@example.com / john123');
    console.log('🔵 User: jane@example.com / jane123');
    console.log('👁️ Viewer: sarah@example.com / sarah123');

    console.log('\n📌 ROLE PERMISSIONS:');
    console.log('   🔴 SUPER_ADMIN: Full access, can assign managers, change roles');
    console.log('   🟠 ADMIN: Full access except role changes');
    console.log('   🟢 MANAGER: Can register products, manage team');
    console.log('   🔵 USER: View dashboard, analytics, reports');
    console.log('   👁️ VIEWER: Read-only access');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
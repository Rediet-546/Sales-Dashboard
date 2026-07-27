/// <reference types="node" />

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Sample data
const sampleMetrics = {
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
};

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create or Get Users
  console.log('📝 Creating users...');
  
  const usersData = [
    {
      email: 'admin@dashboard.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin User',
      role: 'admin',
    },
    {
      email: 'demo@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Demo User',
      role: 'user',
    },
    {
      email: 'john@example.com',
      password: await bcrypt.hash('john123', 10),
      name: 'John Doe',
      role: 'user',
    },
    {
      email: 'jane@example.com',
      password: await bcrypt.hash('jane123', 10),
      name: 'Jane Smith',
      role: 'user',
    },
  ];

  const createdUsers = [];
  for (const userData of usersData) {
    let user = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    
    if (!user) {
      user = await prisma.user.create({ data: userData });
      console.log(`✅ Created user: ${user.email}`);
    } else {
      console.log(`⚠️ User ${userData.email} already exists, skipping...`);
    }
    createdUsers.push(user);
  }

  // If no users were created, get all existing users
  if (createdUsers.length === 0 || createdUsers.every(u => u === null)) {
    const existingUsers = await prisma.user.findMany();
    if (existingUsers.length > 0) {
      createdUsers.length = 0;
      createdUsers.push(...existingUsers);
      console.log(`📋 Using ${existingUsers.length} existing users`);
    } else {
      // Create a default user if none exist
      const defaultUser = await prisma.user.create({
        data: {
          email: 'default@example.com',
          password: await bcrypt.hash('default123', 10),
          name: 'Default User',
          role: 'user',
        },
      });
      createdUsers.push(defaultUser);
      console.log(`✅ Created default user: ${defaultUser.email}`);
    }
  }

  // 2. Create Dashboards
  console.log('📊 Creating dashboards...');
  
  const dashboardNames = [
    'Sales Dashboard',
    'Marketing Dashboard',
    'Executive Dashboard',
    'Operations Dashboard',
  ];

  const createdDashboards = [];
  for (let i = 0; i < dashboardNames.length; i++) {
    // Get a user for this dashboard (cycle through available users)
    const user = createdUsers[i % createdUsers.length];
    if (!user) continue;

    const existing = await prisma.dashboard.findFirst({
      where: { 
        name: dashboardNames[i],
        userId: user.id,
      },
    });
    
    if (!existing) {
      const dashboard = await prisma.dashboard.create({
        data: {
          name: dashboardNames[i],
          description: `Dashboard for ${dashboardNames[i].toLowerCase()}`,
          userId: user.id,
        },
      });
      createdDashboards.push(dashboard);
      console.log(`✅ Created dashboard: ${dashboard.name}`);
    } else {
      createdDashboards.push(existing);
      console.log(`⚠️ Dashboard ${dashboardNames[i]} already exists, skipping...`);
    }
  }

  // 3. Create Metrics
  console.log('📈 Creating metrics...');
  
  const allMetrics = Object.values(sampleMetrics).flat();
  let metricCount = 0;

  for (const dashboard of createdDashboards) {
    if (!dashboard) continue;
    
    // Add metrics to each dashboard
    const metricsToAdd = allMetrics.slice(0, 10 + Math.floor(Math.random() * 10));
    
    for (const metricData of metricsToAdd) {
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const randomValue = metricData.value * (0.8 + Math.random() * 0.4);
      
      // Check if metric already exists
      const existingMetric = await prisma.metric.findFirst({
        where: {
          name: metricData.name,
          dashboardId: dashboard.id,
        },
      });

      if (!existingMetric) {
        await prisma.metric.create({
          data: {
            ...metricData,
            value: Math.round(randomValue * 100) / 100,
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

  // 4. Create Alerts
  console.log('🔔 Creating alerts...');
  
  const alertConditions = ['greater_than', 'less_than', 'equal_to'];
  const alertNames = [
    'Revenue Threshold Alert',
    'User Growth Alert',
    'Performance Alert',
    'Sales Target Alert',
    'Marketing Campaign Alert',
  ];

  const metrics = await prisma.metric.findMany({
    take: 10,
  });
  let alertCount = 0;

  for (let i = 0; i < Math.min(5, alertNames.length); i++) {
    const metric = metrics[i % metrics.length];
    if (!metric) continue;

    const existingAlert = await prisma.alert.findFirst({
      where: {
        name: alertNames[i],
        metricId: metric.id,
      },
    });

    if (!existingAlert) {
      await prisma.alert.create({
        data: {
          name: alertNames[i],
          condition: alertConditions[i % alertConditions.length],
          threshold: metric.value * (1 + (i + 1) * 0.1),
          status: i % 2 === 0 ? 'active' : 'inactive',
          metricId: metric.id,
          userId: metric.userId,
        },
      });
      alertCount++;
    }
  }
  console.log(`✅ Created ${alertCount} new alerts`);

  // 5. Create Reports
  console.log('📄 Creating reports...');
  
  const reportTypes = ['summary', 'analytics', 'forecast', 'detailed'];
  const reportNames = [
    'Monthly Performance Report',
    'Revenue Analytics Report',
    'Quarterly Forecast Report',
    'Detailed Metrics Report',
  ];

  let reportCount = 0;
  for (let i = 0; i < 4; i++) {
    const user = createdUsers[i % createdUsers.length];
    if (!user) continue;
    
    const dashboard = createdDashboards[i % createdDashboards.length];
    if (!dashboard) continue;
    
    const reportMetrics = await prisma.metric.findMany({
      where: { dashboardId: dashboard.id },
      take: 5,
    });

    const existingReport = await prisma.report.findFirst({
      where: {
        name: reportNames[i],
        userId: user.id,
      },
    });

    if (!existingReport) {
      await prisma.report.create({
        data: {
          name: reportNames[i],
          description: `Generated ${reportTypes[i]} report for ${dashboard.name}`,
          type: reportTypes[i],
          data: {
            dashboard: dashboard.name,
            metrics: reportMetrics,
            generated: new Date().toISOString(),
            summary: `This is a ${reportTypes[i]} report for ${dashboard.name}`,
            insights: [
              'Revenue increased by 15% this month',
              'User engagement is up 8%',
              'Conversion rate improved by 2.5%',
              'Customer satisfaction at all-time high',
            ],
          },
          userId: user.id,
        },
      });
      reportCount++;
    }
  }
  console.log(`✅ Created ${reportCount} new reports`);

  // 6. Summary
  console.log('\n🎉 Database seeding completed!');
  console.log('\n📊 Summary:');
  console.log(`   Users: ${createdUsers.length}`);
  console.log(`   Dashboards: ${createdDashboards.length}`);
  console.log(`   Metrics: ${metricCount} new`);
  console.log(`   Alerts: ${alertCount} new`);
  console.log(`   Reports: ${reportCount} new`);

  console.log('\n📋 Test Credentials:');
  console.log('-------------------');
  console.log('Admin: admin@dashboard.com / admin123');
  console.log('Demo: demo@example.com / password123');
  console.log('User: john@example.com / john123');
  console.log('User: jane@example.com / jane123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
/// <reference types="node" />

import { PrismaClient, Role, SaleStatus, ApprovalStatus, ApprovalType, AlertType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateSKU(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'SKU-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateInvoice(): string {
  return `INV-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
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
  // SUPER_ADMIN
  {
    email: 'superadmin@shop.com',
    password: 'superadmin123',
    name: 'Super Admin',
    role: Role.SUPER_ADMIN,
    team: 'Executive',
    department: 'Management',
    isActive: true,
  },
  // ADMINS (Shop Owners)
  {
    email: 'admin1@shop.com',
    password: 'admin123',
    name: 'John Admin',
    role: Role.ADMIN,
    team: 'Management',
    department: 'Sales',
    isActive: true,
  },
  {
    email: 'admin2@shop.com',
    password: 'admin123',
    name: 'Sarah Admin',
    role: Role.ADMIN,
    team: 'Management',
    department: 'Retail',
    isActive: true,
  },
  // MANAGERS
  {
    email: 'manager1@shop.com',
    password: 'manager123',
    name: 'Mike Manager',
    role: Role.MANAGER,
    team: 'Sales Team A',
    department: 'Sales',
    isActive: true,
  },
  {
    email: 'manager2@shop.com',
    password: 'manager123',
    name: 'Lisa Manager',
    role: Role.MANAGER,
    team: 'Sales Team B',
    department: 'Retail',
    isActive: true,
  },
  // USERS
  {
    email: 'john@example.com',
    password: 'john123',
    name: 'John Doe',
    role: Role.USER,
    team: 'Sales Team A',
    department: 'Sales',
    isActive: true,
  },
  {
    email: 'jane@example.com',
    password: 'jane123',
    name: 'Jane Smith',
    role: Role.USER,
    team: 'Sales Team A',
    department: 'Sales',
    isActive: true,
  },
  {
    email: 'mike@example.com',
    password: 'mike123',
    name: 'Mike Johnson',
    role: Role.USER,
    team: 'Sales Team B',
    department: 'Retail',
    isActive: true,
  },
  // VIEWER
  {
    email: 'viewer@shop.com',
    password: 'viewer123',
    name: 'Sarah Viewer',
    role: Role.VIEWER,
    team: 'Marketing',
    department: 'Marketing',
    isActive: true,
  },
];

const SHOPS = [
  {
    name: 'Main Store NYC',
    description: 'Flagship store in New York City',
    address: '123 Broadway, New York, NY 10001',
    phone: '+1 212-555-0100',
    email: 'nyc@shop.com',
    currency: 'USD',
    timezone: 'America/New_York',
  },
  {
    name: 'West Coast Store',
    description: 'West coast branch in Los Angeles',
    address: '456 Hollywood Blvd, Los Angeles, CA 90028',
    phone: '+1 310-555-0200',
    email: 'la@shop.com',
    currency: 'USD',
    timezone: 'America/Los_Angeles',
  },
  {
    name: 'Online Store',
    description: 'E-commerce online store',
    address: '789 Digital Way, San Francisco, CA 94105',
    phone: '+1 415-555-0300',
    email: 'online@shop.com',
    currency: 'USD',
    timezone: 'America/Los_Angeles',
  },
];

const PRODUCTS = [
  {
    name: 'Premium Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1299.99,
    cost: 899.99,
    category: 'Electronics',
    stock: 50,
    minStock: 10,
    unit: 'pcs',
  },
  {
    name: 'Wireless Headphones',
    description: 'Noise-canceling wireless headphones',
    price: 199.99,
    cost: 129.99,
    category: 'Electronics',
    stock: 100,
    minStock: 20,
    unit: 'pcs',
  },
  {
    name: 'Designer T-Shirt',
    description: 'Premium cotton t-shirt',
    price: 49.99,
    cost: 29.99,
    category: 'Clothing',
    stock: 200,
    minStock: 30,
    unit: 'pcs',
  },
  {
    name: 'Smartphone Pro',
    description: 'Latest generation smartphone',
    price: 899.99,
    cost: 649.99,
    category: 'Electronics',
    stock: 75,
    minStock: 15,
    unit: 'pcs',
  },
  {
    name: 'Office Chair',
    description: 'Ergonomic office chair',
    price: 349.99,
    cost: 229.99,
    category: 'Furniture',
    stock: 30,
    minStock: 5,
    unit: 'pcs',
  },
  {
    name: 'Coffee Maker',
    description: 'Automatic coffee maker',
    price: 89.99,
    cost: 59.99,
    category: 'Appliances',
    stock: 60,
    minStock: 10,
    unit: 'pcs',
  },
  {
    name: 'Running Shoes',
    description: 'Professional running shoes',
    price: 129.99,
    cost: 89.99,
    category: 'Footwear',
    stock: 80,
    minStock: 15,
    unit: 'pairs',
  },
  {
    name: 'Backpack',
    description: 'Waterproof laptop backpack',
    price: 69.99,
    cost: 45.99,
    category: 'Accessories',
    stock: 120,
    minStock: 20,
    unit: 'pcs',
  },
  {
    name: 'Smart Watch',
    description: 'Fitness smart watch',
    price: 249.99,
    cost: 169.99,
    category: 'Electronics',
    stock: 45,
    minStock: 8,
    unit: 'pcs',
  },
  {
    name: 'Desk Lamp',
    description: 'LED desk lamp with USB charging',
    price: 39.99,
    cost: 25.99,
    category: 'Furniture',
    stock: 90,
    minStock: 15,
    unit: 'pcs',
  },
];

const CUSTOMERS = [
  'James Wilson', 'Maria Garcia', 'David Chen', 'Linda Johnson',
  'Robert Taylor', 'Patricia Lee', 'Michael Brown', 'Jennifer Davis',
  'William Miller', 'Barbara Jones', 'Thomas Wilson', 'Jessica Martinez',
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

  return createdUsers;
}

async function seedShops(users: any[]) {
  console.log('🏪 Seeding shops...');
  const createdShops: any[] = [];
  const admins = users.filter((u: any) => u.role === Role.ADMIN);

  for (let i = 0; i < SHOPS.length; i++) {
    const shopData = SHOPS[i];
    const admin = admins[i % admins.length];

    const existing = await prisma.shop.findFirst({
      where: { name: shopData.name },
    });

    if (!existing) {
      const shop = await prisma.shop.create({
        data: {
          ...shopData,
          settings: {
            create: {
              taxRate: 8.0,
              invoicePrefix: `INV-${String(i + 1).padStart(3, '0')}-`,
              lowStockThreshold: 10,
            },
          },
        },
      });

      // Assign admin to shop
      await prisma.user.update({
        where: { id: admin.id },
        data: { shopId: shop.id },
      });

      createdShops.push(shop);
      console.log(`✅ Created shop: ${shop.name} with admin ${admin.name}`);
    } else {
      createdShops.push(existing);
      console.log(`⚠️ Shop ${shopData.name} already exists`);
    }
  }

  return createdShops;
}

async function seedManagerPermissions(users: any[]) {
  console.log('🔑 Seeding manager permissions...');
  const managers = users.filter((u: any) => u.role === Role.MANAGER);

  const permissionConfigs = [
    {
      canManageProducts: true,
      canCreateProducts: true,
      canEditPricing: false,
      canViewReports: true,
      canManageTeam: true,
      canProcessReturns: true,
      department: 'Sales',
      categories: ['Electronics', 'Accessories'],
      maxDiscount: 10.0,
      approvalRequired: true,
    },
    {
      canManageProducts: true,
      canCreateProducts: true,
      canEditPricing: false,
      canViewReports: true,
      canManageTeam: false,
      canProcessReturns: true,
      department: 'Retail',
      categories: ['Clothing', 'Footwear'],
      maxDiscount: 15.0,
      approvalRequired: true,
    },
  ];

  for (let i = 0; i < managers.length; i++) {
    const manager = managers[i];
    const config = permissionConfigs[i % permissionConfigs.length];

    const existing = await prisma.managerPermission.findFirst({
      where: { managerId: manager.id },
    });

    if (!existing) {
      const permission = await prisma.managerPermission.create({
        data: {
          managerId: manager.id,
          ...config,
          categories: config.categories,
        },
      });

      await prisma.user.update({
        where: { id: manager.id },
        data: { permissionsId: permission.id },
      });

      console.log(`✅ Created permissions for ${manager.name}`);
    }
  }

  return true;
}

async function seedProducts(users: any[], shops: any[]) {
  console.log('📦 Seeding products...');
  let productCount = 0;
  const managers = users.filter((u: any) => u.role === Role.MANAGER || u.role === Role.ADMIN);

  for (const productData of PRODUCTS) {
    const user = getRandomItem(managers);
    const shop = getRandomItem(shops);
    const sku = generateSKU();

    const existing = await prisma.product.findFirst({
      where: { sku },
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          ...productData,
          sku,
          shopId: shop.id,
          userId: user.id,
          barcode: `BAR-${sku}`,
        },
      });
      productCount++;
    }
  }

  console.log(`✅ Created ${productCount} products`);
  return productCount;
}

async function seedSalesRecords(users: any[], shops: any[]) {
  console.log('💰 Seeding sales records...');
  let recordCount = 0;
  const salesUsers = users.filter((u: any) => u.role === Role.USER || u.role === Role.MANAGER);
  const products = await prisma.product.findMany();

  for (let i = 0; i < 50; i++) {
    const user = getRandomItem(salesUsers);
    const shop = getRandomItem(shops);
    const product = getRandomItem(products);
    const quantity = Math.floor(Math.random() * 5) + 1;
    const discount = Math.random() > 0.5 ? Math.floor(Math.random() * 10) : 0;
    const tax = 8.0;
    const subtotal = product.price * quantity;
    const discountAmount = (subtotal * discount) / 100;
    const taxAmount = ((subtotal - discountAmount) * tax) / 100;
    const total = subtotal - discountAmount + taxAmount;

    await prisma.salesRecord.create({
      data: {
        invoice: generateInvoice(),
        amount: subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total: total,
        status: getRandomItem([SaleStatus.COMPLETED, SaleStatus.COMPLETED, SaleStatus.PENDING]),
        paymentMethod: getRandomItem(['CASH', 'CARD', 'MOBILE', 'BANK_TRANSFER']),
        customer: getRandomItem(CUSTOMERS),
        productId: product.id,
        quantity,
        shopId: shop.id,
        userId: user.id,
        date: getRandomDate(60),
        notes: `Sale #${i + 1}`,
      },
    });
    recordCount++;
  }

  console.log(`✅ Created ${recordCount} sales records`);
  return recordCount;
}

async function seedAlerts(users: any[], shops: any[]) {
  console.log('🔔 Seeding alerts...');
  let alertCount = 0;

  const alertData = [
    { name: 'Low Stock Alert', type: AlertType.STOCK, condition: 'less_than', threshold: 10 },
    { name: 'Sales Target Alert', type: AlertType.SALES, condition: 'greater_than', threshold: 5000 },
    { name: 'User Activity Alert', type: AlertType.USER_ACTION, condition: 'greater_than', threshold: 100 },
    { name: 'Revenue Drop Alert', type: AlertType.SALES, condition: 'less_than', threshold: 1000 },
    { name: 'Inventory Warning', type: AlertType.STOCK, condition: 'less_than', threshold: 20 },
  ];

  for (const alert of alertData) {
    const user = getRandomItem(users);
    const shop = getRandomItem(shops);

    await prisma.alert.create({
      data: {
        name: alert.name,
        type: alert.type,
        condition: alert.condition,
        threshold: alert.threshold,
        status: 'active',
        isActive: true,
        userId: user.id,
        shopId: shop.id,
        message: `Alert: ${alert.name} triggered!`,
      },
    });
    alertCount++;
  }

  console.log(`✅ Created ${alertCount} alerts`);
  return alertCount;
}

async function seedReports(users: any[], shops: any[]) {
  console.log('📄 Seeding reports...');
  let reportCount = 0;

  const reportTypes = ['summary', 'analytics', 'forecast', 'detailed'];

  for (let i = 0; i < 6; i++) {
    const user = getRandomItem(users);
    const shop = getRandomItem(shops);

    await prisma.report.create({
      data: {
        name: `Report ${i + 1}`,
        description: `${reportTypes[i % reportTypes.length]} report`,
        type: reportTypes[i % reportTypes.length],
        data: {
          generated: new Date().toISOString(),
          metrics: {
            totalSales: Math.floor(Math.random() * 10000),
            totalOrders: Math.floor(Math.random() * 100),
            averageOrder: Math.floor(Math.random() * 500) + 100,
          },
          insights: [
            'Revenue increased by 15% this month',
            'Customer satisfaction at 4.8/5',
            'Top product: Premium Laptop',
          ],
        },
        userId: user.id,
        shopId: shop.id,
      },
    });
    reportCount++;
  }

  console.log(`✅ Created ${reportCount} reports`);
  return reportCount;
}

// ============================================================
// MAIN SEED FUNCTION
// ============================================================

async function main() {
  console.log('🌱 Starting database seeding...\n');
  console.log('===========================================');
  console.log('  SHOP MANAGEMENT SYSTEM SEEDING');
  console.log('===========================================\n');

  try {
    // 1. Users
    const users = await seedUsers();

    // 2. Shops
    const shops = await seedShops(users);

    // 3. Manager Permissions
    await seedManagerPermissions(users);

    // 4. Products
    const productCount = await seedProducts(users, shops);

    // 5. Sales Records
    const salesCount = await seedSalesRecords(users, shops);

    // 6. Alerts
    const alertCount = await seedAlerts(users, shops);

    // 7. Reports
    const reportCount = await seedReports(users, shops);

    // Summary
    console.log('\n===========================================');
    console.log('🎉 SEEDING COMPLETE!');
    console.log('===========================================');
    console.log(`\n📊 SEED SUMMARY:`);
    console.log(`   👤 Users: ${users.length}`);
    console.log(`   🏪 Shops: ${shops.length}`);
    console.log(`   📦 Products: ${productCount}`);
    console.log(`   💰 Sales Records: ${salesCount}`);
    console.log(`   🔔 Alerts: ${alertCount}`);
    console.log(`   📄 Reports: ${reportCount}`);

    console.log('\n📋 TEST CREDENTIALS:');
    console.log('-------------------');
    console.log('🔴 Super Admin: superadmin@shop.com / superadmin123');
    console.log('🟠 Admin 1: admin1@shop.com / admin123');
    console.log('🟠 Admin 2: admin2@shop.com / admin123');
    console.log('🟢 Manager 1: manager1@shop.com / manager123');
    console.log('🟢 Manager 2: manager2@shop.com / manager123');
    console.log('🔵 User: john@example.com / john123');
    console.log('👁️ Viewer: viewer@shop.com / viewer123');

    console.log('\n📌 ROLE PERMISSIONS:');
    console.log('   🔴 SUPER_ADMIN: Full system access');
    console.log('   🟠 ADMIN: Shop management, manager assignment');
    console.log('   🟢 MANAGER: Limited permissions with approval workflow');
    console.log('   🔵 USER: Basic sales operations');
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
const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');
const {
  User,
  Company,
  Project,
  ProjectMember,
  Task,
  Timesheet,
  SalesOrder,
  PurchaseOrder,
  CustomerInvoice,
  VendorBill,
  Expense,
  Notification
} = require('./models');

// Helper function to generate dates
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandomAmount = (min, max) => {
  return Math.random() * (max - min) + min;
};

const seedTestData = async () => {
  try {
    console.log('🌱 Starting to seed test data...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await sequelize.sync({ force: true });

    // Create Companies - Single company for all data
    console.log('🏢 Creating company...');
    const companies = await Company.bulkCreate([
      {
        name: 'OneFlow Solutions',
        email: 'info@oneflow.com',
        phone: '+1 (555) 123-4567',
        address: '123 Tech Street, Silicon Valley, CA 94000',
        website: 'https://oneflow.com',
        industry: 'Technology',
        company_size: 'Medium'
      }
    ]);

    // Create Users
    console.log('👥 Creating users...');
    
    const users = await User.bulkCreate([
      // Admin Users - all in same company
      {
        name: 'John Smith',
        email: 'john.smith@oneflow.com',
        password_hash: 'password123',
        role: 'Admin',
        hourly_rate: 75.00,
        company_id: companies[0].id,
        is_active: true
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@oneflow.com',
        password_hash: 'password123',
        role: 'Admin',
        hourly_rate: 80.00,
        company_id: companies[0].id,
        is_active: true
      },

      // Project Managers - all in same company
      {
        name: 'Mike Chen',
        email: 'mike.chen@oneflow.com',
        password_hash: 'password123',
        role: 'Project Manager',
        hourly_rate: 65.00,
        company_id: companies[0].id,
        is_active: true
      },
      {
        name: 'Emma Davis',
        email: 'emma.davis@oneflow.com',
        password_hash: 'password123',
        role: 'Project Manager',
        hourly_rate: 60.00,
        company_id: companies[0].id,
        is_active: true
      },
      {
        name: 'David Wilson',
        email: 'david.wilson@oneflow.com',
        password_hash: 'password123',
        role: 'Project Manager',
        hourly_rate: 70.00,
        company_id: companies[0].id,
        is_active: true
      },

      // Sales/Finance Users - all in same company
      {
        name: 'Lisa Brown',
        email: 'lisa.brown@oneflow.com',
        password_hash: 'password123',
        role: 'Sales/Finance',
        hourly_rate: 55.00,
        company_id: companies[0].id,
        is_active: true
      },

      // Team Members - all in same company
      {
        name: 'Alex Rodriguez',
        email: 'alex.rodriguez@oneflow.com',
        password_hash: 'password123',
        role: 'Team Member',
        hourly_rate: 45.00,
        company_id: companies[0].id,
        is_active: true
      },
      {
        name: 'Rachel Green',
        email: 'rachel.green@oneflow.com',
        password_hash: 'password123',
        role: 'Team Member',
        hourly_rate: 50.00,
        company_id: companies[0].id,
        is_active: true
      },
      {
        name: 'Tom Anderson',
        email: 'tom.anderson@oneflow.com',
        password_hash: 'password123',
        role: 'Team Member',
        hourly_rate: 42.00,
        company_id: companies[0].id,
        is_active: true
      },
      {
        name: 'Jessica Taylor',
        email: 'jessica.taylor@oneflow.com',
        password_hash: 'password123',
        role: 'Team Member',
        hourly_rate: 48.00,
        company_id: companies[0].id,
        is_active: true
      },
      
      // Add Juli Kyada as admin in same company
      {
        name: 'Juli Kyada',
        email: 'julikyada293@gmail.com',
        password_hash: 'password123',
        role: 'Admin',
        hourly_rate: 90.00,
        company_id: companies[0].id,
        is_active: true
      }
    ], {
      individualHooks: true // This ensures beforeSave hooks are called for each record
    });

    // Create Projects - all in same company
    console.log('📋 Creating projects...');
    const projects = await Project.bulkCreate([
      {
        name: 'E-commerce Platform Development',
        description: 'Building a modern e-commerce platform with React and Node.js',
        start_date: new Date('2024-01-15'),
        end_date: new Date('2024-06-30'),
        status: 'In Progress',
        project_manager_id: users[2].id, // Mike Chen
        budget: 150000.00,
        company_id: companies[0].id
      },
      {
        name: 'Mobile App UI/UX Design',
        description: 'Complete UI/UX redesign for mobile banking application',
        start_date: new Date('2024-02-01'),
        end_date: new Date('2024-05-15'),
        status: 'In Progress',
        project_manager_id: users[3].id, // Emma Davis
        budget: 75000.00,
        company_id: companies[0].id
      },
      {
        name: 'Data Analytics Dashboard',
        description: 'Real-time analytics dashboard for business intelligence',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-04-30'),
        status: 'Completed',
        project_manager_id: users[2].id, // Mike Chen
        budget: 95000.00,
        company_id: companies[0].id
      },
      {
        name: 'CRM System Integration',
        description: 'Integration of existing CRM with new sales processes',
        start_date: new Date('2024-03-01'),
        end_date: new Date('2024-08-15'),
        status: 'Planned',
        project_manager_id: users[4].id, // David Wilson
        budget: 120000.00,
        company_id: companies[0].id
      },
      {
        name: 'Website Redesign Project',
        description: 'Complete website overhaul with modern design principles',
        start_date: new Date('2024-02-15'),
        end_date: new Date('2024-05-30'),
        status: 'On Hold',
        project_manager_id: users[3].id, // Emma Davis
        budget: 45000.00,
        company_id: companies[0].id
      }
    ]);

    // Create Project Members
    console.log('👤 Adding project members...');
    await ProjectMember.bulkCreate([
      // E-commerce Platform Development team
      { project_id: projects[0].id, user_id: users[6].id }, // Alex Rodriguez
      { project_id: projects[0].id, user_id: users[8].id }, // Tom Anderson
      { project_id: projects[0].id, user_id: users[9].id }, // Jessica Taylor

      // Mobile App UI/UX Design team
      { project_id: projects[1].id, user_id: users[7].id }, // Rachel Green
      { project_id: projects[1].id, user_id: users[9].id }, // Jessica Taylor

      // Data Analytics Dashboard team
      { project_id: projects[2].id, user_id: users[6].id }, // Alex Rodriguez
      { project_id: projects[2].id, user_id: users[8].id }, // Tom Anderson

      // CRM System Integration team
      { project_id: projects[3].id, user_id: users[9].id }, // Jessica Taylor
      { project_id: projects[3].id, user_id: users[6].id }, // Alex Rodriguez

      // Website Redesign Project team
      { project_id: projects[4].id, user_id: users[7].id }  // Rachel Green
    ]);

    // Create Tasks
    console.log('✅ Creating tasks...');
    const tasks = await Task.bulkCreate([
      // E-commerce Platform Development tasks
      {
        title: 'Set up project infrastructure',
        description: 'Initialize Git repository, set up development environment',
        due_date: new Date('2024-01-30'),
        priority: 'High',
        status: 'Done',
        assignee_id: users[6].id,
        project_id: projects[0].id,
        estimated_hours: 16
      },
      {
        title: 'Design database schema',
        description: 'Create ERD and implement database tables',
        due_date: new Date('2024-02-15'),
        priority: 'High',
        status: 'Done',
        assignee_id: users[8].id,
        project_id: projects[0].id,
        estimated_hours: 24
      },
      {
        title: 'Implement user authentication',
        description: 'Build login/signup functionality with JWT',
        due_date: new Date('2024-03-01'),
        priority: 'High',
        status: 'In Progress',
        assignee_id: users[6].id,
        project_id: projects[0].id,
        estimated_hours: 32
      },
      {
        title: 'Build product catalog',
        description: 'Create product listing and search functionality',
        due_date: new Date('2024-03-20'),
        priority: 'Medium',
        status: 'New',
        assignee_id: users[9].id,
        project_id: projects[0].id,
        estimated_hours: 40
      },

      // Mobile App UI/UX Design tasks
      {
        title: 'User research and personas',
        description: 'Conduct user interviews and create user personas',
        due_date: new Date('2024-02-10'),
        priority: 'High',
        status: 'Done',
        assignee_id: users[7].id,
        project_id: projects[1].id,
        estimated_hours: 20
      },
      {
        title: 'Wireframe creation',
        description: 'Create low-fidelity wireframes for all screens',
        due_date: new Date('2024-02-25'),
        priority: 'High',
        status: 'In Progress',
        assignee_id: users[7].id,
        project_id: projects[1].id,
        estimated_hours: 30
      },
      {
        title: 'Visual design mockups',
        description: 'Create high-fidelity visual designs',
        due_date: new Date('2024-03-15'),
        priority: 'Medium',
        status: 'New',
        assignee_id: users[9].id,
        project_id: projects[1].id,
        estimated_hours: 35
      },

      // Data Analytics Dashboard tasks (Completed project)
      {
        title: 'Data source integration',
        description: 'Connect to various data sources and APIs',
        due_date: new Date('2024-01-20'),
        priority: 'High',
        status: 'Done',
        assignee_id: users[6].id,
        project_id: projects[2].id,
        estimated_hours: 28
      },
      {
        title: 'Chart implementation',
        description: 'Implement various chart types using D3.js',
        due_date: new Date('2024-02-10'),
        priority: 'Medium',
        status: 'Done',
        assignee_id: users[8].id,
        project_id: projects[2].id,
        estimated_hours: 36
      }
    ]);

    // Create Timesheets
    console.log('⏰ Creating timesheets...');
    const timesheets = [];
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-03-15');

    // Generate random timesheets for completed and in-progress tasks
    for (let i = 0; i < 150; i++) {
      const randomDate = getRandomDate(startDate, endDate);
      const randomTask = tasks[Math.floor(Math.random() * 6)]; // First 6 tasks that have progress
      const randomHours = Math.random() * 8 + 1; // 1-9 hours
      const isBillable = Math.random() > 0.3; // 70% chance of being billable

      timesheets.push({
        user_id: randomTask.assignee_id,
        task_id: randomTask.id,
        hours_logged: parseFloat(randomHours.toFixed(2)),
        log_date: randomDate,
        description: `Working on ${randomTask.title}`,
        is_billable: isBillable
      });
    }

    await Timesheet.bulkCreate(timesheets);

    // Create Sales Orders
    console.log('🛒 Creating sales orders...');
    await SalesOrder.bulkCreate([
      {
        so_number: 'SO-2024-0001',
        customer_name: 'Acme Corporation',
        customer_email: 'procurement@acme.com',
        customer_phone: '+1 (555) 111-2222',
        order_date: new Date('2024-01-10'),
        delivery_date: new Date('2024-06-30'),
        status: 'Confirmed',
        total_amount: 150000.00,
        description: 'E-commerce platform development services',
        project_id: projects[0].id
      },
      {
        so_number: 'SO-2024-0002',
        customer_name: 'StartUp Tech',
        customer_email: 'ceo@startup.tech',
        customer_phone: '+1 (555) 222-3333',
        order_date: new Date('2024-02-01'),
        delivery_date: new Date('2024-05-15'),
        status: 'Confirmed',
        total_amount: 75000.00,
        description: 'Mobile app UI/UX design services',
        project_id: projects[1].id
      },
      {
        so_number: 'SO-2024-0003',
        customer_name: 'Data Insights Ltd',
        customer_email: 'orders@datainsights.com',
        order_date: new Date('2024-01-05'),
        delivery_date: new Date('2024-04-30'),
        status: 'Billed',
        total_amount: 95000.00,
        description: 'Analytics dashboard development',
        project_id: projects[2].id
      }
    ]);

    // Create Customer Invoices
    console.log('📄 Creating customer invoices...');
    await CustomerInvoice.bulkCreate([
      {
        invoice_number: 'INV-2024-001',
        customer_name: 'Acme Corporation',
        customer_email: 'accounts@acme.com',
        invoice_date: new Date('2024-01-15'),
        due_date: new Date('2024-02-15'),
        amount: 50000.00,
        status: 'Paid',
        description: 'Phase 1 - Project setup and initial development',
        project_id: projects[0].id,
        sales_order_id: 1
      },
      {
        invoice_number: 'INV-2024-002',
        customer_name: 'Data Insights Ltd',
        customer_email: 'billing@datainsights.com',
        invoice_date: new Date('2024-04-30'),
        due_date: new Date('2024-05-30'),
        amount: 95000.00,
        status: 'Sent',
        description: 'Final payment - Analytics dashboard completion',
        project_id: projects[2].id,
        sales_order_id: 3
      },
      {
        invoice_number: 'INV-2024-003',
        customer_name: 'StartUp Tech',
        customer_email: 'finance@startup.tech',
        invoice_date: new Date('2024-02-15'),
        due_date: new Date('2024-03-15'),
        amount: 25000.00,
        status: 'Draft',
        description: 'Phase 1 - User research and wireframes',
        project_id: projects[1].id,
        sales_order_id: 2
      }
    ]);

    // Create Purchase Orders
    console.log('📦 Creating purchase orders...');
    await PurchaseOrder.bulkCreate([
      {
        po_number: 'PO-2024-001',
        vendor_name: 'Cloud Hosting Solutions',
        vendor_email: 'sales@cloudhosting.com',
        vendor_phone: '+1 (555) 444-5555',
        order_date: new Date('2024-01-20'),
        expected_delivery: new Date('2024-01-25'),
        status: 'Billed',
        total_amount: 2400.00,
        description: 'Annual cloud hosting services',
        project_id: projects[0].id
      },
      {
        po_number: 'PO-2024-002',
        vendor_name: 'Software Licensing Corp',
        vendor_email: 'licensing@softwarecorp.com',
        order_date: new Date('2024-02-01'),
        expected_delivery: new Date('2024-02-05'),
        status: 'Confirmed',
        total_amount: 5000.00,
        description: 'Design software licenses',
        project_id: projects[1].id
      }
    ]);

    // Create Vendor Bills
    console.log('📋 Creating vendor bills...');
    await VendorBill.bulkCreate([
      {
        bill_number: 'BILL-2024-001',
        vendor_name: 'Cloud Hosting Solutions',
        vendor_email: 'billing@cloudhosting.com',
        bill_date: new Date('2024-01-25'),
        due_date: new Date('2024-02-25'),
        amount: 2400.00,
        status: 'Paid',
        description: 'Cloud hosting services - Q1 2024',
        project_id: projects[0].id,
        purchase_order_id: 1
      },
      {
        bill_number: 'BILL-2024-002',
        vendor_name: 'Software Licensing Corp',
        vendor_email: 'accounts@softwarecorp.com',
        bill_date: new Date('2024-02-05'),
        due_date: new Date('2024-03-05'),
        amount: 5000.00,
        status: 'Submitted',
        description: 'Annual software licenses',
        project_id: projects[1].id,
        purchase_order_id: 2
      }
    ]);

    // Create Expenses
    console.log('💰 Creating expenses...');
    await Expense.bulkCreate([
      {
        description: 'Client meeting lunch',
        amount: 85.50,
        expense_date: new Date('2024-02-10'),
        category: 'Meals',
        status: 'Approved',
        receipt_url: '/uploads/receipts/lunch_receipt_001.pdf',
        notes: 'Business lunch with Acme Corporation stakeholders',
        user_id: users[2].id, // Mike Chen
        project_id: projects[0].id
      },
      {
        description: 'Conference attendance',
        amount: 1250.00,
        expense_date: new Date('2024-02-05'),
        category: 'Training',
        status: 'Reimbursed',
        receipt_url: '/uploads/receipts/conference_receipt_001.pdf',
        notes: 'UX Design Conference 2024',
        user_id: users[7].id, // Rachel Green
        project_id: projects[1].id
      },
      {
        description: 'Travel to client site',
        amount: 320.00,
        expense_date: new Date('2024-02-12'),
        category: 'Travel',
        status: 'Pending',
        notes: 'Round trip flight for project kickoff meeting',
        user_id: users[6].id, // Alex Rodriguez
        project_id: projects[0].id
      },
      {
        description: 'Office supplies',
        amount: 45.75,
        expense_date: new Date('2024-02-08'),
        category: 'Office Supplies',
        status: 'Approved',
        receipt_url: '/uploads/receipts/supplies_receipt_001.pdf',
        notes: 'Notebooks, pens, and sticky notes',
        user_id: users[8].id, // Tom Anderson
        project_id: projects[2].id
      },
      {
        description: 'Software subscription',
        amount: 199.00,
        expense_date: new Date('2024-01-30'),
        category: 'Software',
        status: 'Rejected',
        notes: 'Personal software subscription - not approved for reimbursement',
        user_id: users[9].id, // Jessica Taylor
        project_id: projects[3].id
      }
    ]);

    // Create Notifications
    console.log('🔔 Creating notifications...');
    await Notification.bulkCreate([
      {
        title: 'New project assigned',
        message: 'You have been assigned as project manager for E-commerce Platform Development',
        type: 'info',
        is_read: true,
        user_id: users[2].id
      },
      {
        title: 'Task due soon',
        message: 'Task "Implement user authentication" is due in 2 days',
        type: 'warning',
        is_read: false,
        user_id: users[6].id
      },
      {
        title: 'Expense approved',
        message: 'Your expense "Client meeting lunch" has been approved',
        type: 'success',
        is_read: false,
        user_id: users[2].id
      },
      {
        title: 'Invoice payment received',
        message: 'Payment received for Invoice INV-2024-001',
        type: 'success',
        is_read: true,
        user_id: users[5].id
      },
      {
        title: 'Project milestone reached',
        message: 'Data Analytics Dashboard project has been completed',
        type: 'success',
        is_read: false,
        user_id: users[2].id
      }
    ]);

    console.log('✅ Test data seeding completed successfully!');
    console.log(`
📊 Summary of created test data:
• ${companies.length} Company (OneFlow Solutions - all data in single company)
• ${users.length} Users (including Juli Kyada)
• ${projects.length} Projects
• ${tasks.length} Tasks
• ${timesheets.length} Timesheet entries
• 3 Sales Orders
• 3 Customer Invoices
• 2 Purchase Orders
• 2 Vendor Bills
• 5 Expenses
• 5 Notifications

🔐 Login credentials for testing:
Admin: john.smith@oneflow.com / password123
Admin: sarah.johnson@oneflow.com / password123
Admin: julikyada293@gmail.com / password123
PM: mike.chen@oneflow.com / password123
Sales: lisa.brown@oneflow.com / password123
Team: alex.rodriguez@oneflow.com / password123
    `);

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  }
};

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedTestData()
    .then(() => {
      console.log('🎉 Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedTestData;
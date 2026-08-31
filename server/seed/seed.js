require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Client = require('../models/Client');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Invoice = require('../models/Invoice');
const Message = require('../models/Message');
const TimeEntry = require('../models/TimeEntry');
const File = require('../models/File');

const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const run = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Client.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    Invoice.deleteMany({}),
    Message.deleteMany({}),
    TimeEntry.deleteMany({}),
    File.deleteMany({})
  ]);

  console.log('Creating demo user...');
  const user = await User.create({
    name: 'John Doe',
    email: 'john@freelancerportal.com',
    password: 'Demo@1234',
    role: 'Freelancer',
    phone: '+1 (555) 012-3456',
    currency: 'USD',
    timezone: 'America/New_York'
  });

  console.log('Creating clients...');
  const clientData = [
    { name: 'Sarah Ahmed', email: 'sarah@brightretail.com', company: 'Bright Retail Co.', phone: '+1 555-201-0011', website: 'brightretail.com', status: 'Active' },
    { name: 'Michael Johnson', email: 'michael@johnsonlaw.com', company: 'Johnson & Partners Law', phone: '+1 555-201-0022', website: 'johnsonlaw.com', status: 'Active' },
    { name: 'Lisa Chen', email: 'lisa@chenstudio.com', company: 'Chen Design Studio', phone: '+1 555-201-0033', website: 'chenstudio.com', status: 'Active' },
    { name: 'David Wilson', email: 'david@wilsonfinance.com', company: 'Wilson Finance Group', phone: '+1 555-201-0044', website: 'wilsonfinance.com', status: 'Lead' },
    { name: 'Anna Patel', email: 'anna@patelhealth.com', company: 'Patel Health Clinics', phone: '+1 555-201-0055', website: 'patelhealth.com', status: 'Active' },
    { name: 'Robert Brown', email: 'robert@brownlogistics.com', company: 'Brown Logistics', phone: '+1 555-201-0066', website: 'brownlogistics.com', status: 'Inactive' }
  ];
  const clients = await Client.insertMany(clientData.map((c) => ({ ...c, owner: user._id })));
  const [sarah, michael, lisa, david, anna, robert] = clients;

  console.log('Creating projects...');
  const projectData = [
    { name: 'E-Commerce Website', client: sarah._id, description: 'Full online store with cart, checkout and inventory management.', budget: 8500, startDate: daysAgo(40), deadline: daysFromNow(5), status: 'In Progress', progress: 72, priority: 'High' },
    { name: 'Mobile App UI/UX', client: lisa._id, description: 'iOS and Android app design for a design studio booking platform.', budget: 6200, startDate: daysAgo(25), deadline: daysFromNow(18), status: 'In Progress', progress: 45, priority: 'Medium' },
    { name: 'Admin Dashboard', client: michael._id, description: 'Internal case-management dashboard for the law firm.', budget: 5400, startDate: daysAgo(60), deadline: daysAgo(5), status: 'Completed', progress: 100, priority: 'Medium' },
    { name: 'Shopify Store Setup', client: anna._id, description: 'Storefront setup, theme customization and product catalog import.', budget: 2100, startDate: daysAgo(10), deadline: daysFromNow(9), status: 'In Progress', progress: 30, priority: 'Low' },
    { name: 'API Integration', client: robert._id, description: 'Integrate third-party logistics API with existing systems.', budget: 3800, startDate: daysFromNow(3), deadline: daysFromNow(30), status: 'Pending', progress: 0, priority: 'High' },
    { name: 'Landing Page Design', client: david._id, description: 'High-converting landing page for a new financial product launch.', budget: 1500, startDate: daysAgo(3), deadline: daysFromNow(11), status: 'On Hold', progress: 15, priority: 'Low' }
  ];
  const projects = await Project.insertMany(projectData.map((p) => ({ ...p, owner: user._id })));
  const [ecom, mobileApp, adminDash, shopify, apiIntegration, landing] = projects;

  console.log('Creating tasks...');
  const taskData = [
    { title: 'Design product listing page', project: ecom._id, client: sarah._id, priority: 'High', status: 'Completed', dueDate: daysAgo(20) },
    { title: 'Build checkout flow', project: ecom._id, client: sarah._id, priority: 'High', status: 'In Progress', dueDate: daysFromNow(2) },
    { title: 'Integrate Stripe payments', project: ecom._id, client: sarah._id, priority: 'High', status: 'To Do', dueDate: daysFromNow(4) },
    { title: 'Wireframe onboarding flow', project: mobileApp._id, client: lisa._id, priority: 'Medium', status: 'Completed', dueDate: daysAgo(15) },
    { title: 'Design booking calendar screen', project: mobileApp._id, client: lisa._id, priority: 'Medium', status: 'Review', dueDate: daysFromNow(3) },
    { title: 'Prototype in Figma', project: mobileApp._id, client: lisa._id, priority: 'Low', status: 'To Do', dueDate: daysFromNow(10) },
    { title: 'Set up product catalog', project: shopify._id, client: anna._id, priority: 'Medium', status: 'In Progress', dueDate: daysFromNow(5) },
    { title: 'Customize checkout theme', project: shopify._id, client: anna._id, priority: 'Low', status: 'To Do', dueDate: daysFromNow(8) },
    { title: 'Review API documentation', project: apiIntegration._id, client: robert._id, priority: 'High', status: 'To Do', dueDate: daysFromNow(6) },
    { title: 'Draft landing page copy', project: landing._id, client: david._id, priority: 'Low', status: 'In Progress', dueDate: daysFromNow(7) }
  ];
  await Task.insertMany(taskData.map((t) => ({ ...t, owner: user._id, assignee: 'John Doe' })));

  console.log('Creating invoices...');
  const invoiceData = [
    { client: sarah._id, project: ecom._id, items: [{ service: 'Website design & development', quantity: 1, rate: 6500 }], tax: 5, discount: 0, issueDate: daysAgo(30), dueDate: daysAgo(2), status: 'Overdue' },
    { client: lisa._id, project: mobileApp._id, items: [{ service: 'UI/UX design (Phase 1)', quantity: 1, rate: 3100 }], tax: 5, discount: 5, issueDate: daysAgo(15), dueDate: daysFromNow(5), status: 'Pending' },
    { client: michael._id, project: adminDash._id, items: [{ service: 'Dashboard development', quantity: 1, rate: 5400 }], tax: 5, discount: 0, issueDate: daysAgo(20), dueDate: daysAgo(6), status: 'Paid', paidAt: daysAgo(4) },
    { client: anna._id, project: shopify._id, items: [{ service: 'Shopify setup & theming', quantity: 1, rate: 2100 }], tax: 0, discount: 0, issueDate: daysAgo(5), dueDate: daysFromNow(10), status: 'Pending' },
    { client: david._id, project: landing._id, items: [{ service: 'Landing page design', quantity: 1, rate: 1500 }], tax: 5, discount: 10, issueDate: daysAgo(2), dueDate: daysFromNow(12), status: 'Draft' },
    { client: sarah._id, project: ecom._id, items: [{ service: 'Additional revisions', quantity: 6, rate: 75 }], tax: 5, discount: 0, issueDate: daysAgo(8), dueDate: daysFromNow(6), status: 'Pending' }
  ];
  for (let i = 0; i < invoiceData.length; i++) {
    const invoiceNumber = `INV-${String(i + 1).padStart(4, '0')}`;
    await Invoice.create({ ...invoiceData[i], invoiceNumber, owner: user._id });
  }

  console.log('Creating messages...');
  const messageThreads = [
    { client: sarah._id, messages: [
      { sender: 'client', text: 'Hi John, how is the checkout flow coming along?', createdAt: daysAgo(2) },
      { sender: 'user', text: 'Going well! Stripe integration is next, should be done by Friday.', createdAt: daysAgo(2) },
      { sender: 'client', text: 'Sounds great, thank you!', createdAt: daysAgo(1), read: false }
    ]},
    { client: lisa._id, messages: [
      { sender: 'client', text: 'Can you share the latest Figma prototype?', createdAt: daysAgo(3) },
      { sender: 'user', text: 'Sending it over now, check your email.', createdAt: daysAgo(3) }
    ]},
    { client: michael._id, messages: [
      { sender: 'user', text: 'The dashboard project is now complete and invoice has been sent.', createdAt: daysAgo(6) },
      { sender: 'client', text: 'Received, payment processed today.', createdAt: daysAgo(4) }
    ]},
    { client: anna._id, messages: [
      { sender: 'client', text: 'Do we need product photos before you start the catalog?', createdAt: daysAgo(1), read: false }
    ]}
  ];
  for (const thread of messageThreads) {
    for (const m of thread.messages) {
      await Message.create({ ...m, client: thread.client, owner: user._id });
    }
  }

  console.log('Creating time entries...');
  const timeEntryData = [
    { project: ecom._id, description: 'Checkout flow development', startTime: daysAgo(1), durationMinutes: 180, billable: true, source: 'manual' },
    { project: ecom._id, description: 'Bug fixes on cart', startTime: daysAgo(2), durationMinutes: 95, billable: true, source: 'timer' },
    { project: mobileApp._id, description: 'Booking calendar UI', startTime: daysAgo(1), durationMinutes: 150, billable: true, source: 'manual' },
    { project: shopify._id, description: 'Product catalog setup', startTime: daysAgo(3), durationMinutes: 120, billable: true, source: 'manual' },
    { project: adminDash._id, description: 'Final QA pass', startTime: daysAgo(7), durationMinutes: 60, billable: false, source: 'manual' }
  ];
  await TimeEntry.insertMany(timeEntryData.map((t) => ({ ...t, owner: user._id })));

  console.log('\nSeed complete!');
  console.log('----------------------------------------');
  console.log('Demo login credentials:');
  console.log('Email:    john@freelancerportal.com');
  console.log('Password: Demo@1234');
  console.log('----------------------------------------\n');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

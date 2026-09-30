// AURION MOTORS - Comprehensive Fictional Enterprise Business Dataset
// Deterministic data generation with relational integrity across all domains.

export interface Vehicle {
  vehicle_id: string;
  model: string;
  variant: string;
  category: "Hatchback" | "Sedan" | "SUV" | "Electric SUV" | "Electric Sedan" | "Premium" | "Performance";
  fuel_type: "Petrol" | "Diesel" | "Electric" | "Hybrid";
  transmission: "Manual" | "Automatic";
  launch_year: number;
  base_price: number; // in INR
  battery_capacity?: number; // kWh (for EVs)
  range?: number; // km (for EVs)
  seating_capacity: number;
}

export interface Dealership {
  dealership_id: string;
  dealership_name: string;
  city: string;
  state: string;
  region: "South" | "West" | "North" | "East" | "Central";
  manager: string;
  employees: number;
  monthly_target: number; // in units
  annual_target: number; // in units
  current_inventory: number;
}

export interface Customer {
  customer_id: string;
  name: string;
  age: number;
  city: string;
  state: string;
  region: "South" | "West" | "North" | "East" | "Central";
  occupation: string;
  income_band: "Mid" | "Upper-Mid" | "High" | "Ultra-High";
  customer_type: "Individual" | "Corporate" | "Fleet";
  acquisition_channel: "Walk-in" | "Online Portal" | "Referral" | "Corporate Roadshow" | "Digital Ad";
  satisfaction_score: number; // 1.0 - 5.0
}

export interface Employee {
  employee_id: string;
  name: string;
  department: "Sales" | "Service" | "Operations" | "Finance" | "Marketing";
  region: "South" | "West" | "North" | "East" | "Central";
  dealership_id: string;
  dealership: string;
  role: string;
  joining_date: string;
  performance_score: number; // 1 - 100
  sales_target: number; // in units
  sales_achieved: number; // in units
}

export interface SaleRecord {
  sale_id: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  year: number;
  region: "South" | "West" | "North" | "East" | "Central";
  state: string;
  city: string;
  dealership_id: string;
  dealership: string;
  vehicle_id: string;
  model: string;
  variant: string;
  category: Vehicle["category"];
  fuel_type: Vehicle["fuel_type"];
  customer_id: string;
  salesperson_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  final_amount: number;
  payment_method: "Bank Transfer" | "Auto Loan" | "UPI" | "Credit Card" | "Corporate Lease";
  finance_status: "Approved" | "Self-Financed" | "In-Process";
  sales_channel: "Dealer" | "Online" | "Corporate" | "Fleet";
}

export interface InventoryRecord {
  inventory_id: string;
  dealership_id: string;
  dealership: string;
  region: "South" | "West" | "North" | "East" | "Central";
  vehicle_id: string;
  model: string;
  variant: string;
  quantity: number;
  stock_age_days: number;
  status: "In Stock" | "Reserved" | "Sold" | "In Transit";
  arrival_date: string;
}

export interface MonthlyPerformance {
  month: string; // YYYY-MM
  year: number;
  vehicles_sold: number;
  revenue: number; // in INR
  target: number; // in units
  achievement_percentage: number;
  average_transaction_value: number;
  gross_margin: number; // percentage e.g. 17.4
  customer_satisfaction: number; // 1 - 5
  new_customers: number;
}

export interface ServiceRecord {
  service_id: string;
  customer_id: string;
  vehicle_id: string;
  model: string;
  dealership_id: string;
  dealership: string;
  region: "South" | "West" | "North" | "East" | "Central";
  service_date: string;
  service_type: "Regular Service" | "Repair" | "Warranty" | "Accident Repair" | "Battery Service";
  service_cost: number;
  service_duration: number; // hours
  satisfaction_score: number; // 1 - 5
  issue_category: "Periodic Maintenance" | "Software Update" | "Brake Wear" | "Electrical" | "Suspension" | "Battery Health";
  resolved: boolean;
}

export interface MarketingCampaign {
  campaign_id: string;
  campaign_name: string;
  start_date: string;
  end_date: string;
  channel: "Google" | "Social Media" | "Email" | "Dealer Events" | "Outdoor" | "Search";
  region: "South" | "West" | "North" | "East" | "Central" | "National";
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
  revenue_generated: number;
  roi: number; // percentage
}

export interface FinancialRecord {
  transaction_id: string;
  date: string;
  region: "South" | "West" | "North" | "East" | "Central";
  category: "Vehicle Sales" | "Service" | "Marketing" | "Operations" | "Logistics" | "Salaries" | "Facilities" | "Technology";
  type: "Revenue" | "Expense";
  amount: number;
  department: string;
}

// -------------------------------------------------------------
// CATALOG DEFINITIONS
// -------------------------------------------------------------

export const VEHICLE_CATALOG: Vehicle[] = [
  { vehicle_id: "VEH-A1-EX", model: "Aurion A1", variant: "Ex", category: "Hatchback", fuel_type: "Petrol", transmission: "Manual", launch_year: 2021, base_price: 720000, seating_capacity: 5 },
  { vehicle_id: "VEH-A1-PLUS", model: "Aurion A1", variant: "Plus", category: "Hatchback", fuel_type: "Hybrid", transmission: "Automatic", launch_year: 2021, base_price: 890000, seating_capacity: 5 },
  { vehicle_id: "VEH-A3-PRO", model: "Aurion A3", variant: "Pro", category: "Sedan", fuel_type: "Petrol", transmission: "Automatic", launch_year: 2020, base_price: 1250000, seating_capacity: 5 },
  { vehicle_id: "VEH-A3-DSL", model: "Aurion A3", variant: "Turbo D", category: "Sedan", fuel_type: "Diesel", transmission: "Manual", launch_year: 2020, base_price: 1380000, seating_capacity: 5 },
  { vehicle_id: "VEH-A5-LUX", model: "Aurion A5", variant: "Executive", category: "Sedan", fuel_type: "Hybrid", transmission: "Automatic", launch_year: 2022, base_price: 1880000, seating_capacity: 5 },
  { vehicle_id: "VEH-A7-ULT", model: "Aurion A7", variant: "Grand Prestige", category: "Premium", fuel_type: "Hybrid", transmission: "Automatic", launch_year: 2023, base_price: 2850000, seating_capacity: 5 },
  { vehicle_id: "VEH-X1-EXP", model: "Aurion X1", variant: "Explore", category: "SUV", fuel_type: "Petrol", transmission: "Manual", launch_year: 2022, base_price: 1120000, seating_capacity: 5 },
  { vehicle_id: "VEH-X1-AWD", model: "Aurion X1", variant: "Terra AWD", category: "SUV", fuel_type: "Diesel", transmission: "Automatic", launch_year: 2022, base_price: 1390000, seating_capacity: 5 },
  { vehicle_id: "VEH-X3-PRO", model: "Aurion X3", variant: "Titanium", category: "SUV", fuel_type: "Petrol", transmission: "Automatic", launch_year: 2021, base_price: 1690000, seating_capacity: 5 },
  { vehicle_id: "VEH-X3-HYB", model: "Aurion X3", variant: "EcoDrive", category: "SUV", fuel_type: "Hybrid", transmission: "Automatic", launch_year: 2021, base_price: 1890000, seating_capacity: 5 },
  { vehicle_id: "VEH-X5-ULT", model: "Aurion X5", variant: "Command 7-Seat", category: "SUV", fuel_type: "Diesel", transmission: "Automatic", launch_year: 2020, base_price: 2640000, seating_capacity: 7 },
  { vehicle_id: "VEH-X5-PET", model: "Aurion X5", variant: "Alpha Elite", category: "SUV", fuel_type: "Petrol", transmission: "Automatic", launch_year: 2020, base_price: 2580000, seating_capacity: 7 },
  { vehicle_id: "VEH-E1-EV", model: "Aurion E1", variant: "Aero Electric", category: "Electric Sedan", fuel_type: "Electric", transmission: "Automatic", launch_year: 2023, base_price: 1950000, battery_capacity: 52, range: 420, seating_capacity: 5 },
  { vehicle_id: "VEH-E3-EV", model: "Aurion E3", variant: "Long Range Plus", category: "Electric Sedan", fuel_type: "Electric", transmission: "Automatic", launch_year: 2024, base_price: 2480000, battery_capacity: 68, range: 510, seating_capacity: 5 },
  { vehicle_id: "VEH-EVX-PRO", model: "Aurion EV-X", variant: "Dual Motor AWD", category: "Electric SUV", fuel_type: "Electric", transmission: "Automatic", launch_year: 2024, base_price: 3250000, battery_capacity: 80, range: 560, seating_capacity: 5 },
  { vehicle_id: "VEH-GT-PERF", model: "Aurion GT", variant: "HyperSport", category: "Performance", fuel_type: "Petrol", transmission: "Automatic", launch_year: 2023, base_price: 4400000, seating_capacity: 4 },
  { vehicle_id: "VEH-PRIME-V", model: "Aurion Prime", variant: "Presidential Edition", category: "Premium", fuel_type: "Electric", transmission: "Automatic", launch_year: 2022, base_price: 3900000, battery_capacity: 75, range: 530, seating_capacity: 5 },
];

export const DEALERSHIPS: Dealership[] = [
  // South
  { dealership_id: "DLR-S01", dealership_name: "Aurion Motors Apex Chennai", city: "Chennai", state: "Tamil Nadu", region: "South", manager: "Rajan Sundaram", employees: 34, monthly_target: 180, annual_target: 2160, current_inventory: 84 },
  { dealership_id: "DLR-S02", dealership_name: "Aurion Silicon Hub Bengaluru", city: "Bengaluru", state: "Karnataka", region: "South", manager: "Arjun Venkat", employees: 42, monthly_target: 230, annual_target: 2760, current_inventory: 96 },
  { dealership_id: "DLR-S03", dealership_name: "Aurion Cyberabad Prime", city: "Hyderabad", state: "Telangana", region: "South", manager: "Kavitha Rao", employees: 36, monthly_target: 190, annual_target: 2280, current_inventory: 78 },
  { dealership_id: "DLR-S04", dealership_name: "Aurion Cochin Coastal Hub", city: "Kochi", state: "Kerala", region: "South", manager: "Mathew Thomas", employees: 24, monthly_target: 120, annual_target: 1440, current_inventory: 52 },
  { dealership_id: "DLR-S05", dealership_name: "Aurion Coimbatore Express", city: "Coimbatore", state: "Tamil Nadu", region: "South", manager: "Dhanush Balan", employees: 20, monthly_target: 95, annual_target: 1140, current_inventory: 44 },
  
  // West
  { dealership_id: "DLR-W01", dealership_name: "Aurion Gateway Mumbai", city: "Mumbai", state: "Maharashtra", region: "West", manager: "Sameer Kulkarni", employees: 45, monthly_target: 240, annual_target: 2880, current_inventory: 110 },
  { dealership_id: "DLR-W02", dealership_name: "Aurion Pune Techpark Centre", city: "Pune", state: "Maharashtra", region: "West", manager: "Aniket Joshi", employees: 32, monthly_target: 160, annual_target: 1920, current_inventory: 68 },
  { dealership_id: "DLR-W03", dealership_name: "Aurion Sabarmati Motors", city: "Ahmedabad", state: "Gujarat", region: "West", manager: "Bhavin Patel", employees: 28, monthly_target: 140, annual_target: 1680, current_inventory: 62 },
  { dealership_id: "DLR-W04", dealership_name: "Aurion Surat Diamond Hub", city: "Surat", state: "Gujarat", region: "West", manager: "Nilesh Mehta", employees: 22, monthly_target: 110, annual_target: 1320, current_inventory: 48 },

  // North
  { dealership_id: "DLR-N01", dealership_name: "Aurion Connaught Capital Delhi", city: "New Delhi", state: "Delhi", region: "North", manager: "Vikram Malhotra", employees: 40, monthly_target: 210, annual_target: 2520, current_inventory: 90 },
  { dealership_id: "DLR-N02", dealership_name: "Aurion Cybercity Gurugram", city: "Gurugram", state: "Delhi", region: "North", manager: "Rohit Bansal", employees: 30, monthly_target: 150, annual_target: 1800, current_inventory: 64 },
  { dealership_id: "DLR-N03", dealership_name: "Aurion Pink City Jaipur", city: "Jaipur", state: "Rajasthan", region: "North", manager: "Rathore Devendra", employees: 24, monthly_target: 115, annual_target: 1380, current_inventory: 50 },
  { dealership_id: "DLR-N04", dealership_name: "Aurion Nawabs Lucknow", city: "Lucknow", state: "Uttar Pradesh", region: "North", manager: "Amitabh Srivastava", employees: 26, monthly_target: 125, annual_target: 1500, current_inventory: 58 },
  { dealership_id: "DLR-N05", dealership_name: "Aurion Noida Express Hub", city: "Noida", state: "Uttar Pradesh", region: "North", manager: "Pooja Sharma", employees: 25, monthly_target: 120, annual_target: 1440, current_inventory: 54 },

  // East
  { dealership_id: "DLR-E01", dealership_name: "Aurion Victoria Kolkata", city: "Kolkata", state: "West Bengal", region: "East", manager: "Subir Chatterjee", employees: 30, monthly_target: 140, annual_target: 1680, current_inventory: 58 },
  { dealership_id: "DLR-E02", dealership_name: "Aurion Howrah Riverside", city: "Howrah", state: "West Bengal", region: "East", manager: "Anirban Sen", employees: 20, monthly_target: 85, annual_target: 1020, current_inventory: 42 },

  // Central
  { dealership_id: "DLR-C01", dealership_name: "Aurion Heart of Bhopal", city: "Bhopal", state: "Madhya Pradesh", region: "Central", manager: "Deepak Verma", employees: 18, monthly_target: 70, annual_target: 840, current_inventory: 35 },
  { dealership_id: "DLR-C02", dealership_name: "Aurion Commercial Indore", city: "Indore", state: "Madhya Pradesh", region: "Central", manager: "Yashwant Patidar", employees: 22, monthly_target: 85, annual_target: 1020, current_inventory: 38 },
];

// Seeded pseudorandom generator (Mulberry32) for 100% deterministic reproducibility
function createPrng(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// -------------------------------------------------------------
// DETERMINISTIC DATA LAYER BUILDER
// -------------------------------------------------------------

function generateCustomers(prng: () => number, count = 600): Customer[] {
  const firstNames = ["Aarav", "Aditi", "Rahul", "Priya", "Vikram", "Sneha", "Karan", "Ananya", "Rohan", "Meera", "Siddharth", "Pooja", "Arjun", "Divya", "Gaurav", "Nisha", "Manish", "Swati", "Suresh", "Lakshmi", "Karthik", "Ritu", "Harish", "Deepa", "Vivek", "Tanvi", "Pranav", "Ishaan", "Sunita", "Tarun"];
  const lastNames = ["Sharma", "Verma", "Patel", "Reddy", "Nair", "Iyer", "Kulkarni", "Deshmukh", "Chatterjee", "Banerjee", "Gupta", "Malhotra", "Mehta", "Bansal", "Rao", "Menon", "Pillai", "Choudhury", "Bhat", "Singh", "Joshi", "Das", "Ghosh", "Agarwal", "Bose"];
  const occupations = ["Software Architect", "Corporate Executive", "Physician", "Chartered Accountant", "Fintech Founder", "Business Owner", "Civil Services", "Logistics Director", "Consultant", "Legal Counsel", "Marketing VP", "University Professor"];
  const incomeBands: Customer["income_band"][] = ["Mid", "Upper-Mid", "High", "Ultra-High"];
  const types: Customer["customer_type"][] = ["Individual", "Individual", "Individual", "Corporate", "Fleet"];
  const channels: Customer["acquisition_channel"][] = ["Walk-in", "Online Portal", "Referral", "Corporate Roadshow", "Digital Ad"];

  const customers: Customer[] = [];
  for (let i = 1; i <= count; i++) {
    const fn = firstNames[Math.floor(prng() * firstNames.length)];
    const ln = lastNames[Math.floor(prng() * lastNames.length)];
    const dlr = DEALERSHIPS[Math.floor(prng() * DEALERSHIPS.length)];
    const custType = types[Math.floor(prng() * types.length)];
    const name = custType === "Corporate" ? `${fn} ${ln} (Tata Consultancy Corp)` : custType === "Fleet" ? `${ln} Logistics Fleet & Mobility` : `${fn} ${ln}`;
    // 5% of accounts have satisfaction below 3.0 (2.1 - 2.9) due to delivery/accessory fitment issues
    const isDissatisfied = prng() < 0.05;
    const baseSat = isDissatisfied ? 2.1 + prng() * 0.8 : 3.6 + prng() * 1.4;

    customers.push({
      customer_id: `CUST-${String(i).padStart(4, "0")}`,
      name,
      age: 25 + Math.floor(prng() * 45),
      city: dlr.city,
      state: dlr.state,
      region: dlr.region,
      occupation: occupations[Math.floor(prng() * occupations.length)],
      income_band: incomeBands[Math.floor(prng() * incomeBands.length)],
      customer_type: custType,
      acquisition_channel: channels[Math.floor(prng() * channels.length)],
      satisfaction_score: Math.round(baseSat * 10) / 10,
    });
  }
  return customers;
}

function generateEmployees(prng: () => number): Employee[] {
  const employees: Employee[] = [];
  const roles = [
    { title: "Senior Sales Consultant", dept: "Sales" as const, target: 85 },
    { title: "Enterprise Fleet Specialist", dept: "Sales" as const, target: 140 },
    { title: "EV Product Specialist", dept: "Sales" as const, target: 75 },
    { title: "Service Advisor", dept: "Service" as const, target: 0 },
    { title: "Master EV Diagnostic Tech", dept: "Service" as const, target: 0 },
    { title: "Operations Lead", dept: "Operations" as const, target: 0 },
  ];

  const firstNames = ["Arvind", "Pallavi", "Rajesh", "Kavya", "Naveen", "Shreya", "Sunil", "Aishwarya", "Ramesh", "Deepika", "Mohan", "Geeta", "Vinay", "Sandhya", "Ashwin", "Rekha"];
  const lastNames = ["Rao", "Natarajan", "Menon", "Bhatnagar", "Sen", "Pawar", "Solanki", "Chauhan", "Dixit", "Trivedi", "Nair", "Venkatesh"];

  let empId = 1;
  DEALERSHIPS.forEach((dlr) => {
    // 5-7 employees per dealership
    const empCount = 6;
    for (let j = 0; j < empCount; j++) {
      const roleObj = roles[j % roles.length];
      const fn = firstNames[(empId * 3) % firstNames.length];
      const ln = lastNames[(empId * 5) % lastNames.length];
      const target = roleObj.target;
      // Some exceed target (>100%), some below
      const performanceFactor = 0.8 + prng() * 0.45;
      const achieved = target > 0 ? Math.round(target * performanceFactor) : 0;
      const score = Math.min(99, Math.max(58, Math.round(72 + (performanceFactor - 1) * 35 + prng() * 10)));

      employees.push({
        employee_id: `EMP-${String(empId).padStart(4, "0")}`,
        name: `${fn} ${ln}`,
        department: roleObj.dept,
        region: dlr.region,
        dealership_id: dlr.dealership_id,
        dealership: dlr.dealership_name,
        role: roleObj.title,
        joining_date: `202${1 + Math.floor(prng() * 3)}-${String(1 + Math.floor(prng() * 12)).padStart(2, "0")}-15`,
        performance_score: score,
        sales_target: target,
        sales_achieved: achieved,
      });
      empId++;
    }
  });

  return employees;
}

function generateSales(
  prng: () => number,
  customers: Customer[],
  employees: Employee[]
): SaleRecord[] {
  // Exact Target Unit totals required for Regional Performance:
  // South: 4,820 units
  // West: 3,910 units
  // North: 2,850 units
  // East: 1,420 units
  // Central: 482 units
  // Total units = 13,482 units across 5,400+ transactions!
  const targetUnitsByRegion: Record<Dealership["region"], number> = {
    South: 4820,
    West: 3910,
    North: 2850,
    East: 1420,
    Central: 482,
  };

  const salesConsultants = employees.filter((e) => e.department === "Sales");
  const sales: SaleRecord[] = [];

  const channels: SaleRecord["sales_channel"][] = ["Dealer", "Dealer", "Dealer", "Online", "Corporate", "Fleet"];
  const paymentMethods: SaleRecord["payment_method"][] = ["Auto Loan", "Auto Loan", "Bank Transfer", "UPI", "Corporate Lease", "Credit Card"];
  const financeStatuses: SaleRecord["finance_status"][] = ["Approved", "Approved", "Self-Financed", "In-Process"];

  const regions: (Dealership["region"])[] = ["South", "West", "North", "East", "Central"];

  let saleCounter = 1;

  regions.forEach((region) => {
    let unitsRemaining = targetUnitsByRegion[region];
    const regionDealerships = DEALERSHIPS.filter((d) => d.region === region);
    const regionEmployees = salesConsultants.filter((e) => e.region === region);
    const regionCustomers = customers.filter((c) => c.region === region);

    while (unitsRemaining > 0) {
      const dlr = regionDealerships[Math.floor(prng() * regionDealerships.length)];
      const veh = VEHICLE_CATALOG[Math.floor(prng() * VEHICLE_CATALOG.length)];
      const cust = regionCustomers.length > 0 ? regionCustomers[Math.floor(prng() * regionCustomers.length)] : customers[Math.floor(prng() * customers.length)];
      const emp = regionEmployees.length > 0 ? regionEmployees[Math.floor(prng() * regionEmployees.length)] : salesConsultants[Math.floor(prng() * salesConsultants.length)];

      let channel: SaleRecord["sales_channel"] = channels[Math.floor(prng() * channels.length)];
      if (cust.customer_type === "Corporate") channel = "Corporate";
      if (cust.customer_type === "Fleet") channel = "Fleet";

      // Quantity logic: Corporate 2-3, Fleet 2-4, Individual 1 (mostly 1 so transaction count exceeds 5,000)
      let qty = 1;
      if (channel === "Corporate") qty = prng() < 0.6 ? 1 : 2;
      else if (channel === "Fleet") qty = prng() < 0.4 ? 2 : 3;
      else qty = 1;

      qty = Math.min(unitsRemaining, Math.max(1, qty));
      unitsRemaining -= qty;

      // Realistic date spanning Jan 2025 - Dec 2026 (24 months)
      const year = prng() < 0.46 ? 2025 : 2026;
      const monthNum = 1 + Math.floor(prng() * 12);
      const dayNum = 1 + Math.floor(prng() * 28);
      const monthStr = `${year}-${String(monthNum).padStart(2, "0")}`;
      const dateStr = `${monthStr}-${String(dayNum).padStart(2, "0")}`;

      const unitPrice = veh.base_price;
      // Discount 2% to 7%
      const discountPct = prng() < 0.35 ? 0 : 0.02 + prng() * 0.05;
      const discount = Math.round(unitPrice * discountPct * qty);
      const finalAmount = unitPrice * qty - discount;

      sales.push({
        sale_id: `SAL-${String(saleCounter).padStart(5, "0")}`,
        date: dateStr,
        month: monthStr,
        year,
        region,
        state: dlr.state,
        city: dlr.city,
        dealership_id: dlr.dealership_id,
        dealership: dlr.dealership_name,
        vehicle_id: veh.vehicle_id,
        model: veh.model,
        variant: veh.variant,
        category: veh.category,
        fuel_type: veh.fuel_type,
        customer_id: cust.customer_id,
        salesperson_id: emp.employee_id,
        quantity: qty,
        unit_price: unitPrice,
        discount,
        final_amount: finalAmount,
        payment_method: paymentMethods[Math.floor(prng() * paymentMethods.length)],
        finance_status: financeStatuses[Math.floor(prng() * financeStatuses.length)],
        sales_channel: channel,
      });

      saleCounter++;
    }
  });

  return sales;
}

function generateInventory(prng: () => number): InventoryRecord[] {
  const inventory: InventoryRecord[] = [];
  let invId = 1;
  const statuses: InventoryRecord["status"][] = ["In Stock", "In Stock", "In Stock", "Reserved", "Sold", "In Transit"];

  DEALERSHIPS.forEach((dlr) => {
    // Generate 40-50 inventory lots per dealership
    const lots = 45;
    for (let i = 0; i < lots; i++) {
      const veh = VEHICLE_CATALOG[Math.floor(prng() * VEHICLE_CATALOG.length)];
      const stockAgeDays = Math.floor(prng() * 120); // 0 to 120 days
      const status = statuses[Math.floor(prng() * statuses.length)];
      const qty = status === "Sold" ? 1 : 1 + Math.floor(prng() * 4);

      inventory.push({
        inventory_id: `INV-${String(invId).padStart(5, "0")}`,
        dealership_id: dlr.dealership_id,
        dealership: dlr.dealership_name,
        region: dlr.region,
        vehicle_id: veh.vehicle_id,
        model: veh.model,
        variant: veh.variant,
        quantity: qty,
        stock_age_days: stockAgeDays,
        status,
        arrival_date: `2026-${String(Math.max(1, 9 - Math.floor(stockAgeDays / 30))).padStart(2, "0")}-10`,
      });
      invId++;
    }
  });

  return inventory;
}

function generateMonthlyPerformance(sales: SaleRecord[]): MonthlyPerformance[] {
  // Aggregate sales by month and combine with targets
  const monthlyMap: Record<string, { units: number; rev: number }> = {};
  
  // Initialize all 24 months: 2025-01 to 2026-12
  for (let y = 2025; y <= 2026; y++) {
    for (let m = 1; m <= 12; m++) {
      const key = `${y}-${String(m).padStart(2, "0")}`;
      monthlyMap[key] = { units: 0, rev: 0 };
    }
  }

  sales.forEach((s) => {
    if (monthlyMap[s.month]) {
      monthlyMap[s.month].units += s.quantity;
      monthlyMap[s.month].rev += s.final_amount;
    }
  });

  const targets: Record<string, number> = {
    "2025-01": 520, "2025-02": 490, "2025-03": 560, "2025-04": 510,
    "2025-05": 530, "2025-06": 480, "2025-07": 540, "2025-08": 550,
    "2025-09": 580, "2025-10": 640, "2025-11": 670, "2025-12": 610,
    "2026-01": 550, "2026-02": 520, "2026-03": 600, "2026-04": 570,
    "2026-05": 580, "2026-06": 540, "2026-07": 610, "2026-08": 630,
    "2026-09": 660, "2026-10": 720, "2026-11": 760, "2026-12": 680,
  };

  const performance: MonthlyPerformance[] = [];

  Object.keys(monthlyMap).sort().forEach((month) => {
    const data = monthlyMap[month];
    const target = targets[month] || 550;
    const year = parseInt(month.split("-")[0]);
    const achievement = Math.round((data.units / target) * 1000) / 10;
    const atv = data.units > 0 ? Math.round(data.rev / data.units) : 1850000;
    // Gross margin has slight variance (16.2% - 19.8%)
    const margin = Math.round((17.2 + ((parseInt(month.split("-")[1]) % 4) - 1.5) * 0.9) * 10) / 10;
    const csat = Math.round((4.3 + ((parseInt(month.split("-")[1]) % 3) * 0.15)) * 10) / 10;

    performance.push({
      month,
      year,
      vehicles_sold: data.units,
      revenue: data.rev,
      target,
      achievement_percentage: achievement,
      average_transaction_value: atv,
      gross_margin: margin,
      customer_satisfaction: Math.min(4.9, csat),
      new_customers: Math.round(data.units * 0.88),
    });
  });

  return performance;
}

function generateServiceRecords(
  prng: () => number,
  customers: Customer[],
  count = 1400
): ServiceRecord[] {
  const serviceTypes: ServiceRecord["service_type"][] = ["Regular Service", "Regular Service", "Repair", "Warranty", "Accident Repair", "Battery Service"];
  const issueCats: ServiceRecord["issue_category"][] = [
    "Periodic Maintenance",
    "Periodic Maintenance",
    "Electrical",
    "Software Update",
    "Brake Wear",
    "Suspension",
    "Battery Health",
  ];

  const serviceRecords: ServiceRecord[] = [];
  for (let i = 1; i <= count; i++) {
    const cust = customers[Math.floor(prng() * customers.length)];
    const dlr = DEALERSHIPS[Math.floor(prng() * DEALERSHIPS.length)];
    const veh = VEHICLE_CATALOG[Math.floor(prng() * VEHICLE_CATALOG.length)];
    const stype = serviceTypes[Math.floor(prng() * serviceTypes.length)];
    const issue = stype === "Battery Service" ? "Battery Health" : issueCats[Math.floor(prng() * issueCats.length)];

    let cost = 4500;
    if (stype === "Repair") cost = 12000 + Math.floor(prng() * 24000);
    else if (stype === "Warranty") cost = 0; // covered under warranty
    else if (stype === "Accident Repair") cost = 38000 + Math.floor(prng() * 65000);
    else if (stype === "Battery Service") cost = 6500 + Math.floor(prng() * 8000);
    else cost = 3500 + Math.floor(prng() * 4500);

    const year = prng() < 0.4 ? 2025 : 2026;
    const month = 1 + Math.floor(prng() * 12);
    const day = 1 + Math.floor(prng() * 28);
    const resolved = prng() > 0.05; // 95% resolved

    serviceRecords.push({
      service_id: `SRV-${String(i).padStart(5, "0")}`,
      customer_id: cust.customer_id,
      vehicle_id: veh.vehicle_id,
      model: veh.model,
      dealership_id: dlr.dealership_id,
      dealership: dlr.dealership_name,
      region: dlr.region,
      service_date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      service_type: stype,
      service_cost: cost,
      service_duration: 1.5 + Math.round(prng() * 6.5 * 10) / 10,
      satisfaction_score: Math.min(5.0, Math.round((3.8 + prng() * 1.2) * 10) / 10),
      issue_category: issue,
      resolved,
    });
  }

  return serviceRecords;
}

function generateMarketingCampaigns(): MarketingCampaign[] {
  return [
    { campaign_id: "CMP-01", campaign_name: "Aurion EV-X National Launch", start_date: "2026-01-10", end_date: "2026-03-31", channel: "Google", region: "National", spend: 12500000, impressions: 8400000, clicks: 310000, leads: 14200, conversions: 420, revenue_generated: 136500000, roi: 992 },
    { campaign_id: "CMP-02", campaign_name: "South Tech Corridor EV Push", start_date: "2025-06-01", end_date: "2025-08-30", channel: "Social Media", region: "South", spend: 4500000, impressions: 3200000, clicks: 140000, leads: 6800, conversions: 210, revenue_generated: 52000000, roi: 1055 },
    { campaign_id: "CMP-03", campaign_name: "Aurion X5 Monsoon Drive Fest", start_date: "2025-07-01", end_date: "2025-09-15", channel: "Dealer Events", region: "West", spend: 3200000, impressions: 850000, clicks: 42000, leads: 3400, conversions: 145, revenue_generated: 38280000, roi: 1096 },
    { campaign_id: "CMP-04", campaign_name: "Capital Festivity Auto Expo", start_date: "2025-10-01", end_date: "2025-11-15", channel: "Outdoor", region: "North", spend: 6800000, impressions: 12400000, clicks: 180000, leads: 8200, conversions: 260, revenue_generated: 54600000, roi: 702 },
    { campaign_id: "CMP-05", campaign_name: "Aurion Prime Executive Showcase", start_date: "2026-02-15", end_date: "2026-04-30", channel: "Email", region: "National", spend: 1100000, impressions: 450000, clicks: 68000, leads: 4100, conversions: 98, revenue_generated: 38220000, roi: 3374 },
    { campaign_id: "CMP-06", campaign_name: "Bengaluru Fleet electrify", start_date: "2026-03-01", end_date: "2026-05-31", channel: "Search", region: "South", spend: 2800000, impressions: 1600000, clicks: 92000, leads: 5200, conversions: 180, revenue_generated: 44640000, roi: 1494 },
    { campaign_id: "CMP-07", campaign_name: "Aurion X3 Road Trip Campaign", start_date: "2025-03-01", end_date: "2025-05-15", channel: "Google", region: "West", spend: 3900000, impressions: 2700000, clicks: 115000, leads: 4900, conversions: 160, revenue_generated: 27040000, roi: 593 },
    { campaign_id: "CMP-08", campaign_name: "East Regional Festive Drive", start_date: "2025-09-15", end_date: "2025-10-31", channel: "Dealer Events", region: "East", spend: 2200000, impressions: 980000, clicks: 38000, leads: 2200, conversions: 82, revenue_generated: 15416000, roi: 600 },
    { campaign_id: "CMP-09", campaign_name: "Central Heartland Expansion", start_date: "2026-04-01", end_date: "2026-06-30", channel: "Outdoor", region: "Central", spend: 1800000, impressions: 1400000, clicks: 29000, leads: 1300, conversions: 45, revenue_generated: 7875000, roi: 337 },
    { campaign_id: "CMP-10", campaign_name: "Aurion GT Performance Thrill Tour", start_date: "2026-05-01", end_date: "2026-07-31", channel: "Social Media", region: "National", spend: 5400000, impressions: 6100000, clicks: 280000, leads: 6400, conversions: 78, revenue_generated: 34320000, roi: 535 },
  ];
}

function generateFinancialRecords(
  prng: () => number,
  sales: SaleRecord[],
  services: ServiceRecord[],
  campaigns: MarketingCampaign[]
): FinancialRecord[] {
  const records: FinancialRecord[] = [];
  let txnId = 1;

  // Monthly aggregated vehicle revenue by region
  const regionRev: Record<string, number> = {};
  sales.forEach((s) => {
    const k = `${s.month}|${s.region}`;
    regionRev[k] = (regionRev[k] || 0) + s.final_amount;
  });

  Object.entries(regionRev).forEach(([k, amt]) => {
    const [month, region] = k.split("|") as [string, Dealership["region"]];
    records.push({
      transaction_id: `FIN-${String(txnId++).padStart(5, "0")}`,
      date: `${month}-28`,
      region,
      category: "Vehicle Sales",
      type: "Revenue",
      amount: amt,
      department: "Commercial Sales",
    });
  });

  // Service revenue by region
  const serviceRev: Record<string, number> = {};
  services.forEach((s) => {
    const m = s.service_date.slice(0, 7);
    const k = `${m}|${s.region}`;
    serviceRev[k] = (serviceRev[k] || 0) + s.service_cost;
  });

  Object.entries(serviceRev).forEach(([k, amt]) => {
    const [month, region] = k.split("|") as [string, Dealership["region"]];
    records.push({
      transaction_id: `FIN-${String(txnId++).padStart(5, "0")}`,
      date: `${month}-28`,
      region,
      category: "Service",
      type: "Revenue",
      amount: amt,
      department: "Aftersales & Service",
    });
  });

  // Operating Expenses across regions (Marketing, Operations, Logistics, Salaries, Facilities, Technology)
  const expenseCategories: FinancialRecord["category"][] = [
    "Salaries",
    "Operations",
    "Logistics",
    "Facilities",
    "Marketing",
    "Technology",
  ];

  const regions: (Dealership["region"])[] = ["South", "West", "North", "East", "Central"];

  for (let y = 2025; y <= 2026; y++) {
    for (let m = 1; m <= 12; m++) {
      const monthStr = `${y}-${String(m).padStart(2, "0")}`;
      regions.forEach((region) => {
        expenseCategories.forEach((cat) => {
          let base = 4000000;
          if (cat === "Salaries") base = region === "South" ? 18000000 : region === "West" ? 15000000 : 10000000;
          else if (cat === "Logistics") base = 8000000;
          else if (cat === "Facilities") base = 6000000;
          else if (cat === "Marketing") base = 5000000;
          else if (cat === "Operations") base = 7000000;
          else base = 3500000;

          const amount = Math.round(base * (0.85 + prng() * 0.3));

          records.push({
            transaction_id: `FIN-${String(txnId++).padStart(5, "0")}`,
            date: `${monthStr}-25`,
            region,
            category: cat,
            type: "Expense",
            amount,
            department: `${cat} Corporate Division`,
          });
        });
      });
    }
  }

  return records;
}

// -------------------------------------------------------------
// SINGLETON DATABASE INSTANCE
// -------------------------------------------------------------

export interface AurionDatabase {
  vehicles: Vehicle[];
  dealerships: Dealership[];
  customers: Customer[];
  employees: Employee[];
  sales: SaleRecord[];
  inventory: InventoryRecord[];
  monthlyPerformance: MonthlyPerformance[];
  serviceRecords: ServiceRecord[];
  marketingCampaigns: MarketingCampaign[];
  financialRecords: FinancialRecord[];
}

let cachedDb: AurionDatabase | null = null;

export function getAurionDatabase(): AurionDatabase {
  if (cachedDb) return cachedDb;

  // Fixed deterministic seed guarantees identical numbers across all reloads
  const prng = createPrng(133742);

  const vehicles = [...VEHICLE_CATALOG];
  const dealerships = [...DEALERSHIPS];
  const customers = generateCustomers(prng, 650);
  const employees = generateEmployees(prng);
  const sales = generateSales(prng, customers, employees);
  const inventory = generateInventory(prng);
  const monthlyPerformance = generateMonthlyPerformance(sales);
  const serviceRecords = generateServiceRecords(prng, customers, 1450);
  const marketingCampaigns = generateMarketingCampaigns();
  const financialRecords = generateFinancialRecords(prng, sales, serviceRecords, marketingCampaigns);

  cachedDb = {
    vehicles,
    dealerships,
    customers,
    employees,
    sales,
    inventory,
    monthlyPerformance,
    serviceRecords,
    marketingCampaigns,
    financialRecords,
  };

  return cachedDb;
}

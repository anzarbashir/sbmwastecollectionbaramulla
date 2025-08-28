
import { type Household, type Payment, PaymentStatus, type Driver, type Helper, StaffRole } from '../types';

const households: Household[] = [];
const TOTAL_HOUSEHOLDS = 2500;
const names = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Saanvi", "Aadhya", "Kiara", "Diya", "Pari", "Ananya", "Riya", "Aarohi", "Amaira", "Myra"];
const surnames = ["Patel", "Sharma", "Singh", "Kumar", "Gupta", "Verma", "Yadav", "Shah", "Mehta", "Joshi"];
const addresses = ["Rose Villa", "Sunshine Apartments", "Greenwood Park", "Riverdale Complex", "Hilltop View", "Ocean Breeze", "Orchid Tower", "Maple Street", "Pinecrest Manor", "Cedar Avenue"];

// Function to get the name of the current month
const getCurrentMonthName = () => new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

// Generate mock data
for (let i = 1; i <= TOTAL_HOUSEHOLDS; i++) {
  const hasPaid = Math.random() > 0.3; // 70% have paid
  const paymentHistory: Payment[] = [];
  const route = Math.random() > 0.5 ? 'Route A' : 'Route B';

  if (hasPaid) {
    paymentHistory.push({
      id: `receipt-${i}-1`,
      date: new Date(new Date().setDate(Math.floor(Math.random() * 15) + 1)), // Payment in first 15 days
      amount: 100,
      month: getCurrentMonthName(),
    });
  }

  households.push({
    id: 1000 + i,
    name: `${names[Math.floor(Math.random() * names.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`,
    address: `${Math.floor(Math.random() * 100) + 1} ${addresses[Math.floor(Math.random() * addresses.length)]}`,
    phone: `987654${(1000 + i).toString().padStart(4, '0')}`,
    paymentHistory: paymentHistory,
    lastCollectionDate: new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 5) + 1)),
    status: hasPaid ? PaymentStatus.Paid : PaymentStatus.Due,
    assignedRoute: route,
  });
}

// Ensure at least one known household for testing
households[0] = {
    id: 1001,
    name: "Test User",
    address: "123 Test Street",
    phone: "9876541001",
    paymentHistory: [{
        id: 'receipt-1001-1',
        date: new Date('2024-07-05'),
        amount: 100,
        month: 'July 2024'
    },{
        id: 'receipt-1001-2',
        date: new Date('2024-06-04'),
        amount: 100,
        month: 'June 2024'
    }],
    lastCollectionDate: new Date(),
    status: PaymentStatus.Paid,
    assignedRoute: 'Route A',
}

const adminCredentials = {
  username: 'Anzar24',
  password: 'Anzar123',
};

const drivers: Driver[] = [
    { id: 1, name: 'Ramesh Kumar', phone: '6006540930', salary: 10000, assignedRoute: 'Route A', vehicleDetails: 'MH-12 AB-1234' },
    { id: 2, name: 'Suresh Patel', phone: '9988776656', salary: 10000, assignedRoute: 'Route B', vehicleDetails: 'MH-14 CD-5678' },
];

const helpers: Helper[] = [
    { id: 1, name: 'Gopal Verma', phone: '8877665544', salary: 7000, assignedRoute: 'Route A' },
    { id: 2, name: 'Manoj Singh', phone: '8877665545', salary: 7000, assignedRoute: 'Route B' },
];


// Simulate API latency
const withLatency = <T,>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), 200));
};

export const getHouseholds = (): Promise<Household[]> => {
  return withLatency([...households]);
};

export const getHouseholdByPhone = (phone: string): Household | undefined => {
  return households.find(h => h.phone === phone);
};

export const getDriverByPhone = (phone: string): Driver | undefined => {
    return drivers.find(d => d.phone === phone);
};

export const getAdminCredentials = () => {
  return adminCredentials;
};

export const updateHousehold = async (updatedHousehold: Household): Promise<Household> => {
    const index = households.findIndex(h => h.id === updatedHousehold.id);
    if (index !== -1) {
        households[index] = updatedHousehold;
        return withLatency(updatedHousehold);
    }
    throw new Error("Household not found");
};

export const addHousehold = async (newHouseholdData: Omit<Household, 'id' | 'paymentHistory' | 'lastCollectionDate' | 'status'>): Promise<Household> => {
    const newHousehold: Household = {
        ...newHouseholdData,
        id: households.length > 0 ? Math.max(...households.map(h => h.id)) + 1 : 1001,
        paymentHistory: [],
        lastCollectionDate: new Date(),
        status: PaymentStatus.Due
    };
    households.push(newHousehold);
    return withLatency(newHousehold);
};

export const registerHousehold = async (data: {name: string, address: string, phone: string, assignedRoute: string}): Promise<Household | null> => {
    const existing = getHouseholdByPhone(data.phone);
    if (existing) {
        throw new Error("Phone number already registered.");
    }
    return addHousehold(data);
};

export const getDrivers = (): Promise<Driver[]> => {
    return withLatency([...drivers]);
};

export const getHelpers = (): Promise<Helper[]> => {
    return withLatency([...helpers]);
};

export const updateStaff = async (updatedStaff: Driver | Helper, role: StaffRole): Promise<Driver | Helper> => {
    const staffList = role === StaffRole.Driver ? drivers : helpers;
    const index = staffList.findIndex(s => s.id === updatedStaff.id);
    if (index !== -1) {
        (staffList as any[])[index] = updatedStaff;
        return withLatency(updatedStaff);
    }
    throw new Error("Staff not found");
};

export const addStaff = async (newStaffData: Omit<Driver, 'id'> | Omit<Helper, 'id'>, role: StaffRole): Promise<Driver | Helper> => {
    const staffList = role === StaffRole.Driver ? drivers : helpers;
    const newStaff: Driver | Helper = {
        ...newStaffData,
        id: staffList.length > 0 ? Math.max(...staffList.map(s => s.id)) + 1 : 1,
    };
    staffList.push(newStaff as any);
    return withLatency(newStaff);
};

export enum UserRole {
  Admin = 'ADMIN',
  Household = 'HOUSEHOLD',
  Driver = 'DRIVER',
}

export interface Payment {
  id: string;
  date: Date;
  amount: number;
  month: string; // e.g., "July 2024"
}

export enum PaymentStatus {
    Paid = 'Paid',
    Due = 'Due'
}

export interface Household {
  id: number;
  name: string;
  address: string;
  phone: string;
  paymentHistory: Payment[];
  lastCollectionDate: Date;
  status: PaymentStatus;
  assignedRoute: string;
}

export interface Admin {
  username: string;
  password?: string; // Optional for security on frontend
}

export enum StaffRole {
    Driver = 'DRIVER',
    Helper = 'HELPER',
}

export interface Staff {
  id: number;
  name: string;
  phone: string;
  salary: number;
  assignedRoute: string;
}

export interface Driver extends Staff {
  vehicleDetails: string; // e.g., "MH-12 AB-1234"
}

export interface Helper extends Staff {}
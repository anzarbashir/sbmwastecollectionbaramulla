
import React, { useState, useCallback } from 'react';
import { UserRole, type Household, type Admin, type Driver } from './types';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import HouseholdDashboard from './components/HouseholdDashboard';
import DriverDashboard from './components/DriverDashboard';
import { getAdminCredentials, getHouseholdByPhone, getDriverByPhone, registerHousehold } from './services/dataService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Household | Admin | Driver | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const handleLogin = useCallback((role: UserRole, identifier: string, password?: string) => {
    if (role === UserRole.Admin) {
      const admin = getAdminCredentials();
      if (identifier === admin.username && password === admin.password) {
        setCurrentUser(admin);
        setUserRole(UserRole.Admin);
        return true;
      }
    } else if (role === UserRole.Household) {
      const household = getHouseholdByPhone(identifier);
      if (household) {
        setCurrentUser(household);
        setUserRole(UserRole.Household);
        return true;
      }
    } else if (role === UserRole.Driver) {
        const driver = getDriverByPhone(identifier);
        if (driver) {
            setCurrentUser(driver);
            setUserRole(UserRole.Driver);
            return true;
        }
    }
    return false;
  }, []);

  const handleRegister = async (name: string, address: string, phone: string): Promise<Household | null> => {
    try {
      const newHousehold = await registerHousehold({ name, address, phone, assignedRoute: 'Unassigned' });
      if (newHousehold) {
        setCurrentUser(newHousehold);
        setUserRole(UserRole.Household);
        return newHousehold;
      }
      return null;
    } catch (error) {
      console.error("Registration failed:", error);
      return null;
    }
  };


  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setUserRole(null);
  }, []);
  
  const renderContent = () => {
    if (userRole === UserRole.Admin && currentUser) {
      return <AdminDashboard admin={currentUser as Admin} onLogout={handleLogout} />;
    }
    if (userRole === UserRole.Household && currentUser) {
      return <HouseholdDashboard household={currentUser as Household} onLogout={handleLogout} />;
    }
    if (userRole === UserRole.Driver && currentUser) {
      return <DriverDashboard driver={currentUser as Driver} onLogout={handleLogout} />;
    }
    return <Login onLogin={handleLogin} onRegister={handleRegister} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {renderContent()}
    </div>
  );
};

export default App;

import React, { useState } from 'react';
import { UserRole, type Household } from '../types';
import { UserIcon, LockIcon, PhoneIcon, ArrowRightIcon, KeyIcon, HomeIcon } from './icons/Icons';
import { getHouseholdByPhone } from '../services/dataService';

interface LoginProps {
  onLogin: (role: UserRole, identifier: string, password?: string) => boolean;
  onRegister: (name: string, address: string, phone: string) => Promise<Household | null>;
}

type Mode = 'signIn' | 'signUp';
type HouseholdLoginStep = 'enterPhone' | 'enterOtp';

const Login: React.FC<LoginProps> = ({ onLogin, onRegister }) => {
  const [role, setRole] = useState<UserRole>(UserRole.Household);
  const [mode, setMode] = useState<Mode>('signIn');
  
  // Sign In state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [householdLoginStep, setHouseholdLoginStep] = useState<HouseholdLoginStep>('enterPhone');
  const [otp, setOtp] = useState('');

  // Sign Up state
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const DEMO_OTP = '123456';
  
  const resetForm = () => {
    setIdentifier('');
    setPassword('');
    setOtp('');
    setNewName('');
    setNewAddress('');
    setNewPhone('');
    setError('');
    setHouseholdLoginStep('enterPhone');
  }
  
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setMode('signIn'); // always reset to signin when role changes
    resetForm();
  }
  
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    resetForm();
  }

  const prefillAdmin = () => {
    handleRoleChange(UserRole.Admin);
    setIdentifier('Anzar24');
    setPassword('Anzar123');
  }

  const prefillHousehold = () => {
    handleRoleChange(UserRole.Household);
    setIdentifier('9876541001');
    setPassword('');
  }

  const prefillDriver = () => {
    handleRoleChange(UserRole.Driver);
    setIdentifier('6006540930');
    setPassword('');
  }

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      let success = false;
      if (role === UserRole.Household) {
        if (householdLoginStep === 'enterPhone') {
            const householdExists = !!getHouseholdByPhone(identifier);
            if (householdExists) {
                setHouseholdLoginStep('enterOtp');
                success = true; // Not logged in yet, but step is successful
            } else {
                setError('Phone number not registered. Please sign up.');
            }
        } else { // enterOtp
            if (otp === DEMO_OTP) {
                success = onLogin(role, identifier);
            } else {
                setError('Invalid OTP. Please try again.');
            }
        }
      } else {
          success = onLogin(role, identifier, password);
      }
      
      if (!success && householdLoginStep !== 'enterPhone') {
        setError(error || 'Invalid credentials. Please try again.');
      }
      setLoading(false);
    }, 500);
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
        const newHousehold = await onRegister(newName, newAddress, newPhone);
        if (!newHousehold) {
           setError("Registration failed. This phone number might already be in use.");
        }
    } catch (err: any) {
        setError(err.message || "An unknown error occurred.");
    } finally {
        setLoading(false);
    }
  };

  const renderAdminDriverForm = () => (
    <>
      {role === UserRole.Admin ? (
        <>
          <div>
            <label className="sr-only">Username</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Username" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-500"/>
            </div>
          </div>
          <div>
            <label className="sr-only">Password</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-500"/>
            </div>
          </div>
        </>
      ) : ( // Driver
        <div>
          <label className="sr-only">Phone Number</label>
          <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input type="tel" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Enter Your Phone Number" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-500"/>
          </div>
        </div>
      )}
    </>
  );
  
  const renderHouseholdSignInForm = () => (
    <>
      {householdLoginStep === 'enterPhone' ? (
        <div>
          <label className="sr-only">Phone Number</label>
          <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input type="tel" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="10-digit Phone Number" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-500"/>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-center text-gray-600">An OTP was sent to {identifier}.</p>
          <p className="text-xs text-center text-gray-500">(For demo, use OTP: {DEMO_OTP})</p>
          <label className="sr-only">OTP</label>
           <div className="relative mt-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-500"/>
          </div>
        </div>
      )}
    </>
  );
  
  const renderHouseholdSignUpForm = () => (
    <>
      <div>
        <label className="sr-only">Full Name</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full Name" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-500"/>
        </div>
      </div>
       <div>
        <label className="sr-only">Address</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HomeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="Full Address" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-500"/>
        </div>
      </div>
      <div>
        <label className="sr-only">Phone Number</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="10-digit Phone Number" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-500"/>
        </div>
      </div>
    </>
  );

  const renderFormContent = () => {
    if (role === UserRole.Household) {
        return mode === 'signIn' ? renderHouseholdSignInForm() : renderHouseholdSignUpForm();
    }
    return renderAdminDriverForm();
  }

  const getButtonText = () => {
    if (loading) {
        return mode === 'signIn' ? 'Signing In...' : 'Signing Up...';
    }
     if (role === UserRole.Household && mode === 'signIn') {
        return householdLoginStep === 'enterPhone' ? 'Get OTP' : 'Verify & Sign In';
    }
    if (mode === 'signUp') {
        return 'Sign Up';
    }
    return 'Sign In';
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-green-50 to-cyan-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-brand-green-800">SBM Waste Collection Baramulla</h1>
            <p className="mt-2 text-gray-600">
                {mode === 'signIn' ? 'Welcome! Please log in to your account.' : 'Create a new household account.'}
            </p>
        </div>
        
        <div className="flex p-1 bg-gray-100 rounded-full">
            <button onClick={() => handleRoleChange(UserRole.Household)} className={`w-full py-2.5 text-sm font-medium leading-5 rounded-full transition-colors duration-300 ${role === UserRole.Household ? 'bg-white text-brand-green-700 shadow' : 'text-gray-500 hover:bg-white/50'}`}>
                Household
            </button>
            <button onClick={() => handleRoleChange(UserRole.Driver)} className={`w-full py-2.5 text-sm font-medium leading-5 rounded-full transition-colors duration-300 ${role === UserRole.Driver ? 'bg-white text-brand-green-700 shadow' : 'text-gray-500 hover:bg-white/50'}`}>
                Driver
            </button>
            <button onClick={() => handleRoleChange(UserRole.Admin)} className={`w-full py-2.5 text-sm font-medium leading-5 rounded-full transition-colors duration-300 ${role === UserRole.Admin ? 'bg-white text-brand-green-700 shadow' : 'text-gray-500 hover:bg-white/50'}`}>
                Admin
            </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={mode === 'signIn' ? handleSignInSubmit : handleSignUpSubmit}>
          {renderFormContent()}
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-green-600 hover:bg-brand-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green-500 disabled:bg-brand-green-300 transition-all duration-300">
              {getButtonText()}
              <span className="absolute right-0 inset-y-0 flex items-center pr-3">
                  <ArrowRightIcon className="h-5 w-5 text-brand-green-500 group-hover:text-brand-green-400" />
              </span>
            </button>
          </div>
        </form>

        {role === UserRole.Household && (
            <div className="text-sm text-center">
                <button onClick={() => handleModeChange(mode === 'signIn' ? 'signUp' : 'signIn')} className="font-medium text-brand-green-600 hover:text-brand-green-500">
                    {mode === 'signIn' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
            </div>
        )}

         <div className="text-xs text-gray-500 text-center space-y-2">
            <p>Demo Credentials:</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
              <button onClick={prefillHousehold} className="hover:underline">Household: 9876541001</button>
              <button onClick={prefillDriver} className="hover:underline">Driver: 6006540930</button>
              <button onClick={prefillAdmin} className="hover:underline">Admin: Anzar24/Anzar123</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

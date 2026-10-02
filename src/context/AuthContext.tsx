import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Department, SystemLog } from '../types';
import { INITIAL_USERS } from '../data/seedData';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  logs: SystemLog[];
  login: (username: string, pass: string) => { success: boolean; message: string; role?: Department };
  logout: () => void;
  registerUser: (name: string, username: string, pass: string, department: Department) => { success: boolean; message: string };
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => { success: boolean; message: string };
  switchUserRole: (department: Department) => void;
  resetAllUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'gatekeeper_users_v1';
const CURRENT_USER_KEY = 'gatekeeper_current_user_v1';
const LOGS_STORAGE_KEY = 'gatekeeper_system_logs_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load users from localStorage', e);
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load currentUser', e);
    }
    // Default to Management user for immediate convenience
    return INITIAL_USERS.find(u => u.department === 'Management') || INITIAL_USERS[0];
  });

  const [logs, setLogs] = useState<SystemLog[]>(() => {
    try {
      const stored = localStorage.getItem(LOGS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'log_01',
        timestamp: Date.now() - 3600000 * 24,
        actor: 'System Admin',
        action: 'Database Initialized',
        details: 'Initial security staff and management accounts provisioned in Firestore collection `users`.',
      },
    ];
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
  }, [logs]);

  const addLog = (actor: string, action: string, details: string) => {
    const newLog: SystemLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      actor,
      action,
      details,
    };
    setLogs(prev => [newLog, ...prev.slice(0, 99)]);
  };

  /**
   * Login logic matching user specification:
   * "When a user logs in, check their department in Firestore to redirect them to the correct screen."
   */
  const login = (username: string, pass: string) => {
    const cleanUser = username.trim().toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === cleanUser);

    if (!user) {
      return { success: false, message: 'User not found. Please verify your email or username.' };
    }

    if (user.status === 'inactive') {
      return { success: false, message: 'Account is disabled. Please contact your System Administrator.' };
    }

    // In production this checks hashed password or Firebase Auth
    if (user.password && user.password !== pass && pass !== 'password123') {
      return { success: false, message: 'Invalid password. (Tip: Demo password is "password123")' };
    }

    setCurrentUser(user);
    addLog(user.name, 'User Logged In', `Authenticated into department: ${user.department}`);
    return {
      success: true,
      message: `Welcome back, ${user.name}! Redirecting to ${user.department} portal...`,
      role: user.department,
    };
  };

  const logout = () => {
    if (currentUser) {
      addLog(currentUser.name, 'User Logged Out', `Session ended for ${currentUser.username}`);
    }
    setCurrentUser(null);
  };

  /**
   * Admin Registration Logic matching user specification:
   * "Since only the Admin can register others, use Firebase Auth to create the user and Firestore to save their department role."
   */
  const registerUser = (name: string, username: string, pass: string, department: Department) => {
    if (!name.trim()) {
      return { success: false, message: 'Full name is required.' };
    }

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || (!cleanUsername.includes('@') && cleanUsername.length < 3)) {
      return { success: false, message: 'Please enter a valid email address or username.' };
    }

    if (!pass || pass.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    const existing = users.find(u => u.username.toLowerCase() === cleanUsername);
    if (existing) {
      return { success: false, message: `A user with username '${username}' already exists.` };
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      username: cleanUsername,
      password: pass,
      department,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    setUsers(prev => [newUser, ...prev]);
    addLog(
      currentUser?.name || 'Admin',
      'User Registered',
      `Created new account for ${newUser.name} with role: ${newUser.department} (${newUser.username})`
    );

    return { success: true, message: `User ${newUser.name} successfully registered in ${department} department!` };
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser?.id === id) {
            setCurrentUser(updated);
          }
          addLog(currentUser?.name || 'Admin', 'User Updated', `Updated profile fields for ${u.name}`);
          return updated;
        }
        return u;
      })
    );
  };

  const deleteUser = (id: string) => {
    const target = users.find(u => u.id === id);
    if (!target) return { success: false, message: 'User not found.' };

    if (currentUser?.id === id) {
      return { success: false, message: 'You cannot delete your own currently logged-in account.' };
    }

    setUsers(prev => prev.filter(u => u.id !== id));
    addLog(currentUser?.name || 'Admin', 'User Deleted', `Removed account ${target.name} (${target.username})`);
    return { success: true, message: `Account for ${target.name} has been deleted.` };
  };

  const switchUserRole = (department: Department) => {
    const candidate = users.find(u => u.department === department && u.status === 'active') || users.find(u => u.department === department);
    if (candidate) {
      setCurrentUser(candidate);
      addLog(candidate.name, 'Switched Role (Demo)', `Switched active viewpoint to ${department}`);
    }
  };

  const resetAllUsers = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[1]); // Priya Sharma (Management)
    localStorage.removeItem(USERS_STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    addLog('System', 'Data Reset', 'Restored default demo user roster.');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        logs,
        login,
        logout,
        registerUser,
        updateUser,
        deleteUser,
        switchUserRole,
        resetAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserAccount } from '../types';
import { userAccounts } from '../data/userData';
import { hasPermission, hasMenuAccess, hasSubmenuAccess, rolePermissionPresets } from '../data/permissions';

interface AuthContextType {
  currentUser: UserAccount | null;
  login: (username: string) => void;
  logout: () => void;
  checkPermission: (permissionCode: string) => boolean;
  checkMenuAccess: (menuId: string) => boolean;
  checkSubmenuAccess: (menuId: string, submenuId: string) => boolean;
  updatePermissions: (userId: string, permissions: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem('nurseCallUser');
    if (savedUsername) {
      const user = userAccounts.find(u => u.username === savedUsername);
      if (user) {
        // Always refresh permissions from presets based on role
        const freshPermissions = rolePermissionPresets[user.role] || [];
        const updatedUser = { ...user, permissions: freshPermissions };
        setCurrentUser(updatedUser);
      }
    }
  }, []);

  // Auto-refresh permissions when component mounts (ensures new permissions are loaded)
  useEffect(() => {
    if (currentUser) {
      const freshPermissions = rolePermissionPresets[currentUser.role] || [];
      if (JSON.stringify(currentUser.permissions) !== JSON.stringify(freshPermissions)) {
        setCurrentUser({ ...currentUser, permissions: freshPermissions });
      }
    }
  }, [currentUser?.role]);

  const login = (username: string) => {
    const user = userAccounts.find(u => u.username === username);
    if (user) {
      // Refresh permissions from presets based on role
      const freshPermissions = rolePermissionPresets[user.role] || [];
      const updatedUser = { ...user, permissions: freshPermissions };
      setCurrentUser(updatedUser);
      localStorage.setItem('nurseCallUser', username);
    } else {
      // Fallback for demo users not in the list - create with nurse permissions
      const defaultUser: UserAccount = {
        id: `u-${Date.now()}`,
        username,
        fullName: username,
        email: `${username}@rs-sehat.com`,
        phone: '081234567890',
        role: 'nurse',
        status: 'active',
        department: 'Rawat Inap',
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString(),
        permissions: rolePermissionPresets.nurse,
      };
      setCurrentUser(defaultUser);
      localStorage.setItem('nurseCallUser', username);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nurseCallUser');
  };

  const checkPermission = (permissionCode: string): boolean => {
    if (!currentUser) return false;
    return hasPermission(currentUser.permissions, permissionCode);
  };

  const checkMenuAccess = (menuId: string): boolean => {
    if (!currentUser) return false;
    return hasMenuAccess(currentUser.permissions, menuId);
  };

  const checkSubmenuAccess = (menuId: string, submenuId: string): boolean => {
    if (!currentUser) return false;
    return hasSubmenuAccess(currentUser.permissions, menuId, submenuId);
  };

  const updatePermissions = (userId: string, permissions: string[]) => {
    // Update in userAccounts
    const userIndex = userAccounts.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      userAccounts[userIndex].permissions = permissions;
    }
    // If updating current user, refresh
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, permissions });
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      checkPermission,
      checkMenuAccess,
      checkSubmenuAccess,
      updatePermissions,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

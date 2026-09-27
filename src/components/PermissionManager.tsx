import { useState } from 'react';
import { UserAccount } from '../types';
import { allPermissions, getPermissionsByModule, rolePermissionPresets } from '../data/permissions';
import { Shield, Check, X, Save, RotateCcw, Lock, Unlock } from 'lucide-react';

interface PermissionManagerProps {
  account: UserAccount;
  onSave: (permissions: string[]) => void;
  onClose: () => void;
}

export default function PermissionManager({ account, onSave, onClose }: PermissionManagerProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(account.permissions);
  const [expandedModules, setExpandedModules] = useState<string[]>(Object.keys(getPermissionsByModule(allPermissions)));

  const permissionsByModule = getPermissionsByModule(allPermissions);

  const togglePermission = (code: string) => {
    setSelectedPermissions(prev =>
      prev.includes(code) ? prev.filter(p => p !== code) : [...prev, code]
    );
  };

  const toggleModule = (moduleName: string) => {
    const modulePerms = allPermissions.filter(p => p.module === moduleName).map(p => p.code);
    const allSelected = modulePerms.every(p => selectedPermissions.includes(p));

    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(p => !modulePerms.includes(p)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...modulePerms])]);
    }
  };

  const selectAll = () => {
    setSelectedPermissions(allPermissions.map(p => p.code));
  };

  const deselectAll = () => {
    setSelectedPermissions([]);
  };

  const applyPreset = (role: string) => {
    const preset = rolePermissionPresets[role as keyof typeof rolePermissionPresets];
    if (preset) {
      setSelectedPermissions(preset);
    }
  };

  const toggleExpand = (moduleName: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleName) ? prev.filter(m => m !== moduleName) : [...prev, moduleName]
    );
  };

  const getModuleStats = (moduleName: string) => {
    const modulePerms = allPermissions.filter(p => p.module === moduleName);
    const selected = modulePerms.filter(p => selectedPermissions.includes(p.code)).length;
    return { total: modulePerms.length, selected };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Kelola Hak Akses</h2>
                <p className="text-purple-100 text-sm">{account.fullName} - @{account.username}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Aksi Cepat:</span>
            <button
              onClick={selectAll}
              className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 rounded-lg transition-colors flex items-center gap-1"
            >
              <Unlock className="w-3 h-3" /> Pilih Semua
            </button>
            <button
              onClick={deselectAll}
              className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded-lg transition-colors flex items-center gap-1"
            >
              <Lock className="w-3 h-3" /> Hapus Semua
            </button>
            <div className="border-l border-gray-300 dark:border-gray-600 h-6 mx-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Preset Role:</span>
            <button
              onClick={() => applyPreset('admin')}
              className="px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg transition-colors"
            >
              Admin
            </button>
            <button
              onClick={() => applyPreset('head_nurse')}
              className="px-3 py-1.5 text-xs font-medium bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-400 rounded-lg transition-colors"
            >
              Head Nurse
            </button>
            <button
              onClick={() => applyPreset('nurse')}
              className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg transition-colors"
            >
              Perawat
            </button>
            <button
              onClick={() => applyPreset('doctor')}
              className="px-3 py-1.5 text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg transition-colors"
            >
              Dokter
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-800 dark:text-white">{selectedPermissions.length}</span> dari {allPermissions.length} permission dipilih
            </span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-full transition-all duration-300"
                style={{ width: `${(selectedPermissions.length / allPermissions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Permissions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {Object.entries(permissionsByModule).map(([moduleName, perms]) => {
            const stats = getModuleStats(moduleName);
            const isExpanded = expandedModules.includes(moduleName);
            const allModuleSelected = stats.selected === stats.total;
            const someModuleSelected = stats.selected > 0;

            return (
              <div key={moduleName} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {/* Module Header */}
                <button
                  onClick={() => toggleExpand(moduleName)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={allModuleSelected}
                      ref={el => {
                        if (el) el.indeterminate = someModuleSelected && !allModuleSelected;
                      }}
                      onChange={() => toggleModule(moduleName)}
                      onClick={e => e.stopPropagation()}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-800 dark:text-white">{moduleName}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {stats.selected} dari {stats.total} permission
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Module Permissions */}
                {isExpanded && (
                  <div className="p-3 bg-white dark:bg-gray-800 space-y-2">
                    {perms.map(perm => {
                      const isSelected = selectedPermissions.includes(perm.code);
                      return (
                        <label
                          key={perm.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePermission(perm.code)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{perm.icon}</span>
                              <span className="font-medium text-sm text-gray-800 dark:text-white">{perm.name}</span>
                              {perm.submenu && (
                                <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                  {perm.submenu}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{perm.description}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">{perm.code}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
          <button
            onClick={() => setSelectedPermissions(account.permissions)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() => onSave(selectedPermissions)}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Simpan Hak Akses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

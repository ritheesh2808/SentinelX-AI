import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

export const ProfileSettingsPage: React.FC = () => {
  const { logout } = useAuth();
  
  // Profile form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Delete account modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Load current user profile from backend on mount
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        setFullName(response.data.fullName);
        setEmail(response.data.email);
      } catch (err: any) {
        console.error('Failed to load profile settings:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    if (!fullName.trim() || !email.trim()) {
      setProfileError('All profile fields are required');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const response = await api.put('/auth/profile', { fullName, email });
      // Update local storage user object
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        userObj.fullName = response.data.user.fullName;
        userObj.email = response.data.user.email;
        localStorage.setItem('user', JSON.stringify(userObj));
      }
      setProfileSuccess('Profile metadata updated successfully.');
    } catch (err: any) {
      console.error(err);
      setProfileError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      setPasswordError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    if (deleteConfirmationText !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm account removal');
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete('/auth/account');
      setIsDeleteModalOpen(false);
      logout(); // Logs user out and redirects to /login
    } catch (err: any) {
      console.error(err);
      setDeleteError(err.response?.data?.error || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#f8fafc]">Account Settings</h1>
        <p className="mt-2 text-sm text-[#94a3b8]">
          Manage your analyst profile, password keys, and system parameters
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile Card */}
        <div className="rounded-xl border border-[#1e293b] bg-[#131c2e] p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-[#f8fafc] mb-4">Edit Profile Metadata</h2>
          
          {profileSuccess && (
            <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
              {profileSuccess}
            </div>
          )}

          {profileError && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {profileError}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#94a3b8]">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-[#1e293b] bg-[#0b0f19] px-4 py-2 text-sm text-[#f8fafc] placeholder-[#475569] outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94a3b8]">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-[#1e293b] bg-[#0b0f19] px-4 py-2 text-sm text-[#f8fafc] placeholder-[#475569] outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#818cf8] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="rounded-xl border border-[#1e293b] bg-[#131c2e] p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-[#f8fafc] mb-4">Change Password</h2>

          {passwordSuccess && (
            <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
              {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#94a3b8]">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full rounded-lg border border-[#1e293b] bg-[#0b0f19] px-4 py-2 text-sm text-[#f8fafc] placeholder-[#475569] outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94a3b8]">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full rounded-lg border border-[#1e293b] bg-[#0b0f19] px-4 py-2 text-sm text-[#f8fafc] placeholder-[#475569] outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94a3b8]">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full rounded-lg border border-[#1e293b] bg-[#0b0f19] px-4 py-2 text-sm text-[#f8fafc] placeholder-[#475569] outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#818cf8] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isUpdatingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Account Deletion Card */}
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 shadow-lg mt-6">
        <h2 className="text-xl font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-sm text-[#94a3b8] mb-4">
          Permanently delete this SentinelX AI analyst profile and purge all scanned host, service, port, and security logs. This action is irreversible.
        </p>

        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-red-600 active:scale-[0.98] transition-all"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-red-500/30 bg-[#131c2e] p-6 shadow-2xl relative animate-fade-in">
            <h3 className="text-lg font-bold text-red-400 mb-4">Permanently Delete Account?</h3>
            <p className="text-sm text-[#94a3b8] mb-4 leading-relaxed">
              All scans, vulnerabilities, assets, and audit logs will be purged. Please type <span className="font-bold text-[#f8fafc]">DELETE</span> below to confirm.
            </p>

            {deleteError && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400 text-center">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="Type DELETE here"
                className="w-full rounded-lg border border-red-500/20 bg-[#0b0f19] px-4 py-2 text-sm text-[#f8fafc] placeholder-[#475569] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteConfirmationText('');
                    setDeleteError(null);
                  }}
                  className="rounded-lg border border-[#1e293b] bg-transparent px-4 py-2 text-sm text-[#94a3b8] hover:text-[#f8fafc]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Purge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

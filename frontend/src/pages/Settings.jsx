import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { authService } from '../services';
import { Spinner, SectionHeader } from '../components/UI';
import { useTheme } from '../context/ThemeContext';
import { Shield, Bell, Sliders, Lock, Moon, Sun } from 'lucide-react';

export default function Settings() {
  const { addToast } = useOutletContext();
  const { dark, toggle } = useTheme();
  
  const [activeTab, setActiveTab] = useState('security');
  
  // Security Tab States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  // Notification Tab States
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Privacy Tab States
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast?.('New passwords do not match.', 'error');
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      addToast?.('Password updated successfully. Please log in again.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast?.(err.response?.data?.message || 'Failed to update password.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    addToast?.('Preferences saved successfully!', 'success');
  };

  const tabs = [
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'preferences', label: 'Preferences', icon: <Sliders size={18} /> },
    { id: 'privacy', label: 'Privacy', icon: <Lock size={18} /> },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <SectionHeader
        title="Settings"
        description="Manage your account preferences, security credentials, and application experience."
      />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          
          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="card space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Change Password</h3>
                <p className="text-sm text-slate-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
              </div>
              
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="label">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <button type="submit" disabled={saving} className="btn-primary btn mt-2">
                  {saving ? <Spinner size="sm" /> : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="card space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Notification Preferences</h3>
                <p className="text-sm text-slate-500 mt-1">Choose how and when you want to be notified.</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-4 cursor-pointer p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="mt-1">
                    <input type="checkbox" className="w-5 h-5 rounded text-brand-600" checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">Email Notifications</h4>
                    <p className="text-sm text-slate-500">Receive important announcements directly to your university email.</p>
                  </div>
                </label>

                <label className="flex items-start gap-4 cursor-pointer p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="mt-1">
                    <input type="checkbox" className="w-5 h-5 rounded text-brand-600" checked={pushNotifs} onChange={(e) => setPushNotifs(e.target.checked)} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">In-App Push Notifications</h4>
                    <p className="text-sm text-slate-500">Get real-time alerts within the UAIMS dashboard.</p>
                  </div>
                </label>

                <label className="flex items-start gap-4 cursor-pointer p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="mt-1">
                    <input type="checkbox" className="w-5 h-5 rounded text-brand-600" checked={weeklyDigest} onChange={(e) => setWeeklyDigest(e.target.checked)} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">Weekly Digest</h4>
                    <p className="text-sm text-slate-500">A weekly summary of all missed announcements.</p>
                  </div>
                </label>
              </div>
              
              <button onClick={handleSavePreferences} className="btn-primary btn">Save Notification Settings</button>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <div className="card space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">App Preferences</h3>
                <p className="text-sm text-slate-500 mt-1">Customize your UAIMS experience.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Appearance</h4>
                  <button
                    onClick={toggle}
                    className="flex items-center gap-3 w-full sm:w-auto p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {dark ? <Sun size={24} className="text-brand-400" /> : <Moon size={24} className="text-slate-600" />}
                    <div className="text-left">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">{dark ? 'Light Mode' : 'Dark Mode'}</div>
                      <div className="text-xs text-slate-500">Toggle the application theme</div>
                    </div>
                  </button>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Language & Region</h4>
                  <select className="input max-w-md">
                    <option value="en">English (UK)</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
              
              <button onClick={handleSavePreferences} className="btn-primary btn">Save Preferences</button>
            </div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <div className="card space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Privacy Settings</h3>
                <p className="text-sm text-slate-500 mt-1">Control who can see your information.</p>
              </div>

              <div className="space-y-6 max-w-md">
                <div>
                  <label className="label">Profile Visibility</label>
                  <select className="input" value={profileVisibility} onChange={(e) => setProfileVisibility(e.target.value)}>
                    <option value="public">Public (Visible to everyone)</option>
                    <option value="faculty">Faculty Only</option>
                    <option value="class">Classmates Only</option>
                    <option value="private">Private (Only you and admins)</option>
                  </select>
                </div>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">Show Online Status</h4>
                    <p className="text-sm text-slate-500">Let others know when you are active.</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${showOnlineStatus ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'}`} onClick={() => setShowOnlineStatus(!showOnlineStatus)}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${showOnlineStatus ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </label>
              </div>
              
              <button onClick={handleSavePreferences} className="btn-primary btn">Save Privacy Settings</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

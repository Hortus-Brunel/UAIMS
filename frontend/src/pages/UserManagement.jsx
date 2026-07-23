import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { userService, organizationService } from '../services';
import { Spinner, SectionHeader, EmptyState, Pagination, SearchInput, LevelBadge, Modal } from '../components/UI';

const ACCESS_LEVELS = [
  'L0_STUDENT', 'L1_REP', 'L2_DEPT_ADMIN', 'L3_FACULTY_ADMIN', 'L4_UNIVERSITY_ADMIN', 'L5_SUPER_ADMIN'
];

export default function UserManagement() {
  const { addToast } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [promoting, setPromoting] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('');

  // Class memberships management
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [isRep, setIsRep] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.listUsers({ page, limit: 15, search: search || undefined });
      setData(res.data.data);
    } catch {
      addToast?.('Failed to fetch users.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleToggleStatus = async (user) => {
    try {
      await userService.toggleStatus(user.id);
      addToast?.(`User ${user.isActive ? 'deactivated' : 'activated'} successfully.`, 'success');
      fetchUsers();
    } catch (err) {
      addToast?.(err.response?.data?.message || 'Failed to toggle status.', 'error');
    }
  };

  const handleOpenPromote = (user) => {
    setSelectedUser(user);
    setSelectedLevel(user.accessLevel);
    // Fetch classes for assignment if level changes
    if (user.primaryDepartmentId) {
      organizationService.getClasses(user.primaryDepartmentId)
        .then(({ data }) => setClasses(data.data.classes || []))
        .catch(() => {});
    }
  };

  const handlePromote = async () => {
    setPromoting(true);
    try {
      await userService.changeAccessLevel(selectedUser.id, selectedLevel);
      addToast?.('Access level updated successfully.', 'success');
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      addToast?.(err.response?.data?.message || 'Failed to promote user.', 'error');
    } finally {
      setPromoting(false);
    }
  };

  const handleAddClass = async () => {
    if (!selectedClassId) return;
    try {
      await userService.addClassMembership(selectedUser.id, { classId: selectedClassId, isRep });
      addToast?.('Class membership added.', 'success');
      setSelectedClassId('');
      setIsRep(false);
      // Reload user details or reload page
      fetchUsers();
    } catch (err) {
      addToast?.(err.response?.data?.message || 'Failed to add class.', 'error');
    }
  };

  return (
    <div>
      <SectionHeader
        title="User Management"
        description="View users, assign roles/privileges, toggle status, and manage class assignments."
      />

      <div className="flex gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search by name, email, matricule…"
          className="flex-1 max-w-sm"
        />
      </div>

      {loading ? (
        <div className="card space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-2 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/6 ml-auto" />
            </div>
          ))}
        </div>
      ) : data?.users?.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No users found"
          description="Try broadening your search query."
        />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 text-xs uppercase">
                  <th className="px-6 py-4 font-semibold">User Details</th>
                  <th className="px-6 py-4 font-semibold">Student ID</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 dark:text-white">{user.fullName}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{user.matricule}</td>
                    <td className="px-6 py-4">
                      <LevelBadge level={user.accessLevel} />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${user.isActive ? 'badge-green' : 'badge-red'}`}>
                        {user.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenPromote(user)}
                          className="btn btn-secondary btn-sm"
                          id={`manage-roles-btn-${user.matricule}`}
                        >
                          Manage Roles
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`btn btn-sm ${user.isActive ? 'btn-ghost text-red-500 hover:bg-red-50' : 'btn-secondary text-green-600'}`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={data.pagination} onPageChange={setPage} />
        </div>
      )}

      {/* Role Management Modal */}
      <Modal open={!!selectedUser} onClose={() => setSelectedUser(null)} title={`Manage ${selectedUser?.fullName}`}>
        {selectedUser && (
          <div className="space-y-6">
            <div>
              <label className="label">Change Access Role</label>
              <div className="flex gap-2">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="input"
                  id="access-level-select"
                >
                  {ACCESS_LEVELS.map((lvl) => <option key={lvl} value={lvl}>{lvl.replace('_', ' ')}</option>)}
                </select>
                <button
                  onClick={handlePromote}
                  disabled={promoting}
                  className="btn btn-primary"
                  id="confirm-promote-btn"
                >
                  {promoting ? <Spinner size="sm" /> : 'Update Role'}
                </button>
              </div>
            </div>

            {selectedLevel === 'L1_REP' && classes.length > 0 && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                <h4 className="font-semibold text-sm">Assign Class Membership</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Class</label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="input text-sm"
                    >
                      <option value="">Select class…</option>
                      {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.academicYear})</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mt-7">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={isRep}
                        onChange={(e) => setIsRep(e.target.checked)}
                        className="rounded"
                      />
                      <span>Is Class Representative</span>
                    </label>
                  </div>
                </div>
                <button onClick={handleAddClass} className="btn-secondary btn w-full">
                  Assign Member
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

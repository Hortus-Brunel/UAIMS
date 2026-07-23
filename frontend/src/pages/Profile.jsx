import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, organizationService, uploadService } from '../services';
import { Spinner, Avatar, SectionHeader, LevelBadge } from '../components/UI';
import { Camera, Eye, Pencil, X } from 'lucide-react';
import { getApiErrorMessage } from '../utils/apiError';

// ──────────────────────────────────────────────────────────────────────────────
// Lightbox modal for viewing the full-size profile image
// ──────────────────────────────────────────────────────────────────────────────
function AvatarLightbox({ src, name, onClose }) {
  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="relative max-w-lg w-full mx-4">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
          aria-label="Close preview"
        >
          <X size={28} />
        </button>
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
          />
        ) : (
          <div className="w-64 h-64 mx-auto rounded-full bg-brand-600 flex items-center justify-center text-white text-8xl font-bold shadow-2xl select-none">
            {name?.charAt(0).toUpperCase()}
          </div>
        )}
        <p className="text-center text-white/70 text-sm mt-4">{name}</p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Avatar with action menu
// ──────────────────────────────────────────────────────────────────────────────
function AvatarWithMenu({ user, avatarUrl, uploadingAvatar, onView, onModify }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar trigger */}
      <button
        type="button"
        className="relative group cursor-pointer focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="Profile picture options"
      >
        <Avatar user={{ ...user, avatarUrl }} size="xl" />
        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploadingAvatar ? (
            <Spinner size="sm" className="text-white" />
          ) : (
            <Camera size={24} className="text-white" />
          )}
        </div>
      </button>

      {/* Dropdown menu */}
      {open && !uploadingAvatar && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in">
          <button
            type="button"
            onClick={() => { setOpen(false); onView(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <Eye size={16} className="text-brand-500" />
            View Photo
          </button>
          <div className="h-px bg-slate-100 dark:bg-slate-700" />
          <button
            type="button"
            onClick={() => { setOpen(false); onModify(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <Pencil size={16} className="text-brand-500" />
            Change Photo
          </button>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Profile page
// ──────────────────────────────────────────────────────────────────────────────
export default function Profile() {
  const { user, updateUser } = useAuth();
  const { addToast } = useOutletContext();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [primaryFacultyId, setPrimaryFacultyId] = useState(user?.primaryFacultyId || '');
  const [primaryDepartmentId, setPrimaryDepartmentId] = useState(user?.primaryDepartmentId || '');
  const [levelId, setLevelId] = useState(user?.levelId || '');
  const [programmeId, setProgrammeId] = useState(user?.programmeId || '');

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [programmes, setProgrammes] = useState([]);

  useEffect(() => {
    userService.getMe()
      .then(({ data }) => {
        const u = data.data.user;
        setProfileData(u);
        setFullName(u.fullName || '');
        setAvatarUrl(u.avatarUrl || '');
        setPrimaryFacultyId(u.primaryFacultyId || '');
        setPrimaryDepartmentId(u.primaryDepartmentId || '');
        setLevelId(u.levelId || '');
        setProgrammeId(u.programmeId || '');
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));

    organizationService.getFaculties().then(({ data }) => setFaculties(data.data.faculties || [])).catch(() => {});
    organizationService.getAcademicLevels().then(({ data }) => setLevels(data.data.levels || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (primaryFacultyId) {
      organizationService.getDepartments(primaryFacultyId)
        .then(({ data }) => setDepartments(data.data.departments || []))
        .catch(() => setDepartments([]));
    } else {
      setDepartments([]);
    }
  }, [primaryFacultyId]);

  useEffect(() => {
    if (primaryDepartmentId) {
      organizationService.getProgrammes(primaryDepartmentId)
        .then(({ data }) => setProgrammes(data.data.programmes || []))
        .catch(() => setProgrammes([]));
    } else {
      setProgrammes([]);
    }
  }, [primaryDepartmentId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setSaving(true);
    try {
      const payload = {
        fullName,
        primaryFacultyId: primaryFacultyId || undefined,
        primaryDepartmentId: primaryDepartmentId || undefined,
        levelId: levelId || undefined,
        programmeId: programmeId || undefined,
      };
      await userService.updateProfile(user.id, payload);
      updateUser(payload);
      const { data } = await userService.getMe();
      setProfileData(data.data.user);
      addToast?.('Profile updated successfully.', 'success');
    } catch (err) {
      addToast?.(getApiErrorMessage(err, 'Failed to update profile.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast?.('Please select a valid image file.', 'error');
      return;
    }
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await uploadService.uploadFile(formData);
      const newAvatarUrl = data.data.fileUrl;
      const profileResponse = await userService.updateProfile(user.id, { avatarUrl: newAvatarUrl });
      const persistedUrl = profileResponse?.data?.data?.user?.avatarUrl || newAvatarUrl;
      setAvatarUrl(persistedUrl);
      updateUser({ avatarUrl: persistedUrl });
      addToast?.('Profile picture updated!', 'success');
    } catch (err) {
      addToast?.(getApiErrorMessage(err, 'Failed to upload image.'), 'error');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Lightbox */}
      {showLightbox && (
        <AvatarLightbox
          src={avatarUrl}
          name={user?.fullName}
          onClose={() => setShowLightbox(false)}
        />
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      <SectionHeader
        title="My Profile"
        description="View and manage your personal details and academic group memberships."
      />

      {/* Profile banner */}
      <div className="card flex flex-col sm:flex-row items-center gap-6">
        <AvatarWithMenu
          user={user}
          avatarUrl={avatarUrl}
          uploadingAvatar={uploadingAvatar}
          onView={() => setShowLightbox(true)}
          onModify={() => fileInputRef.current?.click()}
        />
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{user?.fullName}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          <div className="flex gap-2 mt-2 justify-center sm:justify-start flex-wrap">
            <span className="badge badge-slate">{user?.matricule}</span>
            <LevelBadge level={user?.accessLevel} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Edit form */}
        <form onSubmit={handleUpdate} className="card space-y-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 border-b pb-2 mb-4 dark:border-slate-800">Edit Details</h3>

          <div>
            <label className="label">Full Name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Faculty</label>
              <select
                className="input"
                value={primaryFacultyId}
                onChange={(e) => { setPrimaryFacultyId(e.target.value); setPrimaryDepartmentId(''); setProgrammeId(''); }}
              >
                <option value="">Select faculty…</option>
                {faculties.map((f) => <option key={f.id} value={f.id}>{f.shortCode} – {f.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Department</label>
              <select
                className="input"
                value={primaryDepartmentId}
                onChange={(e) => { setPrimaryDepartmentId(e.target.value); setProgrammeId(''); }}
                disabled={!primaryFacultyId || departments.length === 0}
              >
                <option value="">Select department…</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Programme</label>
              <select
                className="input"
                value={programmeId}
                onChange={(e) => setProgrammeId(e.target.value)}
                disabled={!primaryDepartmentId || programmes.length === 0}
              >
                <option value="">Select programme…</option>
                {programmes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {!primaryDepartmentId && (
                <p className="text-xs text-slate-400 mt-1">Select a department first.</p>
              )}
            </div>
            <div>
              <label className="label">Academic Level</label>
              <select className="input" value={levelId} onChange={(e) => setLevelId(e.target.value)}>
                <option value="">Select level…</option>
                {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary btn w-full mt-4">
            {saving ? <Spinner size="sm" /> : 'Save Changes'}
          </button>
        </form>

        {/* Memberships */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 border-b pb-2 mb-4 dark:border-slate-800">Academic Memberships</h3>
          {loadingProfile ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            </div>
          ) : (
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>🏛️ <strong>Faculty:</strong> {profileData?.primaryFaculty?.name || 'None assigned'}</p>
              <p>🏢 <strong>Department:</strong> {profileData?.primaryDepartment?.name || 'None assigned'}</p>
              <p>📚 <strong>Academic Level:</strong> {profileData?.level?.name || 'None assigned'}</p>
              <p>📜 <strong>Programme:</strong> {profileData?.programme?.name || 'None assigned'}</p>
              <div className="divider" />
              <div>
                <strong className="block text-xs uppercase text-slate-400 mb-1.5">Class Enrollments</strong>
                {!profileData?.classMemberships?.length ? (
                  <p className="text-xs text-slate-400">Not enrolled in any classes.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profileData.classMemberships.map((m) => (
                      <span key={m.class.id} className="badge badge-blue">
                        {m.class.name} {m.isRep && '(Rep)'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <strong className="block text-xs uppercase text-slate-400 mb-1.5">Club Memberships</strong>
                {!profileData?.clubMemberships?.length ? (
                  <p className="text-xs text-slate-400">Not a member of any clubs.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profileData.clubMemberships.map((m) => (
                      <span key={m.club.id} className="badge badge-blue">
                        {m.club.name} {m.isLeader && '(Leader)'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

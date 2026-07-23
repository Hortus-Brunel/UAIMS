import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { announcementService, organizationService, uploadService } from '../services';
import { Spinner, SectionHeader } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { Paperclip, X } from 'lucide-react';
import { getApiErrorMessage } from '../utils/apiError';

const SCOPE_OPTIONS = [
  { value: 'UNIVERSITY', label: '🌐 Entire University', minLevel: 'L4_UNIVERSITY_ADMIN', hasId: false },
  { value: 'FACULTY',    label: '🏛️ Faculty',           minLevel: 'L3_FACULTY_ADMIN',    hasId: true },
  { value: 'DEPARTMENT', label: '🏢 Department',         minLevel: 'L2_DEPT_ADMIN',       hasId: true },
  { value: 'LEVEL',      label: '📚 Academic Level',     minLevel: 'L2_DEPT_ADMIN',       hasId: true },
  { value: 'PROGRAMME',  label: '📜 Programme',          minLevel: 'L2_DEPT_ADMIN',       hasId: true },
  { value: 'CLASS',      label: '🎓 Class',              minLevel: 'L1_REP',             hasId: true },
  { value: 'CLUB',       label: '⚽ Club',               minLevel: 'L1_REP',             hasId: true },
];

// A standalone component for a single target row with a dynamic scope ID selector
function TargetRow({ index, register, control, remove, canRemove, allowedScopes, orgData }) {
  const scope = useWatch({ control, name: `targets.${index}.scope` });
  const scopeOption = SCOPE_OPTIONS.find((s) => s.value === scope);

  const renderScopeIdInput = () => {
    if (!scopeOption?.hasId) return null;

    let options = [];
    let placeholder = 'Select…';

    if (scope === 'FACULTY') {
      options = orgData.faculties;
      placeholder = '— All Faculties —';
    } else if (scope === 'DEPARTMENT') {
      options = orgData.departments;
      placeholder = '— All Departments —';
    } else if (scope === 'LEVEL') {
      options = orgData.levels;
      placeholder = '— All Levels —';
    } else if (scope === 'PROGRAMME') {
      options = orgData.programmes;
      placeholder = '— All Programmes —';
    } else if (scope === 'CLASS') {
      options = orgData.classes;
      placeholder = '— All Classes —';
    } else if (scope === 'CLUB') {
      options = orgData.clubs;
      placeholder = '— All Clubs —';
    }

    return (
      <div>
        <label className="label">Target ({scope === 'LEVEL' ? 'Level' : scope.charAt(0) + scope.slice(1).toLowerCase()})</label>
        <select className="input" {...register(`targets.${index}.scopeId`)}>
          <option value="">{placeholder}</option>
          {options.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name || item.label}
              {scope === 'DEPARTMENT' && item.faculty ? ` (${item.faculty.shortCode})` : ''}
              {scope === 'PROGRAMME' && item.department ? ` – ${item.department.name}` : ''}
              {scope === 'CLASS' && item.department ? ` (${item.department.name} · ${item.level?.name})` : ''}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">Leave blank to target all members in this scope.</p>
      </div>
    );
  };

  return (
    <div className="flex gap-3 items-start p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="flex-1 grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Scope</label>
          <select className="input" {...register(`targets.${index}.scope`, { required: true })}>
            {allowedScopes.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        {renderScopeIdInput()}
      </div>
      {canRemove && (
        <button
          type="button"
          onClick={remove}
          className="btn-ghost btn-icon mt-6 text-red-400 hover:text-red-600 shrink-0"
          title="Remove target"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default function CreateEditAnnouncement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useOutletContext();
  const { hasLevel } = useAuth();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(!!id);
  const [orgData, setOrgData] = useState({
    categories: [], faculties: [], departments: [], levels: [],
    programmes: [], classes: [], clubs: [],
  });
  const [attachments, setAttachments] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      content: '',
      categoryId: '',
      isPinned: false,
      isImportant: false,
      publishAt: '',
      expiresAt: '',
      targets: [{ scope: 'UNIVERSITY', scopeId: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'targets' });

  // Load all org data at once on mount
  useEffect(() => {
    Promise.all([
      organizationService.getCategories(),
      organizationService.getFaculties(),
      organizationService.getAllDepartments(),
      organizationService.getAcademicLevels(),
      organizationService.getAllProgrammes(),
      organizationService.getAllClasses(),
      organizationService.getClubs(),
    ]).then(([cats, facs, depts, lvls, progs, classes, clubs]) => {
      setOrgData({
        categories: cats.data.data.categories || [],
        faculties: facs.data.data.faculties || [],
        departments: depts.data.data.departments || [],
        levels: lvls.data.data.levels || [],
        programmes: progs.data.data.programmes || [],
        classes: classes.data.data.classes || [],
        clubs: clubs.data.data.clubs || [],
      });
    }).catch(() => {});

    if (id) {
      announcementService.getById(id).then(({ data }) => {
        const a = data.data.announcement;
        reset({
          title: a.title,
          content: a.content,
          categoryId: a.categoryId || '',
          isPinned: a.isPinned,
          isImportant: a.isImportant,
          publishAt: a.publishAt ? a.publishAt.slice(0, 16) : '',
          expiresAt: a.expiresAt ? a.expiresAt.slice(0, 16) : '',
          targets: a.targets?.length
            ? a.targets.map((t) => ({ scope: t.scope, scopeId: t.scopeId || '' }))
            : [{ scope: 'UNIVERSITY', scopeId: '' }],
        });
        if (a.attachments) setAttachments(a.attachments);
      }).catch(() => addToast?.('Failed to load announcement.', 'error'))
        .finally(() => setFetchLoading(false));
    }
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        categoryId: data.categoryId || undefined,
        publishAt: data.publishAt || undefined,
        expiresAt: data.expiresAt || undefined,
        targets: data.targets.map((t) => ({ scope: t.scope, scopeId: t.scopeId || undefined })),
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      if (id) {
        await announcementService.update(id, payload);
        addToast?.('Announcement updated!', 'success');
        navigate(`/announcements/${id}`);
      } else {
        const res = await announcementService.create(payload);
        addToast?.('📢 Announcement published!', 'success');
        navigate(`/announcements/${res.data.data.announcement.id}`);
      }
    } catch (err) {
      addToast?.(getApiErrorMessage(err, 'Failed to save announcement.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await uploadService.uploadFile(formData);
      setAttachments((prev) => [...prev, {
        fileName: data.data.fileName,
        fileUrl: data.data.fileUrl,
        fileType: data.data.fileType,
        fileSizeBytes: data.data.fileSizeBytes,
      }]);
      addToast?.('File attached.', 'success');
    } catch (err) {
      addToast?.(getApiErrorMessage(err, 'Failed to upload file.'), 'error');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const allowedScopes = SCOPE_OPTIONS.filter((s) => !s.minLevel || hasLevel(s.minLevel));

  if (fetchLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <button onClick={() => navigate(-1)} className="btn-ghost btn mb-4 text-slate-500">← Back</button>

      <SectionHeader
        title={id ? 'Edit Announcement' : 'New Announcement'}
        description={id ? 'Update your announcement details.' : 'Create and publish an announcement to your target audience instantly.'}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Content */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300">Content</h3>

          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              placeholder="Announcement title…"
              className={`input ${errors.title ? 'input-error' : ''}`}
              {...register('title', { required: 'Title is required.', minLength: { value: 3, message: 'Min 3 characters.' } })}
            />
            {errors.title && <p className="field-error">{errors.title.message}</p>}
          </div>

          <div>
            <label className="label">Content *</label>
            <textarea
              placeholder="Write your announcement here…"
              rows={8}
              className={`input resize-y ${errors.content ? 'input-error' : ''}`}
              {...register('content', { required: 'Content is required.', minLength: { value: 10, message: 'Min 10 characters.' } })}
            />
            {errors.content && <p className="field-error">{errors.content.message}</p>}
          </div>

          {/* Attachments */}
          <div className="border-t dark:border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Attachments</label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                className="btn-secondary btn btn-sm flex items-center gap-1 text-xs"
              >
                {uploadingFile ? <Spinner size="sm" /> : <Paperclip size={14} />}
                Attach File
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>
            {attachments.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm">
                    <Paperclip size={14} className="text-slate-400" />
                    <span className="truncate max-w-[150px]" title={att.fileName}>{att.fileName}</span>
                    <button type="button" onClick={() => setAttachments((p) => p.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 ml-1">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No files attached. You can attach images, PDFs, etc.</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="label">Category</label>
              <select className="input" {...register('categoryId')}>
                <option value="">No category</option>
                {orgData.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2 justify-end">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="rounded" {...register('isPinned')} />
                <span className="text-slate-700 dark:text-slate-300">📌 Pin this announcement</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="rounded" {...register('isImportant')} />
                <span className="text-slate-700 dark:text-slate-300">❗ Mark as important</span>
              </label>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Schedule publish (optional)</label>
              <input type="datetime-local" className="input" {...register('publishAt')} />
            </div>
            <div>
              <label className="label">Expiration date (optional)</label>
              <input type="datetime-local" className="input" {...register('expiresAt')} />
            </div>
          </div>
        </div>

        {/* Audience Targets */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">Audience Targets</h3>
              <p className="text-xs text-slate-400 mt-0.5">Who should see this announcement?</p>
            </div>
            <button
              type="button"
              onClick={() => append({ scope: allowedScopes[0]?.value || 'UNIVERSITY', scopeId: '' })}
              className="btn-secondary btn btn-sm"
            >
              + Add Target
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <TargetRow
                key={field.id}
                index={index}
                register={register}
                control={control}
                remove={() => remove(index)}
                canRemove={fields.length > 1}
                allowedScopes={allowedScopes}
                orgData={orgData}
              />
            ))}
          </div>

          <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
            <span>💡</span>
            <span>Selecting "All" (blank target) broadcasts to every member in that scope. You can add multiple targets.</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary btn" id="save-announcement-btn">
            {loading ? <Spinner size="sm" /> : id ? '💾 Save Changes' : '📢 Publish Announcement'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary btn">Cancel</button>
        </div>
      </form>
    </div>
  );
}

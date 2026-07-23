import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { organizationService } from '../services';
import { Spinner, SectionHeader, EmptyState, Modal } from '../components/UI';
import { useAuth } from '../context/AuthContext';

export default function Categories() {
  const { addToast } = useOutletContext();
  const { hasLevel } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorHex, setColorHex] = useState('#1b3a6b');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await organizationService.getCategories();
      setCategories(res.data.data.categories || []);
    } catch {
      addToast?.('Failed to load categories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setName('');
    setDescription('');
    setColorHex('#1b3a6b');
    setShowModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
    setColorHex(cat.colorHex || '#1b3a6b');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await organizationService.updateCategory(editId, { name, description, colorHex });
        addToast?.('Category updated.', 'success');
      } else {
        await organizationService.createCategory({ name, description, colorHex });
        addToast?.('Category created.', 'success');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      addToast?.(err.response?.data?.message || 'Failed to save category.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await organizationService.deleteCategory(id);
      addToast?.('Category deleted.', 'success');
      fetchCategories();
    } catch (err) {
      addToast?.(err.response?.data?.message || 'Failed to delete category.', 'error');
    }
  };

  const canCreate = hasLevel('L2_DEPT_ADMIN');
  const canDelete = hasLevel('L4_UNIVERSITY_ADMIN');

  return (
    <div>
      <SectionHeader
        title="Announcement Categories"
        description="Organize announcements with tags, colors, and descriptions."
        action={
          canCreate && (
            <button onClick={handleOpenCreate} className="btn-primary btn">
              + New Category
            </button>
          )
        }
      />

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="skeleton h-5 w-1/3 mb-2" />
              <div className="skeleton h-3 w-5/6" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="No categories configured"
          description="Create categories to help segment announcements."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="card flex flex-col justify-between border-t-4" style={{ borderTopColor: c.colorHex }}>
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-800 dark:text-white">{c.name}</h3>
                  <span
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: c.colorHex }}
                  />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {c.description || 'No description provided.'}
                </p>
              </div>
              <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-slate-50 dark:border-slate-800">
                {canCreate && (
                  <button onClick={() => handleOpenEdit(c)} className="btn-ghost btn-icon text-xs text-slate-400 hover:text-amber-500">✏️</button>
                )}
                {canDelete && (
                  <button onClick={() => handleDelete(c.id)} className="btn-ghost btn-icon text-xs text-slate-400 hover:text-red-500">🗑️</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Creation / Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Category' : 'Create Category'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Category Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Academic, Sports, Exams…"
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what this category represents…"
              rows={3}
              className="input resize-none"
            />
          </div>
          <div>
            <label className="label">Display Color</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="h-10 w-12 rounded border cursor-pointer"
              />
              <span className="text-xs text-slate-400">Choose a distinct color for this tag category.</span>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary btn">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary btn">
              {saving ? <Spinner size="sm" /> : 'Save Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

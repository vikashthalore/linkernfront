import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Plus, Edit, Trash2, Eye, EyeOff, Check, X, Search, Filter, Copy,
  BarChart3, Download, Upload, FileText, Clock, TrendingUp, Star,
  Grid, List, SortAsc, SortDesc, Target, Layers, ChevronDown
} from 'lucide-react';

const PagesManagement = () => {
  const { token } = useSelector(state => state.user);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [selectedPages, setSelectedPages] = useState(new Set());
  const [bulkSelected, setBulkSelected] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [weightFilter, setWeightFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [stats, setStats] = useState(null);

  const [formData, setFormData] = useState({
    title: '', 
    content: '', 
    imageUrl: '', 
    seoKeywords: '', 
    isActive: true,
    category: 'Other', 
    weight: 1, 
    minDisplayTime: 5, 
    metaDescription: '', 
    tags: ''
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const api = useMemo(() => axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }), [token]);

  const categories = [
    'Technology', 'Business', 'Health', 'Entertainment', 'Education', 'Sports',
    'News', 'Lifestyle', 'Finance', 'Travel', 'Food', 'Fashion', 'Other'
  ];

  const weightOptions = [1, 2, 3, 4, 5];

  useEffect(() => {
    fetchPages();
    fetchSelectedPages();
    fetchStats();
  }, []);

  // Re-fetch when filters/sorting change
  useEffect(() => {
    if (!loading) fetchPages();
  }, [searchTerm, filterActive, categoryFilter, weightFilter, sortBy, sortOrder]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sortBy, sortOrder,
        search: searchTerm,
        category: categoryFilter !== 'all' ? categoryFilter : '',
        status: filterActive !== 'all' ? (filterActive === 'active' ? 'true' : 'false') : ''
      });
      const res = await api.get(`/admin/pages?${params}`);
      setPages(res.data.pages || []);
    } catch (err) {
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedPages = async () => {
    try {
      const res = await api.get('/admin/pages/selected/list');
      setSelectedPages(new Set(res.data.selectedPages?.map(p => p._id) || []));
    } catch (err) {
      console.error('Failed to load selected pages');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/pages/stats/overview');
      setStats(res.data.stats);
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    const wordCount = formData.content.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 500) {
      toast.error(`Content must be at least 500 words (Current: ${wordCount})`);
      return;
    }

    try {
      if (editingPage) {
        await api.put(`/admin/pages/${editingPage._id}`, formData);
        toast.success('Page updated successfully!');
      } else {
        await api.post('/admin/pages', formData);
        toast.success('Page created successfully!');
      }
      fetchPages();
      fetchStats();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', content: '', imageUrl: '', seoKeywords: '', isActive: true,
      category: 'Other', weight: 1, minDisplayTime: 5, metaDescription: '', tags: ''
    });
    setEditingPage(null);
    setShowForm(false);
  };

  // FIXED: EDIT PAGE FUNCTION — AB SAB FIELD CORRECTLY LOAD HOGA
  const editPage = (page) => {
    setFormData({
      title: page.title || '',
      content: page.content || '',
      imageUrl: page.imageUrl || '',
      seoKeywords: page.seoKeywords || '',
      metaDescription: page.metaDescription || '',
      tags: page.tags || '',
      category: page.category || 'Other',
      weight: page.weight || 1,
      minDisplayTime: page.minDisplayTime || 5,
      isActive: page.isActive ?? true
    });
    setEditingPage(page);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deletePage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    try {
      await api.delete(`/admin/pages/${id}`);
      toast.success('Page deleted');
      fetchPages();
      fetchStats();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const togglePageSelection = async (pageId) => {
    try {
      await api.post('/admin/pages/selected/toggle', { pageId });
      setSelectedPages(prev => {
        const s = new Set(prev);
        if (s.has(pageId)) s.delete(pageId);
        else s.add(pageId);
        return s;
      });
      toast.success('Selection updated');
    } catch (err) {
      toast.error('Failed to update selection');
    }
  };

  const bulkAddToSelection = async () => {
    if (bulkSelected.size === 0) return toast.error('Select pages first');
    try {
      await api.post('/admin/pages/bulk/select', { pageIds: Array.from(bulkSelected) });
      fetchSelectedPages();
      setBulkSelected(new Set());
      toast.success(`${bulkSelected.size} pages added to selection`);
    } catch (err) {
      toast.error('Bulk operation failed');
    }
  };

  const bulkDelete = async () => {
    if (bulkSelected.size === 0) return toast.error('Select pages first');
    if (!window.confirm(`Delete ${bulkSelected.size} pages permanently?`)) return;
    try {
      await api.post('/admin/pages/bulk/delete', { pageIds: Array.from(bulkSelected) });
      toast.success(`${bulkSelected.size} pages deleted`);
      fetchPages();
      fetchStats();
      setBulkSelected(new Set());
    } catch (err) {
      toast.error('Bulk delete failed');
    }
  };

  const exportPages = async () => {
    try {
      const res = await api.get('/admin/pages/export/all');
      const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pages-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Pages exported successfully!');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  // Keyboard shortcut
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowForm(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const filteredAndSortedPages = useMemo(() => {
    let filtered = pages.filter(page => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        page.title.toLowerCase().includes(search) ||
        (page.content && page.content.toLowerCase().includes(search)) ||
        (page.seoKeywords && page.seoKeywords.toLowerCase().includes(search)) ||
        (page.tags && page.tags.toLowerCase().includes(search));
      
      const matchesActive = filterActive === 'all' || 
        (filterActive === 'active' && page.isActive) ||
        (filterActive === 'inactive' && !page.isActive);
      
      const matchesCategory = categoryFilter === 'all' || page.category === categoryFilter;
      const matchesWeight = weightFilter === 'all' || page.weight === parseInt(weightFilter);

      return matchesSearch && matchesActive && matchesCategory && matchesWeight;
    });

    return filtered.sort((a, b) => {
      let aVal = a[sortBy] || '';
      let bVal = b[sortBy] || '';
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [pages, searchTerm, filterActive, categoryFilter, weightFilter, sortBy, sortOrder]);

  if (loading && pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="p-6 space-y-6">

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-xl shadow-lg">
              <p className="text-sm opacity-90">Total Pages</p>
              <p className="text-3xl font-bold">{stats.totalPages}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-5 rounded-xl shadow-lg">
              <p className="text-sm opacity-90">Active</p>
              <p className="text-3xl font-bold">{stats.activePages}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-5 rounded-xl shadow-lg">
              <p className="text-sm opacity-90">Total Views</p>
              <p className="text-3xl font-bold">
              {Number(stats?.totalViews || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-5 rounded-xl shadow-lg">
              <p className="text-sm opacity-90">Today Clicks</p>
              <p className="text-3xl font-bold">{stats.todayClicks}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Pages Management</h1>
          <div className="flex gap-3">
            <button onClick={exportPages} className="px-5 py-3 border border-gray-300 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition">
              <Download className="h-5 w-5" /> Export
            </button>
            <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition transform hover:scale-105">
              <Plus className="h-5 w-5" /> Create New Page
            </button>
          </div>
        </div>

        {/* Filters, Bulk Actions, View Mode */}
        <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search pages..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-3 w-full border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <select value={filterActive} onChange={e => setFilterActive(e.target.value)} className="px-4 py-3 border rounded-xl">
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-4 py-3 border rounded-xl">
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={weightFilter} onChange={e => setWeightFilter(e.target.value)} className="px-4 py-3 border rounded-xl">
              <option value="all">All Weights</option>
              {weightOptions.map(w => <option key={w} value={w}>Weight {w}</option>)}
            </select>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {bulkSelected.size > 0 && (
                <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-medium">
                  {bulkSelected.size} selected
                </div>
              )}
              {bulkSelected.size > 0 && (
                <div className="flex gap-2">
                  <button onClick={bulkAddToSelection} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                    Add to Selection
                  </button>
                  <button onClick={bulkDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition">
                    Delete Selected
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setViewMode('grid')} className={`p-3 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100'}`}>
                <Grid className="h-5 w-5" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-3 rounded-lg ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100'}`}>
                <List className="h-5 w-5" />
              </button>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
                <option value="createdAt">Date Created</option>
                <option value="updatedAt">Last Updated</option>
                <option value="views">Most Viewed</option>
                <option value="weight">Weight</option>
              </select>
              <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-2">
                {sortOrder === 'asc' ? <SortAsc className="h-5 w-5" /> : <SortDesc className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Pages Grid/List View */}
        {filteredAndSortedPages.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">No pages found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedPages.map(page => (
              <div key={page._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200 overflow-hidden group">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <input
                      type="checkbox"
                      checked={bulkSelected.has(page._id)}
                      onChange={() => setBulkSelected(prev => {
                        const s = new Set(prev);
                        s.has(page._id) ? s.delete(page._id) : s.add(page._id);
                        return s;
                      })}
                      className="h-5 w-5 text-indigo-600 rounded border-gray-300"
                    />
                    <button
                      onClick={() => togglePageSelection(page._id)}
                      className={`p-2 rounded-lg transition ${selectedPages.has(page._id) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}
                    >
                      {selectedPages.has(page._id) ? <Check className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                    </button>
                  </div>

                  {page.imageUrl && (
                    <img src={page.imageUrl} alt={page.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                  )}

                  <h3 className="font-bold text-lg line-clamp-2 mb-2">{page.title}</h3>
                  <p className="text-sm text-indigo-600 font-medium mb-3">{page.category}</p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" /> {page.views || 0}
                    </span>
                    <span className="font-semibold">Weight {page.weight}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${page.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {page.isActive ? 'Live' : 'Draft'}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => editPage(page)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => deletePage(page._id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View (same as before, just cleaner)
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left"><input type="checkbox" /></th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Views</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Weight</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedPages.map(page => (
                  <tr key={page._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={bulkSelected.has(page._id)}
                        onChange={() => setBulkSelected(prev => {
                          const s = new Set(prev);
                          s.has(page._id) ? s.delete(page._id) : s.add(page._id);
                          return s;
                        })}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{page.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{page.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${page.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {page.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{page.views || 0}</td>
                    <td className="px-6 py-4 text-sm font-medium">{page.weight}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => togglePageSelection(page._id)} className={`${selectedPages.has(page._id) ? 'text-green-600' : 'text-gray-400'} hover:text-green-600 transition`}>
                          {selectedPages.has(page._id) ? <Check className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                        </button>
                        <button onClick={() => editPage(page)} className="text-blue-600 hover:text-blue-800">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => deletePage(page._id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create/Edit Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
              <h2 className="text-3xl font-bold mb-8 text-gray-800">{editingPage ? 'Edit Page' : 'Create New Page'}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form fields - same as before but cleaner */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
                      required
                      placeholder="Enter an attractive title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Content <span className="text-red-500">*</span> (Minimum 500 words)</label>
                  <textarea
                    value={formData.content}
                    onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 h-64 resize-none"
                    required
                    placeholder="Write detailed, engaging content..."
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Word count: <strong>{formData.content.trim().split(/\s+/).filter(w => w).length}</strong> / 500+
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (Priority)</label>
                    <select
                      value={formData.weight}
                      onChange={e => setFormData(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500"
                    >
                      {weightOptions.map(w => <option key={w} value={w}>Weight {w} {w === 5 ? '(Highest)' : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Min Display Time (seconds)</label>
                    <input
                      type="number"
                      min="3" max="30"
                      value={formData.minDisplayTime}
                      onChange={e => setFormData(prev => ({ ...prev, minDisplayTime: parseInt(e.target.value) || 5 }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <div className="flex gap-6 mt-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.isActive}
                          onChange={() => setFormData(prev => ({ ...prev, isActive: true }))}
                          className="w-5 h-5 text-indigo-600"
                        />
                        <span className="font-medium">Active</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={!formData.isActive}
                          onChange={() => setFormData(prev => ({ ...prev, isActive: false }))}
                          className="w-5 h-5 text-gray-600"
                        />
                        <span className="font-medium">Inactive</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={e => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">SEO Keywords</label>
                    <input
                      type="text"
                      value={formData.seoKeywords}
                      onChange={e => setFormData(prev => ({ ...prev, seoKeywords: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500"
                      placeholder="earn money online, read and earn, etc."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Description (Max 160 chars)</label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={e => setFormData(prev => ({ ...prev, metaDescription: e.target.value.slice(0, 160) }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500"
                    rows="3"
                    maxLength="160"
                    placeholder="Brief description for search engines..."
                  />
                  <p className="text-sm text-gray-500 text-right">{formData.metaDescription.length}/160</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500"
                    placeholder="money, earn, online, india"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button type="button" onClick={resetForm} className="px-8 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition transform hover:scale-105">
                    {editingPage ? 'Update Page' : 'Create Page'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PagesManagement;



// /////////////////

// // components/admin/PagesManagement.jsx

// import { useState, useEffect, useMemo, useCallback } from 'react';
// import { useSelector } from 'react-redux';
// import axios from 'axios';
// import toast, { Toaster } from 'react-hot-toast';
// import { 
//   Plus, Edit, Trash2, Eye, EyeOff, Check, X, Search, Filter, Copy,
//   BarChart3, Download, Upload, FileText, Clock, TrendingUp, Star,
//   Grid, List, SortAsc, SortDesc, Target, Layers, ChevronDown
// } from 'lucide-react';

// const PagesManagement = () => {
//   const { token } = useSelector(state => state.user);
//   const [pages, setPages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [editingPage, setEditingPage] = useState(null);
//   const [selectedPages, setSelectedPages] = useState(new Set());
//   const [bulkSelected, setBulkSelected] = useState(new Set());
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterActive, setFilterActive] = useState('all');
//   const [categoryFilter, setCategoryFilter] = useState('all');
//   const [weightFilter, setWeightFilter] = useState('all');
//   const [viewMode, setViewMode] = useState('grid');
//   const [sortBy, setSortBy] = useState('createdAt');
//   const [sortOrder, setSortOrder] = useState('desc');
//   const [importExportOpen, setImportExportOpen] = useState(false);
//   const [stats, setStats] = useState(null);

//   const [formData, setFormData] = useState({
//     title: '', content: '', imageUrl: '', seoKeywords: '', isActive: true,
//     category: 'Other', weight: 1, minDisplayTime: 5, metaDescription: '', tags: ''
//   });

//   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

//   const api = useMemo(() => axios.create({
//     baseURL: API_BASE_URL,
//     headers: {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     }
//   }), [token]);

//   const categories = [
//     'Technology', 'Business', 'Health', 'Entertainment', 'Education', 'Sports',
//     'News', 'Lifestyle', 'Finance', 'Travel', 'Food', 'Fashion', 'Other'
//   ];

//   const weightOptions = [1, 2, 3, 4, 5];

//   useEffect(() => {
//     fetchPages();
//     fetchSelectedPages();
//     fetchStats();
//   }, [sortBy, sortOrder, api]);

//   const fetchPages = async () => {
//     setLoading(true);
//     try {
//       const params = new URLSearchParams({
//         sortBy, sortOrder,
//         search: searchTerm,
//         category: categoryFilter !== 'all' ? categoryFilter : '',
//         status: filterActive !== 'all' ? filterActive : ''
//       });
//       const res = await api.get(`/admin/pages?${params}`);
//       setPages(res.data.pages || []);
//     } catch (err) {
//       toast.error('Failed to load pages');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchSelectedPages = async () => {
//     try {
//       const res = await api.get('/admin/pages/selected/list');
//       setSelectedPages(new Set(res.data.selectedPages || []));
//     } catch (err) {
//       console.error('Failed to load selected pages');
//     }
//   };

//   const fetchStats = async () => {
//     try {
//       const res = await api.get('/admin/pages/stats/overview');
//       setStats(res.data.stats);
//     } catch (err) {
//       console.error('Stats error:', err);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.title || !formData.content) {
//       toast.error('Title and content required');
//       return;
//     }
//     if (formData.content.split(/\s+/).filter(w => w).length < 500) {
//       toast.error('Content must be 500+ words');
//       return;
//     }

//     try {
//       if (editingPage) {
//         await api.put(`/admin/pages/${editingPage._id}`, formData);
//         toast.success('Page updated!');
//       } else {
//         await api.post('/admin/pages', formData);
//         toast.success('Page created!');
//       }
//       fetchPages();
//       fetchStats();
//       resetForm();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to save');
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       title: '', content: '', imageUrl: '', seoKeywords: '', isActive: true,
//       category: 'Other', weight: 1, minDisplayTime: 5, metaDescription: '', tags: ''
//     });
//     setEditingPage(null);
//     setShowForm(false);
//   };

//   const editPage = (page) => {
//     setFormData({
//       title: page.title,
//       content: page.content,
//       imageUrl: page.imageUrl || '',
//       seoKeywords: page.seoKeywords || '',
//       metaDescription: page.metaDescription || '',
//       tags: page.tags || '',
//       category: page.category,
//       weight: page.weight,
//       minDisplayTime: page.minDisplayTime,
//       isActive: page.isActive
//     });
//     setEditingPage(page);
//     setShowForm(true);
//   };

//   const deletePage = async (id) => {
//     if (!window.confirm('Delete this page?')) return;
//     try {
//       await api.delete(`/admin/pages/${id}`);
//       toast.success('Page deleted');
//       fetchPages();
//       fetchStats();
//     } catch (err) {
//       toast.error('Delete failed');
//     }
//   };

//   const togglePageSelection = async (pageId) => {
//     try {
//       await api.post('/admin/pages/selected/toggle', { pageId });
//       setSelectedPages(prev => {
//         const s = new Set(prev);
//         s.has(pageId) ? s.delete(pageId) : s.add(pageId);
//         return s;
//       });
//       toast.success('Selection updated');
//     } catch (err) {
//       toast.error('Failed');
//     }
//   };

// const bulkAddToSelection = async () => {
//   if (bulkSelected.size === 0) {
//     return toast.error('Select pages first');
//   }
//   try {
//     await api.post('/admin/pages/bulk/select', { pageIds: Array.from(bulkSelected) });
//     fetchSelectedPages();
//     setBulkSelected(new Set());
//     toast.success('Added to selection');
//   } catch (err) {
//     toast.error('Bulk select failed');
//   }
// };

//   const bulkDelete = async () => {
//     if (bulkSelected.size === 0) return toast.error('Select pages first');
//     if (!window.confirm(`Delete ${bulkSelected.size} pages?`)) return;
//     try {
//       await api.post('/admin/pages/bulk/delete', { pageIds: Array.from(bulkSelected) });
//       toast.success('Pages deleted');
//       fetchPages();
//       setBulkSelected(new Set());
//     } catch (err) {
//       toast.error('Bulk delete failed');
//     }
//   };

//   const exportPages = async () => {
//     try {
//       const res = await api.get('/admin/pages/export/all');
//       const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `pages-export-${new Date().toISOString().split('T')[0]}.json`;
//       a.click();
//       toast.success('Exported!');
//     } catch (err) {
//       toast.error('Export failed');
//     }
//   };

//   // Keyboard shortcuts
//   useEffect(() => {
//     const handleKey = (e) => {
//       if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
//         e.preventDefault();
//         setShowForm(true);
//       }
//     };
//     window.addEventListener('keydown', handleKey);
//     return () => window.removeEventListener('keydown', handleKey);
//   }, []);

//   const filteredPages = useMemo(() => {
//     return pages.filter(page => {
//       const search = searchTerm.toLowerCase();
//       const matchesSearch = 
//         page.title.toLowerCase().includes(search) ||
//         (page.content && page.content.toLowerCase().includes(search)) ||
//         (page.seoKeywords && page.seoKeywords.toLowerCase().includes(search)) ||
//         (page.tags && page.tags.toLowerCase().includes(search));
//       const matchesActive = filterActive === 'all' || 
//         (filterActive === 'active' && page.isActive) ||
//         (filterActive === 'inactive' && !page.isActive);
//       const matchesCategory = categoryFilter === 'all' || page.category === categoryFilter;
//       const matchesWeight = weightFilter === 'all' || page.weight === parseInt(weightFilter);
//       return matchesSearch && matchesActive && matchesCategory && matchesWeight;
//     });
//   }, [pages, searchTerm, filterActive, categoryFilter, weightFilter]);

//   const sortedPages = useMemo(() => {
//     return [...filteredPages].sort((a, b) => {
//       let aVal = a[sortBy], bVal = b[sortBy];
//       if (['createdAt', 'updatedAt'].includes(sortBy)) {
//         aVal = new Date(aVal); bVal = new Date(bVal);
//       }
//       return sortOrder === 'asc' ? (aVal < bVal ? -1 : 1) : (aVal > bVal ? -1 : 1);
//     });
//   }, [filteredPages, sortBy, sortOrder]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Toaster position="top-right" />
//       <div className="p-6 space-y-6">
//         {/* Stats */}
//         {stats && (
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div className="bg-white p-4 rounded-lg shadow-sm border">
//               <p className="text-sm text-gray-600">Total Pages</p>
//               <p className="text-2xl font-bold">{stats.totalPages}</p>
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow-sm border">
//               <p className="text-sm text-gray-600">Active</p>
//               <p className="text-2xl font-bold text-green-600">{stats.activePages}</p>
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow-sm border">
//               <p className="text-sm text-gray-600">Total Views</p>
//               <p className="text-2xl font-bold">{stats.totalViews}</p>
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow-sm border">
//               <p className="text-sm text-gray-600">Today Clicks</p>
//               <p className="text-2xl font-bold text-blue-600">{stats.todayClicks}</p>
//             </div>
//           </div>
//         )}

//         {/* Header */}
//         <div className="flex justify-between items-center">
//           <h1 className="text-2xl font-bold">Pages Management</h1>
//           <div className="flex space-x-2">
//             <button onClick={exportPages} className="px-4 py-2 border rounded-lg flex items-center">
//               <Download className="h-4 w-4 mr-2" /> Export
//             </button>
//             <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center">
//               <Plus className="h-4 w-4 mr-2" /> Create Page
//             </button>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white p-4 rounded-lg shadow-sm border">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 value={searchTerm}
//                 onChange={e => setSearchTerm(e.target.value)}
//                 className="pl-10 pr-4 py-2 w-full border rounded-lg"
//               />
//             </div>
//             <select value={filterActive} onChange={e => setFilterActive(e.target.value)} className="px-4 py-2 border rounded-lg">
//               <option value="all">All Status</option>
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//             </select>
//             <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
//               <option value="all">All Categories</option>
//               {categories.map(c => <option key={c} value={c}>{c}</option>)}
//             </select>
//             <select value={weightFilter} onChange={e => setWeightFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
//               <option value="all">All Weights</option>
//               {weightOptions.map(w => <option key={w} value={w}>Weight {w}</option>)}
//             </select>
//           </div>
//         </div>

//         {/* Bulk Actions */}
//         {bulkSelected.size > 0 && (
//           <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center">
//             <span>{bulkSelected.size} selected</span>
//             <div className="space-x-2">
//               <button onClick={bulkAddToSelection} className="text-blue-600 font-medium">Add to Selection</button>
//               <button onClick={bulkDelete} className="text-red-600 font-medium">Delete</button>
//             </div>
//           </div>
//         )}

//         {/* View Mode */}
//         <div className="flex justify-between items-center">
//           <div className="flex space-x-2">
//             <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : ''}`}>
//               <Grid className="h-5 w-5" />
//             </button>
//             <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200' : ''}`}>
//               <List className="h-5 w-5" />
//             </button>
//           </div>
//           <div className="flex items-center space-x-2">
//             <span className="text-sm text-gray-600">Sort by:</span>
//             <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-sm border rounded px-2 py-1">
//               <option value="createdAt">Created</option>
//               <option value="updatedAt">Updated</option>
//               <option value="views">Views</option>
//               <option value="weight">Weight</option>
//             </select>
//             <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-1">
//               {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
//             </button>
//           </div>
//         </div>

//         {/* Pages Grid/List */}
//         {viewMode === 'grid' ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {sortedPages.map(page => (
//               <div key={page._id} className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
//                 <div className="flex justify-between items-start mb-2">
//                   <input
//                     type="checkbox"
//                     checked={bulkSelected.has(page._id)}
//                     onChange={() => setBulkSelected(prev => {
//                       const s = new Set(prev);
//                       s.has(page._id) ? s.delete(page._id) : s.add(page._id);
//                       return s;
//                     })}
//                     className="mt-1"
//                   />
//                   <button
//                     onClick={() => togglePageSelection(page._id)}
//                     className={`p-1 rounded ${selectedPages.has(page._id) ? 'text-green-600' : 'text-gray-400'}`}
//                   >
//                     {selectedPages.has(page._id) ? <Check className="h-4 w-4" /> : <Target className="h-4 w-4" />}
//                   </button>
//                 </div>
//                 <h3 className="font-semibold text-lg mb-1">{page.title}</h3>
//                 <p className="text-sm text-gray-600 mb-2">{page.category}</p>
//                 <div className="flex justify-between text-sm text-gray-500 mb-3">
//                   <span>{page.views} views</span>
//                   <span>Weight: {page.weight}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className={`px-2 py-1 text-xs rounded-full ${page.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
//                     {page.isActive ? 'Active' : 'Inactive'}
//                   </span>
//                   <div className="flex space-x-1">
//                     <button onClick={() => editPage(page)} className="p-1 text-blue-600"><Edit className="h-4 w-4" /></button>
//                     <button onClick={() => deletePage(page._id)} className="p-1 text-red-600"><Trash2 className="h-4 w-4" /></button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-3 text-left"><input type="checkbox" /></th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {sortedPages.map(page => (
//                   <tr key={page._id}>
//                     <td className="px-4 py-3">
//                       <input
//                         type="checkbox"
//                         checked={bulkSelected.has(page._id)}
//                         onChange={() => setBulkSelected(prev => {
//                           const s = new Set(prev);
//                           s.has(page._id) ? s.delete(page._id) : s.add(page._id);
//                           return s;
//                         })}
//                       />
//                     </td>
//                     <td className="px-4 py-3 font-medium">{page.title}</td>
//                     <td className="px-4 py-3 text-sm">{page.category}</td>
//                     <td className="px-4 py-3">
//                       <span className={`px-2 py-1 text-xs rounded-full ${page.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
//                         {page.isActive ? 'Active' : 'Inactive'}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-sm">{page.views}</td>
//                     <td className="px-4 py-3">
//                       <div className="flex space-x-2">
//                         <button onClick={() => togglePageSelection(page._id)} className={`${selectedPages.has(page._id) ? 'text-green-600' : 'text-gray-400'}`}>
//                           {selectedPages.has(page._id) ? <Check className="h-4 w-4" /> : <Target className="h-4 w-4" />}
//                         </button>
//                         <button onClick={() => editPage(page)} className="text-blue-600"><Edit className="h-4 w-4" /></button>
//                         <button onClick={() => deletePage(page._id)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Create/Edit Form Modal */}
//         {showForm && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
//             <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
//               <h2 className="text-2xl font-bold mb-6">{editingPage ? 'Edit Page' : 'Create New Page'}</h2>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium mb-1">Title *</label>
//                     <input
//                       type="text"
//                       value={formData.title}
//                       onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
//                       className="w-full px-3 py-2 border rounded-lg"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1">Category</label>
//                     <select
//                       value={formData.category}
//                       onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
//                       className="w-full px-3 py-2 border rounded-lg"
//                     >
//                       {categories.map(c => <option key={c} value={c}>{c}</option>)}
//                     </select>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">Content * (500+ words)</label>
//                   <textarea
//                     value={formData.content}
//                     onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
//                     className="w-full px-3 py-2 border rounded-lg h-48"
//                     required
//                   />
//                   <p className="text-xs text-gray-500 mt-1">
//                     {formData.content.split(/\s+/).filter(w => w).length} words
//                   </p>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium mb-1">Weight</label>
//                     <select
//                       value={formData.weight}
//                       onChange={e => setFormData(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
//                       className="w-full px-3 py-2 border rounded-lg"
//                     >
//                       {weightOptions.map(w => <option key={w} value={w}>{w}</option>)}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1">Min Display Time (sec)</label>
//                     <input
//                       type="number"
//                       min="3" max="30"
//                       value={formData.minDisplayTime}
//                       onChange={e => setFormData(prev => ({ ...prev, minDisplayTime: parseInt(e.target.value) }))}
//                       className="w-full px-3 py-2 border rounded-lg"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1">Status</label>
//                     <div className="flex items-center space-x-4 mt-2">
//                       <label className="flex items-center">
//                         <input
//                           type="radio"
//                           checked={formData.isActive}
//                           onChange={() => setFormData(prev => ({ ...prev, isActive: true }))}
//                           className="mr-2"
//                         />
//                         Active
//                       </label>
//                       <label className="flex items-center">
//                         <input
//                           type="radio"
//                           checked={!formData.isActive}
//                           onChange={() => setFormData(prev => ({ ...prev, isActive: false }))}
//                           className="mr-2"
//                         />
//                         Inactive
//                       </label>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium mb-1">Image URL</label>
//                     <input
//                       type="url"
//                       value={formData.imageUrl}
//                       onChange={e => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
//                       className="w-full px-3 py-2 border rounded-lg"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1">SEO Keywords</label>
//                     <input
//                       type="text"
//                       value={formData.seoKeywords}
//                       onChange={e => setFormData(prev => ({ ...prev, seoKeywords: e.target.value }))}
//                       className="w-full px-3 py-2 border rounded-lg"
//                       placeholder="keyword1, keyword2"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">Meta Description (160 chars)</label>
//                   <textarea
//                     value={formData.metaDescription}
//                     onChange={e => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
//                     className="w-full px-3 py-2 border rounded-lg"
//                     maxLength="160"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">Tags</label>
//                   <input
//                     type="text"
//                     value={formData.tags}
//                     onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
//                     className="w-full px-3 py-2 border rounded-lg"
//                     placeholder="tag1, tag2"
//                   />
//                 </div>

//                 <div className="flex justify-end space-x-3 pt-4">
//                   <button type="button" onClick={resetForm} className="px-6 py-2 border rounded-lg">
//                     Cancel
//                   </button>
//                   <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
//                     {editingPage ? 'Update' : 'Create'} Page
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default PagesManagement;
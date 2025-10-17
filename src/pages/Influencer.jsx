'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  X,
  Upload,
  Search,
  Users,
  Tag,
} from 'lucide-react';

const InfluencerDashboard = () => {
  const [influencers, setInfluencers] = useState([]);
  const [filteredInfluencers, setFilteredInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    keywords: '',
    pic: null,
  });

  const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/influencers`;


  // Fetch all influencers
  const fetchInfluencers = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setInfluencers(data);
      setFilteredInfluencers(data);
    } catch (error) {
      console.error('Error fetching influencers:', error);
      alert('Failed to fetch influencers. Make sure your backend is running on port 4000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfluencers();
  }, []);

  // Search filter
  useEffect(() => {
    if (searchTerm) {
      const filtered = influencers.filter(
        (inf) =>
          inf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inf.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inf.keywords?.some((k) =>
            k.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
      setFilteredInfluencers(filtered);
    } else {
      setFilteredInfluencers(influencers);
    }
  }, [searchTerm, influencers]);

  // Open modal for create/edit
  const openModal = (influencer = null) => {
    if (influencer) {
      setEditingId(influencer._id);
      setFormData({
        name: influencer.name,
        desc: influencer.desc,
        keywords: Array.isArray(influencer.keywords) ? influencer.keywords.join(', ') : '',
        pic: null,
      });
      // Show existing image if available
      if (influencer.pic) {
        setImagePreview(`http://localhost:4000/uploads/${influencer.pic}`);
      }
    } else {
      setEditingId(null);
      setFormData({ name: '', desc: '', keywords: '', pic: null });
      setImagePreview('');
    }
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', desc: '', keywords: '', pic: null });
    setImagePreview('');
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, pic: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Create or Update influencer
  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.desc.trim()) {
      alert('Please fill in Name and Description.');
      return;
    }
    if (!editingId && !formData.pic) {
      alert('Please add a picture for a new influencer.');
      return;
    }

    setSubmitting(true);

    const data = new FormData();
    data.append('name', formData.name.trim());
    data.append('desc', formData.desc.trim());
    data.append('keywords', formData.keywords.trim());
    
    if (formData.pic) {
      data.append('pic', formData.pic);
    }

    // Debug: Log FormData contents
    console.log('FormData contents:');
    for (let pair of data.entries()) {
      console.log(pair[0] + ':', pair[1]);
    }

    try {
      const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
      const method = editingId ? 'PUT' : 'POST';

      console.log('Sending request to:', url, 'Method:', method);

      const response = await fetch(url, {
        method,
        body: data,
        // Don't set Content-Type header - browser will set it automatically with boundary
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Success:', result);
        await fetchInfluencers();
        closeModal();
        alert(editingId ? 'Influencer updated successfully!' : 'Influencer created successfully!');
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        try {
          const error = JSON.parse(errorText);
          alert(error.message || 'Operation failed');
        } catch {
          alert('Operation failed: ' + errorText);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save influencer. Please check your backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete influencer
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this influencer?')) return;

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchInfluencers();
        alert('Influencer deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete influencer');
      }
    } catch (error) {
      console.error('Error deleting influencer:', error);
      alert('Failed to delete influencer. Please check your backend connection.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-5xl font-black mb-2">
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-transparent bg-clip-text">
                Influencer
              </span>{' '}
              Management
            </h1>
            <p className="text-gray-400">Manage your influencer portfolio</p>
          </div>
          <button
            onClick={() => openModal()}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg font-semibold flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-orange-500/30"
          >
            <Plus size={20} />
            Add Influencer
          </button>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-6 mb-8 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Users className="text-orange-400" size={32} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Influencers</p>
              <p className="text-4xl font-bold text-orange-400">
                {influencers.length}
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name, description, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        {/* Influencers Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading influencers...</p>
          </div>
        ) : filteredInfluencers.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
            <Users className="mx-auto mb-4 text-gray-600" size={64} />
            <p className="text-gray-400 text-lg">
              {searchTerm
                ? `No results for "${searchTerm}"`
                : 'No influencers found. Click "Add Influencer" to get started!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInfluencers.map((influencer) => (
              <div
                key={influencer._id}
                className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden hover:border-orange-500/50 transition-all hover:shadow-xl hover:shadow-orange-500/10"
              >
                {/* Image */}
                <div className="relative h-64 bg-gradient-to-br from-orange-500/20 to-orange-600/10 overflow-hidden">
                  <img
                    src={
                      influencer.pic
                        ? `http://localhost:4000/uploads/${influencer.pic}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.name)}&size=400&background=random`
                    }
                    alt={influencer.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.name)}&size=400&background=random`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openModal(influencer)}
                      className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(influencer._id)}
                      className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-orange-400 transition-colors">
                    {influencer.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {influencer.desc}
                  </p>

                  {/* Keywords */}
                  {influencer.keywords && influencer.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {influencer.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs text-orange-400 flex items-center gap-1"
                        >
                          <Tag size={12} />
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0">
              <h2 className="text-2xl font-bold">
                {editingId ? 'Edit' : 'Add'} Influencer
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-all"
                  placeholder="Enter influencer name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Description *
                </label>
                <textarea
                  value={formData.desc}
                  onChange={(e) =>
                    setFormData({ ...formData, desc: e.target.value })
                  }
                  rows="4"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-all resize-none"
                  placeholder="Enter description"
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) =>
                    setFormData({ ...formData, keywords: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-all"
                  placeholder="e.g., tech, fashion, gaming"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Picture {editingId ? '(Optional - leave blank to keep current)' : '*'}
                </label>
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer mt-2 flex justify-center w-full h-48 px-6 pt-5 pb-6 border-2 border-white/20 border-dashed rounded-lg hover:border-orange-500 transition-all"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-auto object-contain rounded-md"
                    />
                  ) : (
                    <div className="space-y-1 text-center self-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-500" />
                      <p className="text-sm text-gray-400">
                        <span className="font-semibold text-orange-400">
                          Upload a file
                        </span>{' '}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  )}
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end items-center gap-4 p-6 border-t border-white/10 flex-shrink-0">
              <button
                onClick={closeModal}
                disabled={submitting}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Influencer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfluencerDashboard;
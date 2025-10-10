import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Check, X, Eye, Upload, Search, Filter, Loader, AlertCircle, CheckCircle } from 'lucide-react';

// API Service with proper error handling
const API_BASE_URL = 'https://digitallab-server.vercel.app/api/review';

const api = {
  getAllReviews: async () => {
    const response = await fetch(`${API_BASE_URL}/`);
    console.log(response)
    if (!response.ok) throw new Error(`Failed to fetch reviews: ${response.statusText}`);
    return response.json();
  },
  
  getApprovedReviews: async () => {
    const response = await fetch(`${API_BASE_URL}/approved`);
    if (!response.ok) throw new Error(`Failed to fetch approved reviews: ${response.statusText}`);
    return response.json();
  },
  
  approveReview: async (id) => {
    const response = await fetch(`${API_BASE_URL}/${id}/approve`, { method: 'PATCH' });
    if (!response.ok) throw new Error(`Failed to approve review: ${response.statusText}`);
    return response.json();
  },
  
  deleteReview: async (id) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`Failed to delete review: ${response.statusText}`);
    return response.json();
  },
  
  updateReview: async (id, formData) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'PUT', body: formData });
    if (!response.ok) throw new Error(`Failed to update review: ${response.statusText}`);
    return response.json();
  },
  
  createReview: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/`, { method: 'POST', body: formData });
    if (!response.ok) throw new Error(`Failed to create review: ${response.statusText}`);
    return response.json();
  }
};

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border ${
      type === 'success' 
        ? 'bg-green-900 border-green-700 text-green-300' 
        : 'bg-red-900 border-red-700 text-red-300'
    }`}>
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X size={16} />
      </button>
    </div>
  );
};

// Review Card Component with loading states
const ReviewCard = ({ review, onApprove, onDelete, onEdit, onView, loadingStates }) => {
  const formatDate = (date) => new Date(date).toLocaleDateString();
  const isApproving = loadingStates.approving === review._id;
  const isDeleting = loadingStates.deleting === review._id;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-orange-500 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          {review.image && (
            <img
              src={review.image}
              alt={review.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-orange-500"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=ea580c&color=fff&size=150`;
              }}
            />
          )}
          <div>
            <h3 className="text-white font-semibold text-lg">{review.name}</h3>
            <p className="text-gray-400 text-sm">{review.role}</p>
            <p className="text-gray-500 text-xs">{review.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            review.approved 
              ? 'bg-green-900 text-green-300 border border-green-700'
              : 'bg-red-900 text-red-300 border border-red-700'
          }`}>
            {review.approved ? 'Approved' : 'Pending'}
          </span>
        </div>
      </div>
      
      <p className="text-gray-300 text-sm mb-4 line-clamp-3">{review.review}</p>
      
      <div className="flex justify-between items-center">
        <span className="text-gray-500 text-xs">
          {formatDate(review.createdAt)}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => onView(review)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="View Full Review"
          >
            <Eye size={16} />
          </button>
          {!review.approved && (
            <button
              onClick={() => onApprove(review._id)}
              disabled={isApproving}
              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Approve Review"
            >
              {isApproving ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
            </button>
          )}
          <button
            onClick={() => onEdit(review)}
            className="p-2 text-orange-400 hover:text-orange-300 hover:bg-orange-900 rounded transition-colors"
            title="Edit Review"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => onDelete(review._id)}
            disabled={isDeleting}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete Review"
          >
            {isDeleting ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Review Form Component with validation and loading
const ReviewForm = ({ review, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: review?.name || '',
    email: review?.email || '',
    role: review?.role || '',
    review: review?.review || '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(review?.image || null);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.role.trim()) newErrors.role = 'Role is required';
    if (!formData.review.trim()) newErrors.review = 'Review is required';
    else if (formData.review.trim().length < 10) newErrors.review = 'Review must be at least 10 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image size must be less than 5MB' });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, image: 'Please select a valid image file' });
        return;
      }

      setFormData({ ...formData, image: file });
      setErrors({ ...errors, image: null });
      
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== '') {
        submitData.append(key, formData[key]);
      }
    });
    onSubmit(submitData);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white text-sm font-medium mb-2">Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full p-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:border-orange-500 ${
              errors.name ? 'border-red-500' : 'border-gray-700'
            }`}
            disabled={isSubmitting}
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-white text-sm font-medium mb-2">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full p-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:border-orange-500 ${
              errors.email ? 'border-red-500' : 'border-gray-700'
            }`}
            disabled={isSubmitting}
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>
      
      <div>
        <label className="block text-white text-sm font-medium mb-2">Role *</label>
        <input
          type="text"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          placeholder="e.g., Influencer, YouTuber, Entrepreneur"
          className={`w-full p-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:border-orange-500 ${
            errors.role ? 'border-red-500' : 'border-gray-700'
          }`}
          disabled={isSubmitting}
        />
        {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role}</p>}
      </div>
      
      <div>
        <label className="block text-white text-sm font-medium mb-2">Review *</label>
        <textarea
          value={formData.review}
          onChange={(e) => setFormData({ ...formData, review: e.target.value })}
          rows="4"
          className={`w-full p-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:border-orange-500 ${
            errors.review ? 'border-red-500' : 'border-gray-700'
          }`}
          disabled={isSubmitting}
        />
        {errors.review && <p className="text-red-400 text-xs mt-1">{errors.review}</p>}
        <p className="text-gray-500 text-xs mt-1">{formData.review.length}/10 characters minimum</p>
      </div>
      
      <div>
        <label className="block text-white text-sm font-medium mb-2">Profile Image</label>
        <div className="flex items-center space-x-4">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-16 h-16 rounded-full object-cover border-2 border-orange-500"
            />
          )}
          <label className="cursor-pointer bg-gray-800 border border-gray-700 hover:border-orange-500 rounded-lg px-4 py-2 text-white transition-colors">
            <Upload size={16} className="inline mr-2" />
            Choose Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={isSubmitting}
            />
          </label>
        </div>
        {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image}</p>}
        <p className="text-gray-500 text-xs mt-1">Max file size: 5MB</p>
      </div>
      
      <div className="flex space-x-4 pt-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader size={16} className="animate-spin" />
              {review ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            review ? 'Update Review' : 'Create Review'
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// View Review Modal Component
const ViewReviewModal = ({ review, onClose }) => {
  if (!review) return null;

  return (
    <Modal isOpen={!!review} onClose={onClose} title="Review Details">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          {review.image && (
            <img
              src={review.image}
              alt={review.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-orange-500"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=ea580c&color=fff&size=150`;
              }}
            />
          )}
          <div>
            <h3 className="text-2xl font-semibold text-white">{review.name}</h3>
            <p className="text-orange-400 font-medium">{review.role}</p>
            <p className="text-gray-400">{review.email}</p>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-medium mb-2">Review:</h4>
          <p className="text-gray-300 leading-relaxed">{review.review}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
          <div>
            <span className="text-gray-400 text-sm">Status:</span>
            <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
              review.approved 
                ? 'bg-green-900 text-green-300'
                : 'bg-red-900 text-red-300'
            }`}>
              {review.approved ? 'Approved' : 'Pending'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 text-sm">Created:</span>
            <span className="text-white ml-2">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Main App Component
const AdminReviewsApp = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [viewingReview, setViewingReview] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [loadingStates, setLoadingStates] = useState({
    approving: null,
    deleting: null,
    submitting: false
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, filter, searchTerm]);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await api.getAllReviews();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showToast('Failed to fetch reviews. Make sure your backend is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = reviews;
    
    if (filter === 'approved') {
      filtered = reviews.filter(review => review.approved);
    } else if (filter === 'pending') {
      filtered = reviews.filter(review => !review.approved);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredReviews(filtered);
  };

  const handleApprove = async (id) => {
    try {
      setLoadingStates(prev => ({ ...prev, approving: id }));
      await api.approveReview(id);
      await fetchReviews();
      showToast('Review approved successfully!', 'success');
    } catch (error) {
      console.error('Error approving review:', error);
      showToast('Failed to approve review. Please try again.', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, approving: null }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      setLoadingStates(prev => ({ ...prev, deleting: id }));
      await api.deleteReview(id);
      await fetchReviews();
      showToast('Review deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting review:', error);
      showToast('Failed to delete review. Please try again.', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, deleting: null }));
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setLoadingStates(prev => ({ ...prev, submitting: true }));
      
      if (editingReview) {
        await api.updateReview(editingReview._id, formData);
        showToast('Review updated successfully!', 'success');
      } else {
        await api.createReview(formData);
        showToast('Review created successfully!', 'success');
      }
      
      await fetchReviews();
      setShowForm(false);
      setEditingReview(null);
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast(`Failed to ${editingReview ? 'update' : 'create'} review. Please try again.`, 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleView = (review) => {
    setViewingReview(review);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingReview(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <div className="text-white text-xl">Loading reviews...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Reviews Admin Dashboard</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Reviews</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-orange-500 w-64"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm font-medium">Total Reviews</h3>
            <p className="text-2xl font-bold text-white">{reviews.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm font-medium">Approved</h3>
            <p className="text-2xl font-bold text-green-400">
              {reviews.filter(r => r.approved).length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm font-medium">Pending</h3>
            <p className="text-2xl font-bold text-orange-400">
              {reviews.filter(r => !r.approved).length}
            </p>
          </div>
        </div>

        {/* Reviews Grid */}
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400">
              {reviews.length === 0 ? (
                <div>
                  <Plus className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-lg mb-2">No reviews yet</p>
                  <p className="text-sm">Create your first review to get started</p>
                </div>
              ) : (
                <div>
                  <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-lg">No reviews found</p>
                  <p className="text-sm">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                onApprove={handleApprove}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onView={handleView}
                loadingStates={loadingStates}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingReview ? 'Edit Review' : 'Add New Review'}
      >
        <ReviewForm
          review={editingReview}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          isSubmitting={loadingStates.submitting}
        />
      </Modal>

      {/* View Review Modal */}
      <ViewReviewModal
        review={viewingReview}
        onClose={() => setViewingReview(null)}
      />
    </div>
  );
};

export default AdminReviewsApp;
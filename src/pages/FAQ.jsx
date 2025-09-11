import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronUp, Search, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { backendUrl } from '../App';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [formData, setFormData] = useState({
    question: '',
    answer: ''
  });

  const API_BASE_URL = backendUrl || 'http://localhost:4000';

  // Toast notification system
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    const toast = { id, message, type };
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch all FAQs
  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/faq`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setFaqs(Array.isArray(data) ? data : []);
      
      if (data.length === 0) {
        showToast('No FAQs found. Add your first FAQ!', 'info');
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      showToast('Failed to load FAQs. Please check your connection.', 'error');
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  // Add new FAQ
  const addFAQ = async (faqData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/faq`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(faqData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to add FAQ');
      }
      
      // Add the new FAQ to the list (at the beginning since backend sorts by latest first)
      setFaqs(prev => [result.faq, ...prev]);
      showToast(result.message || 'FAQ created successfully!', 'success');
      
    } catch (err) {
      console.error('Error adding FAQ:', err);
      showToast(err.message || 'Failed to add FAQ', 'error');
      throw err;
    }
  };

  // Update FAQ
  const updateFAQ = async (id, faqData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/faq/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(faqData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update FAQ');
      }
      
      // Update the FAQ in the list
      setFaqs(prev => prev.map(faq => 
        faq._id === id ? result.faq : faq
      ));
      
      showToast(result.message || 'FAQ updated successfully!', 'success');
      
    } catch (err) {
      console.error('Error updating FAQ:', err);
      showToast(err.message || 'Failed to update FAQ', 'error');
      throw err;
    }
  };

  // Delete FAQ
  const deleteFAQ = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/faq/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete FAQ');
      }
      
      // Remove the FAQ from the list
      setFaqs(prev => prev.filter(faq => faq._id !== id));
      showToast(result.message || 'FAQ deleted successfully!', 'success');
      
      // Close expanded FAQ if it was the deleted one
      if (expandedFaq === id) {
        setExpandedFaq(null);
      }
      
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      showToast(err.message || 'Failed to delete FAQ', 'error');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      showToast('Question and answer are required', 'error');
      return;
    }

    try {
      if (editingId) {
        await updateFAQ(editingId, formData);
        setEditingId(null);
      } else {
        await addFAQ(formData);
      }
      
      setFormData({ question: '', answer: '' });
      setShowForm(false);
    } catch (err) {
      // Error is already handled in addFAQ/updateFAQ
    }
  };

  // Handle edit
  const handleEdit = (faq) => {
    setFormData({
      question: faq.question,
      answer: faq.answer
    });
    setEditingId(faq._id);
    setShowForm(true);
  };

  // Cancel form
  const cancelForm = () => {
    setFormData({ question: '', answer: '' });
    setEditingId(null);
    setShowForm(false);
  };

  // Filter FAQs based on search
  const filteredFAQs = faqs.filter(faq =>
    faq.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchFAQs();
  }, []);

  // Toast Component
  const Toast = ({ toast, onRemove }) => {
    const getIcon = () => {
      switch (toast.type) {
        case 'success': return <CheckCircle className="text-green-400" size={20} />;
        case 'error': return <AlertCircle className="text-red-400" size={20} />;
        default: return <Info className="text-blue-400" size={20} />;
      }
    };

    const getBgColor = () => {
      switch (toast.type) {
        case 'success': return 'bg-green-900 border-green-600';
        case 'error': return 'bg-red-900 border-red-600';
        default: return 'bg-blue-900 border-blue-600';
      }
    };

    return (
      <div className={`${getBgColor()} border rounded-lg p-4 flex items-center gap-3 shadow-lg animate-slide-in`}>
        {getIcon()}
        <p className="text-white flex-1">{toast.message}</p>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-center">
            <span className="text-orange-500">Frequently Asked</span> Questions
          </h1>
          <p className="text-gray-300 text-center">
            Find answers to common questions or manage FAQ content
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:shadow-lg"
          >
            <Plus size={20} />
            Add New FAQ
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-orange-500">
              {editingId ? 'Edit FAQ' : 'Add New FAQ'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Question *</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  placeholder="Enter the question..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Answer *</label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 min-h-[120px] transition-colors resize-vertical"
                  placeholder="Enter the answer..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:shadow-lg"
                >
                  <Save size={16} />
                  {editingId ? 'Update FAQ' : 'Add FAQ'}
                </button>
                <button
                  onClick={cancelForm}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading FAQs...</p>
          </div>
        ) : filteredFAQs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❓</div>
            <p className="text-gray-400 text-lg mb-4">
              {searchTerm ? `No FAQs match "${searchTerm}"` : 'No FAQs found'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="text-orange-500 hover:text-orange-400 font-medium"
              >
                Add your first FAQ
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div
                key={faq._id}
                className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-all duration-200 hover:shadow-lg"
              >
                {/* FAQ Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 
                        className="text-lg font-semibold cursor-pointer hover:text-orange-400 transition-colors leading-relaxed"
                        onClick={() => setExpandedFaq(expandedFaq === faq._id ? null : faq._id)}
                      >
                        {faq.question}
                      </h3>
                      {faq.createdAt && (
                        <p className="text-sm text-gray-500 mt-1">
                          Added {new Date(faq.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(faq)}
                        className="p-2 text-gray-400 hover:text-orange-400 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Edit FAQ"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteFAQ(faq._id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Delete FAQ"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === faq._id ? null : faq._id)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        title={expandedFaq === faq._id ? "Collapse" : "Expand"}
                      >
                        {expandedFaq === faq._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* FAQ Answer */}
                {expandedFaq === faq._id && (
                  <div className="border-t border-gray-700 p-6 bg-gray-800 animate-fade-in">
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {!loading && faqs.length > 0 && (
          <div className="mt-8 text-center text-gray-400">
            <p>
              Showing {filteredFAQs.length} of {faqs.length} FAQs
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FAQ;
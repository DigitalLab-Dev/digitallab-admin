import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';
import EditBlogModal from '../components/EditModal';

const List = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalBlogs, setTotalBlogs] = useState(0);

  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  // Categories for filter dropdown
  const categories = [
    'all',
    'Technology',
    'Artificial Intelligence',
    'Business',
    'Finance',
    'Marketing',
    'Data Automation',
  ];

  const fetchBlogs = async (
    page = 1,
    searchTerm = search,
    categoryFilter = category
  ) => {
    try {
      setLoading(true);
      const response = await axios.get(backendUrl + '/api/blogs', {
        params: {
          page,
          limit: 10,
          search: searchTerm,
          category: categoryFilter,
        },
      });

      if (response.data.blogs) {
        setBlogs(response.data.blogs);
        setCurrentPage(response.data.page);
        setTotalPages(response.data.totalPages);
        setTotalBlogs(response.data.totalBlogs);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeBlog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${backendUrl}/api/blogs/${id}`
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchBlogs(currentPage);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete blog';
      toast.error(msg);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchBlogs(1, search, category);
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setCurrentPage(1);
    fetchBlogs(1, search, newCategory);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchBlogs(page);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEdit = async () => {
    fetchBlogs();
  };

  useEffect(() => {
    fetchBlogs(currentPage, search, category);
  }, []);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">All Blogs List</h2>

        {/* Search and Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="flex-1">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search by title, subtitle, or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="min-w-[150px]">
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600">
            Showing {blogs.length} of {totalBlogs} blogs
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading blogs...</div>
        </div>
      )}

      {/* Blog Cards Grid */}
      {!loading && (
        <>
          <div className="grid gap-4 mb-6">
            {blogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No blogs found
              </div>
            ) : (
              blogs.map((blog) => (
                <div
                  key={blog._id}
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Blog Image */}
                    <div className="w-full md:w-32 h-32 flex-shrink-0">
                      <img
                        src={
                          blog.images && blog.images.length > 0
                            ? blog.images[0].url
                            : '/api/placeholder/128/128'
                        }
                        alt={blog.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Blog Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                            {blog.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {blog.category}
                            </span>
                            <span>{formatDate(blog.createdAt)}</span>
                          </div>

                          {blog.subtitle && (
                            <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                              {blog.subtitle}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setSelectedBlog(blog);
                              setEditModalOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Blog"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() => removeBlog(blog._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Blog"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;

                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 border rounded-lg ${
                          currentPage === page
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 3 ||
                    page === currentPage + 3
                  ) {
                    return (
                      <span key={page} className="px-2">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {editModalOpen && (
        <EditBlogModal
          setOpenModal={setEditModalOpen}
          selectedBlog={selectedBlog}
          onUpdate={handleEdit}
        />
      )}
    </>
  );
};

export default List;

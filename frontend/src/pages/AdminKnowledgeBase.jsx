import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getKnowledgeBaseEntries,
  createKnowledgeBaseEntry,
  updateKnowledgeBaseEntry,
  deleteKnowledgeBaseEntry,
} from "../services/knowledgeBaseService";
import LoadingIndicator from "../components/LoadingIndicator";

const AdminKnowledgeBase = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
  });
  const [submitting, setSubmitting] = useState(false);
  const [sortField, setSortField] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showForm, setShowForm] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    summary: "",
    category: "Hardware",
    tags: [],
  });

  const navigate = useNavigate();

  const categories = [
    "Hardware",
    "Software",
    "Network",
    "Security",
    "Account",
    "Other",
  ];

  useEffect(() => {
    fetchEntries();
  }, [page, sortField, sortDirection]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        sort: `${sortDirection === "desc" ? "-" : ""}${sortField}`,
      };

      if (filters.search) {
        params.search = filters.search;
      }

      if (filters.category !== "all") {
        params.category = filters.category;
      }

      const result = await getKnowledgeBaseEntries(params);
      setEntries(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError("Failed to load knowledge base entries");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchEntries();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortClass = (field) => {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? "sort-asc" : "sort-desc";
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "tags") {
      setFormData((prev) => ({
        ...prev,
        [name]: value.split(",").map((tag) => tag.trim()),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (currentEntry) {
        // Update existing entry
        await updateKnowledgeBaseEntry(currentEntry._id, formData);
      } else {
        // Create new entry
        await createKnowledgeBaseEntry(formData);
      }

      // Reset form
      resetForm();

      // Refetch entries
      await fetchEntries();
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to save knowledge base entry"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (entry) => {
    setCurrentEntry(entry);
    setFormData({
      title: entry.title,
      content: entry.content,
      summary: entry.summary,
      category: entry.category,
      tags: entry.tags,
    });
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await deleteKnowledgeBaseEntry(id);
        await fetchEntries();
      } catch (err) {
        setError("Failed to delete entry");
      }
    }
  };

  const resetForm = () => {
    setCurrentEntry(null);
    setFormData({
      title: "",
      content: "",
      summary: "",
      category: "Hardware",
      tags: [],
    });
    setShowForm(false);
  };

  return (
    <div className="window" style={{ width: "100%" }}>
      <div className="title-bar">
        <div className="title-bar-text">Knowledge Base Management</div>
      </div>
      <div className="window-body">
        <div style={{ marginBottom: "15px" }}>
          <button onClick={() => navigate("/admin/dashboard")}>
            Back to Dashboard
          </button>
          <button
            style={{ marginLeft: "10px" }}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Hide Form" : "Add New Entry"}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {showForm && (
          <div
            className="window"
            style={{ marginBottom: "20px", width: "100%" }}
          >
            <div className="title-bar">
              <div className="title-bar-text">
                {currentEntry
                  ? "Edit Knowledge Base Entry"
                  : "Create Knowledge Base Entry"}
              </div>
            </div>
            <div className="window-body">
              <form onSubmit={handleSubmit}>
                <div className="field-row-stacked" style={{ width: "100%" }}>
                  <label htmlFor="title">Title*</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="field-row-stacked" style={{ width: "100%" }}>
                  <label htmlFor="summary">Summary (300 char max)*</label>
                  <input
                    id="summary"
                    name="summary"
                    type="text"
                    value={formData.summary}
                    onChange={handleFormChange}
                    required
                    maxLength={300}
                  />
                </div>

                <div className="field-row-stacked" style={{ width: "100%" }}>
                  <label htmlFor="category">Category*</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field-row-stacked" style={{ width: "100%" }}>
                  <label htmlFor="content">Content*</label>
                  <textarea
                    id="content"
                    name="content"
                    rows="12"
                    value={formData.content}
                    onChange={handleFormChange}
                    required
                    style={{ fontFamily: "monospace" }}
                  ></textarea>
                </div>

                <div className="field-row-stacked" style={{ width: "100%" }}>
                  <label htmlFor="tags">Tags (comma separated)</label>
                  <input
                    id="tags"
                    name="tags"
                    type="text"
                    value={
                      Array.isArray(formData.tags)
                        ? formData.tags.join(", ")
                        : ""
                    }
                    onChange={handleFormChange}
                    placeholder="e.g. printer, network, password"
                  />
                </div>

                <div className="button-row">
                  <button type="button" onClick={resetForm}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="default"
                  >
                    {submitting
                      ? "Saving..."
                      : currentEntry
                      ? "Update Entry"
                      : "Create Entry"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search and filters */}
        <div className="window" style={{ marginBottom: "15px", width: "100%" }}>
          <div className="title-bar">
            <div className="title-bar-text">Search & Filters</div>
          </div>
          <div className="window-body" style={{ display: "flex", gap: "10px" }}>
            <div className="field-row" style={{ flex: 1 }}>
              <label htmlFor="search">Search:</label>
              <input
                id="search"
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                style={{ flex: 1 }}
              />
            </div>

            <div className="field-row">
              <label htmlFor="category">Category:</label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="all">All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={handleSearch}>Apply</button>
          </div>
        </div>

        {/* Entries list */}
        {loading ? (
          <LoadingIndicator message="Loading knowledge base entries..." />
        ) : entries.length === 0 ? (
          <p>
            No entries found. Create some knowledge base entries to get started!
          </p>
        ) : (
          <div
            className="sunken-panel"
            style={{ height: "calc(70vh - 300px)", minHeight: "300px" }}
          >
            <table className="interactive">
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort("title")}
                    className={getSortClass("title")}
                  >
                    Title
                  </th>
                  <th
                    onClick={() => handleSort("category")}
                    className={getSortClass("category")}
                  >
                    Category
                  </th>
                  <th>Summary</th>
                  <th
                    onClick={() => handleSort("createdAt")}
                    className={getSortClass("createdAt")}
                  >
                    Created
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry._id}>
                    <td>{entry.title}</td>
                    <td>{entry.category}</td>
                    <td>{entry.summary}</td>
                    <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button onClick={() => handleEdit(entry)}>Edit</button>
                        <button onClick={() => handleDelete(entry._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {entries.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "15px",
            }}
          >
            <button
              disabled={!pagination.prev}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              disabled={!pagination.next}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
      <div className="status-bar">
        <p className="status-bar-field">
          Total entries: {pagination.total || 0}
        </p>
      </div>
    </div>
  );
};

export default AdminKnowledgeBase;

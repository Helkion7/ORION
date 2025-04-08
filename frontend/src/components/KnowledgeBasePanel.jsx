import React, { useState, useEffect } from "react";
import {
  searchRelatedEntries,
  getKnowledgeBaseEntries,
} from "../services/knowledgeBaseService";
import LoadingIndicator from "./LoadingIndicator";

const KnowledgeBasePanel = ({ ticket }) => {
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [view, setView] = useState("related"); // "related", "search", or "article"

  // Fetch related articles when ticket changes
  useEffect(() => {
    if (ticket) {
      fetchRelatedArticles();
    }
  }, [ticket]);

  const fetchRelatedArticles = async () => {
    try {
      setLoading(true);
      const result = await searchRelatedEntries({
        title: ticket.title,
        category: ticket.category,
        description: ticket.description,
      });
      setRelatedArticles(result.data);
    } catch (err) {
      console.error("Failed to fetch related knowledge base articles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      setSearching(true);
      const result = await getKnowledgeBaseEntries({
        search: searchTerm,
        category: ticket.category,
        limit: 10,
      });
      setSearchResults(result.data);
      setView("search");
    } catch (err) {
      console.error("Failed to search knowledge base:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const viewArticle = (article) => {
    setSelectedArticle(article);
    setView("article");
  };

  const renderSearchBar = () => (
    <div className="field-row" style={{ width: "100%" }}>
      <input
        type="text"
        placeholder="Search knowledge base..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
        style={{ flexGrow: 1 }}
      />
      <button onClick={handleSearch} disabled={searching || !searchTerm.trim()}>
        {searching ? "..." : "Search"}
      </button>
    </div>
  );

  const renderArticleList = (articles, emptyMessage) => {
    if (articles.length === 0) {
      return <p>{emptyMessage}</p>;
    }

    return (
      <div className="tree-view">
        {articles.map((article) => (
          <div
            key={article._id}
            className="kb-article-item"
            onClick={() => viewArticle(article)}
            style={{
              cursor: "pointer",
              padding: "4px 0",
              borderBottom: "1px dotted #ccc",
            }}
          >
            <div style={{ fontWeight: "bold" }}>{article.title}</div>
            <div style={{ fontSize: "0.9em", marginTop: "2px" }}>
              {article.summary}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderArticleView = () => {
    if (!selectedArticle) return null;

    return (
      <>
        <div style={{ marginBottom: "10px" }}>
          <button onClick={() => setView(searchTerm ? "search" : "related")}>
            Back to {searchTerm ? "Search Results" : "Related Articles"}
          </button>
        </div>
        <div className="window" style={{ width: "100%" }}>
          <div className="title-bar">
            <div className="title-bar-text">{selectedArticle.title}</div>
          </div>
          <div className="window-body">
            <div style={{ whiteSpace: "pre-wrap" }}>
              {selectedArticle.content}
            </div>
            {selectedArticle.tags && selectedArticle.tags.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <strong>Tags:</strong>{" "}
                {selectedArticle.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "2px 6px",
                      background: "#efefef",
                      marginRight: "4px",
                      borderRadius: "2px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderTabMenu = () => (
    <menu role="tablist">
      <li
        role="tab"
        aria-selected={view === "related"}
        onClick={() => setView("related")}
      >
        <a href="#related">Related Articles</a>
      </li>
      <li
        role="tab"
        aria-selected={view === "search"}
        onClick={() => view === "search" || handleSearch()}
      >
        <a href="#search">Search Results</a>
      </li>
    </menu>
  );

  const renderContent = () => {
    if (view === "article") {
      return renderArticleView();
    }

    return (
      <>
        {renderSearchBar()}
        {renderTabMenu()}
        <div className="window" role="tabpanel" style={{ marginTop: "8px" }}>
          <div className="window-body">
            {loading ? (
              <LoadingIndicator
                message="Finding related articles..."
                showSpinner={true}
              />
            ) : view === "related" ? (
              renderArticleList(
                relatedArticles,
                "No related articles found. Try searching for a specific term."
              )
            ) : (
              renderArticleList(
                searchResults,
                "No articles found matching your search."
              )
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="knowledge-base-panel" style={{ height: "100%" }}>
      <div
        className="window"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="title-bar">
          <div className="title-bar-text">Knowledge Base</div>
        </div>
        <div
          className="window-body"
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBasePanel;

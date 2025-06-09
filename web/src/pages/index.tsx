import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import LinkPreview from "@/components/LinkPreview";
// import "@/styles/globals.css";

interface SearchResult {
  platform: string;
  username: string;
  url: string;
  source: "database" | "discovered";
  confidence: number;
  title?: string;
  description?: string;
  image?: string;
}

const UNSPLASH_API_URL = "https://api.unsplash.com/photos/random";

export default function Home() {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("/default-bg.jpg");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLink(value);
    setError(value && !isValidUrl(value) ? "Please enter a valid URL." : "");
  };

  const clearInput = () => {
    setLink("");
    setError("");
    setSearchResults([]);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSearch = async () => {
    if (!link.trim()) {
      return;
    }
    setIsSearching(true);
    setError("");

    try {
      const response = await fetch(`/api/search?url=${encodeURIComponent(link)}`);
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const fetchBackground = async () => {
      const accessKey = "5R_DESU0FUmqo_L5imHUDNpL7HuS31KhUVVEE1HkwFk";

      if (!accessKey) {
        console.error("Unsplash access key is missing");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${UNSPLASH_API_URL}?query=social-media&orientation=landscape`,
          {
            headers: {
              Authorization: `Client-ID ${accessKey}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch background");

        const data = await response.json();
        if (data.urls?.regular) {
          setBackgroundImage(data.urls.regular);
        }
      } catch (error) {
        console.error("Error fetching background:", error);
        setBackgroundImage("/default-bg.jpg");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackground();
  }, []);

  return (
    <div
      className="page-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <Navbar />
      <main className="homepage-main">
        <section className="input-section">
          <div className="input-group">
            <input
              id="linkInput"
              type="url"
              value={link}
              onChange={handleInputChange}
              placeholder="https://example.com"
              aria-label="Enter URL for preview"
            />
            {link && (
              <button
                onClick={clearInput}
                className="clear-button"
                aria-label="Clear input"
              >
                &times; {/* This is the 'x' symbol*/}
              </button>
            )}
            {/* CORRECTED LINE: Added className="search-button" */}
            <button
              type="button"
              onClick={handleSearch}
              className="search-button"
              disabled={isSearching || !link.trim() || !!error}
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </section>

        {searchResults.length > 0 && (
          <section className="results-section">
            <h2>Search Results:</h2>
            <div className="results-grid">
              {searchResults.map((result, index) => (
                <div key={index} className={`result-card ${result.source}`}>
                  <div className="result-header">
                    <h3>{result.platform}</h3>
                    <span className="confidence">
                      Confidence: {(result.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-link"
                  >
                    @{result.username}
                  </a>
                  {result.title && (
                    <p className="result-title">{result.title}</p>
                  )}
                  {result.description && (
                    <p className="result-description">{result.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {!isLoading && link && !error && (
          <section className="preview-section">
            <h2>Preview:</h2>
            <div className="preview-card">
              <LinkPreview url={link} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
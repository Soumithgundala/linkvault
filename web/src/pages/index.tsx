import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar"; // Make sure your Navbar component is at this path

// Define the shape of a single search result
interface SearchResult {
  platform: string;
  username: string;
  url: string;
  source: "database" | "discovered";
  confidence: number;
}

// It's a good practice to keep constants like this outside the component
const UNSPLASH_API_URL = "https://api.unsplash.com/photos/random";

export default function Home() {
  // --- STATE MANAGEMENT ---
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("/default-bg.jpg"); // Fallback BG
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // --- FUNCTIONS ---

  // Updates the query state as the user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setError(""); // Clear previous errors when user starts typing
  };

  // Clears the input field and search results
  const clearInput = () => {
    setQuery("");
    setError("");
    setSearchResults([]);
  };

  // Handles the API call to your search endpoint
  const handleSearch = async () => {
    // Prevent search for empty or whitespace-only queries
    if (!query.trim()) {
      return;
    }
    setIsSearching(true);
    setError("");
    setSearchResults([]); // Clear old results before new search

    try {
      // Fetch results from your Next.js API route
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An unknown error occurred during search.");
      }
      
      const data: SearchResult[] = await response.json();
      setSearchResults(data);

      if (data.length === 0) {
        setError("No profiles found for that username.");
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to perform search.");
      setSearchResults([]); // Ensure results are empty on error
    } finally {
      setIsSearching(false); // Re-enable the search button
    }
  };

  // --- SIDE EFFECTS ---

  // Fetches a random background image from Unsplash on initial component load
  useEffect(() => {
    const fetchBackground = async () => {
      // IMPORTANT: Move this key to a .env.local file for security
      // Create a file named .env.local and add: NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_key_here
      const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || "5R_DESU0FUmqo_L5imHUDNpL7HuS31KhUVVEE1HkwFk";

      if (!accessKey) {
        console.error("Unsplash access key is missing. Add NEXT_PUBLIC_UNSPLASH_ACCESS_KEY to your .env.local file.");
        return;
      }

      try {
        const response = await fetch(
          `${UNSPLASH_API_URL}?query=creative,abstract,tech&orientation=landscape`,
          {
            headers: {
              Authorization: `Client-ID ${accessKey}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch background from Unsplash");
        
        const data = await response.json();
        if (data.urls?.regular) {
          setBackgroundImage(data.urls.regular);
        }
      } catch (error) {
        console.error("Error fetching background:", error);
        // The fallback background is already set, so no action needed here
      }
    };

    fetchBackground();
  }, []); // Empty dependency array means this runs only once on mount

  // --- JSX RENDER ---
  return (
    <div
      className="page-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <Navbar />
      <main className="homepage-main">
        {/* This wrapper is key to the new, corrected layout.
            It groups the search input and results into a single, centered column. */}
        <div className="search-wrapper">
          
          {/* SEARCH INPUT SECTION */}
          <section className="input-section">
            <div className="input-group">
              <input
                id="linkInput"
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && !isSearching && handleSearch()}
                placeholder="Search for any user..."
                aria-label="Search for a user"
                disabled={isSearching}
              />
              {/* Show clear button only when there is text */}
              {query && !isSearching && (
                <button
                  onClick={clearInput}
                  className="clear-button"
                  aria-label="Clear input"
                >
                  &times;
                </button>
              )}
              <button
                type="button"
                onClick={handleSearch}
                className="search-button"
                disabled={isSearching || !query.trim()}
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
            {/* Display any error messages */}
            {error && <p className="error-message">{error}</p>}
          </section>

          {/* SEARCH RESULTS SECTION - Conditionally rendered */}
          {searchResults.length > 0 && (
            <section className="results-section">
              <div className="search-results-container">
                {searchResults.map((result) => (
                  <Link href={result.url} key={`${result.platform}-${result.username}`} className="result-card-link" passHref>
                      {/* Icon on the left */}
                      <div className="result-card-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>

                      {/* Text content in the middle */}
                      <div className="result-card-text">
                        <span className="result-card-username">{result.username}</span>
                        <span className="result-card-platform">{result.platform}</span>
                      </div>

                      {/* Chevron icon on the right */}
                      <div className="result-card-chevron">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
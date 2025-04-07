import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import LinkPreview from "@/components/LinkPreview";
import "@/styles/globals.css";

const UNSPLASH_API_URL = "https://api.unsplash.com/photos/random";

export default function Home() {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("/default-bg.jpg");
  const [isLoading, setIsLoading] = useState(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLink(value);
    setError(value && !isValidUrl(value) ? "Please enter a valid URL." : "");
  };

  const clearInput = () => {
    setLink("");
    setError("");
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
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
    <div className="page-container">
      <Navbar />
      <main>
        <section 
          className="hero" 
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="hero-overlay">
            <h1>Your Digital Identity. Sharper Than Ever.</h1>
            <p>Curate and flex your digital presence.</p>
          </div>
        </section>

        <section className="input-section">
          <label htmlFor="linkInput">Enter a URL:</label>
          <div className="input-group">
            <input
              id="linkInput"
              type="url"
              value={link}
              onChange={handleInputChange}
              placeholder="https://example.com"
              aria-label="Enter URL for preview"
            />
            <button 
              onClick={clearInput}
              aria-label="Clear input"
            >
              Clear
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </section>

        {!isLoading && link && !error && (
          <section className="preview-section">
            <h2>Preview:</h2>
            <div className="preview-card">
              <LinkPreview url={link} />
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>© 2025 LinkVault. All rights reserved.</p>
      </footer>
    </div>
  );
}
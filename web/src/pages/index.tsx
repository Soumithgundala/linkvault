// src/pages/index.tsx
import { useState } from "react";
import Navbar from "@/components/navbar";
import LinkPreview from "@/components/LinkPreview";

export default function Home() {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLink(value);

    // Basic URL validation
    if (value && !isValidUrl(value)) {
      setError("Please enter a valid URL.");
    } else {
      setError("");
    }
  };

  const clearInput = () => {
    setLink("");
    setError("");
  };

  // Helper function to validate URLs
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-3xl mx-auto p-6">
        {/* Hero Section */}
        <section className="text-center py-10">
          <h1 className="text-4xl font-bold text-gray-800">Discover Link Previews</h1>
          <p className="text-lg text-gray-600 mt-4">
            Enter a social media link to see a rich preview of its content.
          </p>
        </section>

        {/* Input Section */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <label htmlFor="linkInput" className="block text-lg font-medium text-gray-700">
            Enter a link:
          </label>
          <div className="mt-2 flex items-center space-x-2">
            <input
              id="linkInput"
              type="text"
              value={link}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className={`flex-grow border rounded-md px-4 py-2 focus:outline-none ${
                error ? "border-red-500" : "border-gray-300"
              }`}
            />
            <button
              onClick={clearInput}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            >
              Clear
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </section>

        {/* Preview Section */}
        {link && !error && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Preview:</h2>
            <div className="bg-white shadow-md rounded-lg p-6">
              <LinkPreview link={link} />
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 text-center">
        <p>© 2025 LinkVault. All rights reserved.</p>
      </footer>
    </div>
  );
}

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PreviewData {
  title: string;
  description: string;
  image: string;
  url: string;
  error?: string;
}

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const normalizeImageUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    parsed.protocol = 'https:';
    return parsed.toString();
  } catch {
    return null;
  }
};

export default function LinkPreview({ url }: { url: string }) {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isValidUrl(url)) {
      setError('Invalid URL');
      setLoading(false);
      return;
    }

    const fetchPreview = async () => {
      try {
        const encodedUrl = encodeURIComponent(url);
        const response = await fetch(`/api/preview?url=${encodedUrl}`);
        
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setPreview({
          title: data.title,
          description: data.description,
          image: data.image,
          url: data.url
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load preview');
        setPreview(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  if (loading) {
    return <div className="preview-loading p-4 text-gray-500">Loading preview...</div>;
  }

  if (error) {
    return (
      <div className="preview-error p-4 bg-red-50 text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!preview) return null;

  const safeImageUrl = preview.image ? normalizeImageUrl(preview.image) : null;
  const parsedUrl = new URL(preview.url);

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="preview-card block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      {safeImageUrl && (
        <div className="preview-image-container relative h-48 bg-gray-100">
          <Image
            src={safeImageUrl}
            alt={preview.title || 'Preview Image'}
            layout="fill"
            objectFit="cover"
            className="preview-image rounded-t-lg"
            onError={(e) => {
              const container = e.currentTarget.parentElement;
              if (container) {
                container.style.display='none';
              }
            }}
            unoptimized={process.env.NODE_ENV!=='production'}
          />

        </div>
      )}
      
      <div className="preview-content p-4">
        <div className="preview-domain text-sm text-gray-500 mb-1">
          {parsedUrl.hostname}
        </div>
        {preview.title && (
          <h3 className="preview-title font-semibold mb-2 truncate">
            {preview.title}
          </h3>
        )}
        {preview.description && (
          <p className="preview-description text-sm text-gray-600 line-clamp-2">
            {preview.description}
          </p>
        )}
      </div>
    </a>
  );
}
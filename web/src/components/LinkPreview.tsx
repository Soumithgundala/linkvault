import React from 'react';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface LinkPreviewProps {
  url: string;
  title?: string;
  description?: string;
  image?: string;
}

export default function LinkPreview({ url, title, description, image }: LinkPreviewProps) {
  return (
    <div className="max-w-2xl mx-auto mt-4">
      <a 
        href={url}
        target="_blank"
        rel="noopener noreferrer" 
        className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
      >
        <div className="flex items-start p-4">
          {image && (
            <div className="flex-shrink-0 w-24 h-24 mr-4">
              <Image
                src={image}
                alt={title || url}
                layout="intrinsic"
                objectFit="cover"
                className="rounded-md"
                width={96}
                height={96}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-image.png';
                }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {title || url}
              </h3>
              <ExternalLink className="h-4 w-4 text-gray-500 flex-shrink-0 ml-2" />
            </div>
            {description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {description}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-400 truncate">
              {url}
            </p>
          </div>
        </div>
      </a>
    </div>
  );
}
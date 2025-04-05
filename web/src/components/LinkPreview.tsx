import React, { useEffect, useState } from "react";
import Image from "next/image";

type PreviewData = {
  title: string;
  description: string;
  image: string;
  url: string;
};

export default function LinkPreview({ link }: { link: string }) {
  const [data, setData] = useState<PreviewData | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      const res = await fetch(`/api/preview?url=${encodeURIComponent(link)}`);
      const json = await res.json();
      setData(json);
    };

    if (link) fetchPreview();
  }, [link]);

  if (!data) return <p>Loading preview...</p>;

  return (
    <div className="p-4 rounded-xl shadow-md border max-w-md">
      <a href={data.url} target="_blank" rel="noopener noreferrer">
        {/* Use Next.js Image component for optimized image */}
        <div className="relative w-full h-48 mb-2">
          <Image
            src={data.image}
            alt={data.title}
            layout="fill" // This fills the parent container
            objectFit="cover" // Adjusts image sizing
            className="rounded-md"
          />
        </div>
        <h2 className="text-lg font-bold">{data.title}</h2>
        <p className="text-sm text-gray-500">{data.description}</p>
      </a>
    </div>
  );
}

import LinkPreview from '@/components/LinkPreview';
import { useState } from 'react';

export default function Home() {
  const [link, setLink] = useState('');

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-2">LinkVault Preview</h1>
      <input
        type="text"
        placeholder="Paste a link here"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        className="border px-3 py-2 w-full mb-4"
      />
      {link && <LinkPreview link={link} />}
    </main>
  );
}

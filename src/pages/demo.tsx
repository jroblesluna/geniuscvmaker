import React, { useEffect, useState } from 'react';
import { withProtected } from '../hook/route';
import { trimToMaxTokens } from '../utils/others';
import { ScrappingService } from '../service/ScrappingService';
import toast from 'react-hot-toast';

function Demo() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string>('');
  const [results, setResults] = useState<string>('');
  const pdfUrl = encodeURIComponent(
    'https://firebasestorage.googleapis.com/v0/b/geniuscvmaker.appspot.com/o/apps%2Foptimize%2FMOzzJbMkXbh8HkvyvqTsz58dPC62%2F20250408141716_Jose%20enrique%20mendo%20huapaya%20-%20Curriculum%20vitae.pdf?alt=media&token=608ab19f-a31b-472b-9a69-38d9fc3a57ee'
  );

  const handleScrape = async (): Promise<void> => {
    if (!url) {
      toast.error('Please enter a valid URL');
      return;
    }

    setResults('');
    try {
      const response: string = await ScrappingService(url);
      if (response) {
        setResults(`\`\`\`START OF REQUIREMENTS \n${response}\nEND OF REQUIREMENTS\`\`\``);
      }
    } catch (error) {
      toast.error('Failed to fetch scraping data');
      console.error('Failed to fetch scraping data:', error);
    }
  };

  const handleApiScrape = async (url: string): Promise<void> => {
    try {
      const response = await fetch(`/api/scraping?url=${encodeURIComponent(url)}`);

      const data = await response.json();
      console.log(data);
      if (data.content) {
        setResults(`\`\`\`START OF REQUIREMENTS \n${data.content}\nEND OF REQUIREMENTS\`\`\``);
      } else {
        toast.error('Failed to fetch scraping data');
      }
    } catch (error) {
      console.log('Error scrapping url ');
    }
  };

  const callPdf = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/extract-pdf?url=${pdfUrl}`);
      const data = await response.json();

      if (response.ok) {
        setText(data.text);
      } else {
        console.error('Error al extraer el PDF:', data.message);
      }
    } catch (error) {
      console.error('Error en la petición:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-8 flex  items-center justify-center flex-col">
        <div className="text-3xl font-bold mb-4 mt-5">Demo / test</div>
      </div>
      <div>
        <button
          onClick={callPdf}
          disabled={loading}
          className="bg-blue-700 text-white font-bold p-4"
        >
          {loading ? 'Procesando...' : 'Extraer Texto del PDF'}
        </button>
        <pre>{trimToMaxTokens(text)}</pre>
        <p>{text.length}</p>
      </div>
      <div className="p-4 space-y-4">
        <h2>Scrapping test</h2>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          className="border p-2 rounded w-full"
        />
        <button
          onClick={() => {
            handleApiScrape(url);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Scrape Data
        </button>
        {results && <pre className="bg-gray-100 p-4 mt-4 border rounded">{results}</pre>}
      </div>
    </div>
  );
}

export default withProtected(Demo);

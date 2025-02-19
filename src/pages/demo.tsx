import React, { useEffect, useState } from 'react';
import { withProtected } from '../hook/route';
import { trimToMaxTokens } from '../utils/others';

function Demo() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const pdfUrl = encodeURIComponent(
    'https://firebasestorage.googleapis.com/v0/b/geniuscvmaker.appspot.com/o/apps%2Foptimize%2FMOzzJbMkXbh8HkvyvqTsz58dPC62%2F20250204145344_Jose%20enrique%20mendo%20huapaya%20-%20Curriculum%20vitae.pdf?alt=media&token=de32c0c5-c3cb-4456-83ae-587eef8e34de'
  );

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
    </div>
  );
}

export default withProtected(Demo);

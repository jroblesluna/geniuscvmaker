import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import pdfParse from 'pdf-parse';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const pdfUrl = req.query.url as string;

    if (!pdfUrl) {
      return res.status(400).json({ message: 'Se requiere la URL del PDF' });
    }

    // Descargar el PDF desde la URL
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });

    // Extraer texto del PDF
    const data = await pdfParse(response.data);

    res.status(200).json({ text: data.text });
  } catch (error) {
    console.error('Error al procesar el PDF:', error);
    res.status(500).json({ message: 'Error al procesar el PDF', error });
  }
}

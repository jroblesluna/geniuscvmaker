import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { withProtected } from '../hook/route';
import { Button } from '@nextui-org/react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/router';

function Optimize({ auth }) {
  const { user } = auth;
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);
  const router = useRouter();

  const onDrop = (acceptedFiles: File[], fileRejections: any) => {
    // Reset previous state
    setFile(null);
    setError(null);

    if (fileRejections.length > 0) {
      setError(
        'The file is invalid. Make sure the file is a DOC, DOCX or PDF and does not exceed 10MB.'
      );
      return;
    }

    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const dropzoneStyle: React.CSSProperties = {
    border: isDragActive ? '2px solid #FF4F22' : '2px dashed #FF4F22',
    backgroundColor: isDragActive ? '#ffede9' : '#ffffff',
    color: isDragActive ? '#FF4F22' : '#000000',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
  };

  const uploadFileToFirebase = async () => {
    if (file && user) {
      setUploading(true);
      const storage = getStorage();

      // Generate the timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:.TZ]/g, '')
        .slice(0, 14); // yyyyMMddHHmmss

      // Generate the storage path with timestamp
      const storagePath = `/apps/optimize/${user.uid}/${timestamp}_${file.name}`;

      const storageRef = ref(storage, storagePath);
      try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        setDownloadURL(downloadURL);
        setUploading(false);
        alert('File uploaded successfully');
      } catch (error) {
        console.error('Upload failed:', error);
        setError('Upload failed. Please try again.');
        setUploading(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-8 flex  items-center justify-center">
        <div className="text-3xl font-bold mb-4 mt-5">Optimize CV</div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full m-1 rounded-xl ">
          <div className="w-full md:w-auto flex  items-center  justify-center  h-[50vh]">
            <div
              {...getRootProps({ className: 'dropzone' })}
              style={dropzoneStyle}
              className="hover:opacity-75 h-[25vh] my-auto  "
            >
              <img
                src="https://www.svgrepo.com/show/28557/upload-sign.svg"
                width={35}
                className="mx-auto my-3"
              />
              <input {...getInputProps()} />
              <p>Drag and drop a file here, or click to select a file</p>
              <em>(Only DOC, DOCX and PDF files with a maximum size of 10MB are accepted)</em>
            </div>
            <div>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {file && (
                <div>
                  <p>File ready to Optimize:</p>
                  <p className="text-green-700 font-bold">{file.name}</p>
                  <Button
                    className="appBlackOnCitrine w-1/2"
                    onClick={uploadFileToFirebase}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Optimize CV'}
                  </Button>
                </div>
              )}
              {downloadURL && (
                <div>
                  <p>Download URL:</p>
                  <a href={downloadURL} target="_blank" rel="noopener noreferrer">
                    {downloadURL}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withProtected(Optimize);

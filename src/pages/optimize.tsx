import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { withProtected } from '../hook/route';
import { Button } from '@nextui-org/react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

function Optimize({ auth }) {
  const { user } = auth;
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);

  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      setPreviewUrl(URL.createObjectURL(acceptedFiles[0]));
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
        toast.success('File uploaded successfully');
        return downloadURL;
      } catch (error) {
        console.error('Upload failed:', error);
        setError('Upload failed. Please try again.');
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const ulr = await uploadFileToFirebase();
    if (!ulr) {
      toast.error('Error: File link not found.');
    } else {
      setUploading(true);
      const response = await fetch('/api/geniuscvmaker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          geniusApp: 'optimize',
          geniusBody: {
            url_cv: ulr,
          },
          status: 'writing',
        }),
      });
      const data = await response.json();
      if (data.requestPath != undefined) {
        toast.success('You created a new CV Request: ' + data.requestPath.split('/').pop());
      } else {
        toast.error('Error creating CV request. Please contact Support.');
      }

      router.push('/cvList');
    }
  };

  const clearPreviewFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-8 flex  items-center justify-center">
        <div className="text-3xl font-bold mb-4 mt-5">Optimize CV</div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full m-1 rounded-xl ">
          <div className="w-full md:w-auto flex  items-center  justify-center  h-auto md:h-[50vh]   ">
            {!previewUrl ? (
              <div
                {...getRootProps({ className: 'dropzone' })}
                style={dropzoneStyle}
                className="hover:opacity-75  h-[30vh] my-auto min-w-[50vw] flex flex-col justify-center "
              >
                <img
                  src="https://www.svgrepo.com/show/28557/upload-sign.svg"
                  width={35}
                  className="mx-auto my-3"
                />
                <input {...getInputProps()} />
                <p>Drag and drop a file here, or click to select a file</p>
                <em>
                  (Only DOC, DOCX and PDF files with a maximum size of 10MB are accepted)
                </em>
              </div>
            ) : (
              <div className=" flex md:flex-row-reverse  flex-col-reverse  gap-10 items-center  mt-2 md:mt-24">
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {file && (
                  <div className="w-fit flex flex-col items-end">
                    <div
                      className="bg-red-600 w-fit text-white font-bold px-3 py-1 rounded-full text-[18px] cursor-pointer hover:opacity-85 "
                      onClick={clearPreviewFile}
                    >
                      x
                    </div>
                    <div className="flex flex-col gap-1 max-w-[80vw] min-w-[80vw]  md:max-w-[30vw]  md:min-w-[30vw]">
                      <p>File ready to Optimize:</p>
                      <p className="text-gray-700 font-bold">{file.name}</p>
                      <Button
                        className="appBlackOnCitrine w-full mt-1"
                        onClick={handleSubmit}
                        disabled={uploading}
                      >
                        {uploading ? 'Uploading...' : 'Optimize CV'}
                      </Button>
                    </div>
                  </div>
                )}
                <div className="max-w-[90vw] min-w-[90vw]  md:max-w-[50vw]  md:min-w-[50vw]">
                  {previewUrl && <iframe src={previewUrl} width="100%" height="500px" />}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withProtected(Optimize);

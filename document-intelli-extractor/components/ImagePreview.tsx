
import React from 'react';

interface ImagePreviewProps {
  imageUrl: string | null;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl }) => {
  if (!imageUrl) {
    return null;
  }

  return (
    <div className="mt-6 p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Image Preview:</h3>
      <img 
        src={imageUrl} 
        alt="Uploaded document preview" 
        className="max-w-full h-auto rounded-md border border-gray-200" 
        style={{ maxHeight: '400px', margin: '0 auto' }}
      />
    </div>
  );
};

export default ImagePreview;

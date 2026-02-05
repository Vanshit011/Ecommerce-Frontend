import React from "react";

const ImagePreviewModal = ({ previewImage, setPreviewImage }) => {
  if (!previewImage) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-[1000] backdrop-blur-sm p-4"
      onClick={() => setPreviewImage(null)}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={previewImage}
          alt="Preview"
          className="max-w-full max-h-full object-contain drop-shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center text-2xl font-bold transition-colors backdrop-blur-md border border-white/20"
          onClick={() => setPreviewImage(null)}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ImagePreviewModal;

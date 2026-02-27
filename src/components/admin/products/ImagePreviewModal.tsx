import React, { useEffect, useRef } from "react";

const ImagePreviewModal = ({ previewImage, setPreviewImage }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setPreviewImage(null);
      }
    };

    if (previewImage) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [previewImage, setPreviewImage]);

  if (!previewImage) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-[1000] backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-6">
        <div
          ref={modalRef}
          className="relative max-w-[90vw] max-h-[80vh] bg-white p-2 rounded-3xl shadow-2xl animate-scale-up border border-white/10"
        >
          <img
            src={previewImage}
            alt="Preview"
            className="w-full h-full object-contain rounded-2xl"
          />
        </div>

        <button
          className="group flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all border border-white/10 backdrop-blur-xl active:scale-95"
          onClick={() => setPreviewImage(null)}
        >
          <span className="text-xl font-bold transition-transform group-hover:rotate-90">✕</span>
          <span className="text-sm font-black uppercase tracking-widest">Close Preview</span>
        </button>
      </div>
    </div>
  );
};

export default ImagePreviewModal;

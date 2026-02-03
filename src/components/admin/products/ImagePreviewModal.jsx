import React from "react";

const ImagePreviewModal = ({ previewImage, setPreviewImage }) => {
    if (!previewImage) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
        >
            <div
                className="relative bg-white rounded-2xl p-4 max-w-3xl max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <img src={previewImage} alt="Preview" className="w-full h-auto rounded-lg" />
                <button
                    className="absolute top-2 right-2 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center text-xl font-bold hover:bg-red-600 transition-colors"
                    onClick={() => setPreviewImage(null)}
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default ImagePreviewModal;

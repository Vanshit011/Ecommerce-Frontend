import React, { useState } from "react";

const ImageMagnifier = ({
    src,
    width,
    height,
    zoomLevel = 3.5,
    className = ""
}) => {
    const [showMagnifier, setShowMagnifier] = useState(false);
    const [[x, y], setXY] = useState([0, 0]);
    const [[imgWidth, imgHeight], setSize] = useState([0, 0]);

    // Dimensions for the zoom window
    const zoomWindowSize = 500;
    const gap = 80;

    return (
        <div
            className={`relative inline-block ${className}`}
            style={{
                width: width,
                height: height
            }}
        >
            <img
                src={src}
                className="w-full h-full object-contain"
                onMouseEnter={(e) => {
                    const elem = e.currentTarget;
                    const { width, height } = elem.getBoundingClientRect();
                    setSize([width, height]);
                    setShowMagnifier(true);
                }}
                onMouseMove={(e) => {
                    const elem = e.currentTarget;
                    const { top, left } = elem.getBoundingClientRect();

                    // Calculate cursor position on the image
                    const x = e.pageX - left - window.pageXOffset;
                    const y = e.pageY - top - window.pageYOffset;
                    setXY([x, y]);
                }}
                onMouseLeave={() => {
                    setShowMagnifier(false);
                }}
                alt="Product"
            />

            {/* SIDE ZOOM PANEL */}
            {showMagnifier && (
                <div
                    className="hidden lg:block z-[100] bg-white shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-slate-100 rounded-[2.5rem] overflow-hidden animate-fade-in"
                    style={{
                        position: "absolute",
                        left: `calc(100% + ${gap}px)`,
                        top: "-20%",
                        width: `${zoomWindowSize}px`,
                        height: `${zoomWindowSize}px`,
                        backgroundImage: `url('${src}')`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`,
                        backgroundPositionX: `${-x * zoomLevel + zoomWindowSize / 2}px`,
                        backgroundPositionY: `${-y * zoomLevel + zoomWindowSize / 2}px`,
                        pointerEvents: 'none',
                        // Adding background-clip to ensure it looks clean
                        backgroundOrigin: 'border-box'
                    }}
                >
                </div>
            )}

            {/* LENS ON IMAGE */}
            {showMagnifier && (
                <div
                    className="hidden lg:block absolute bg-blue-500/5 backdrop-blur-[1px] border-2 border-slate-900 shadow-2xl rounded-2xl cursor-crosshair pointer-events-none transition-transform duration-75"
                    style={{
                        height: `${zoomWindowSize / zoomLevel}px`,
                        width: `${zoomWindowSize / zoomLevel}px`,
                        top: `${y - (zoomWindowSize / zoomLevel) / 2}px`,
                        left: `${x - (zoomWindowSize / zoomLevel) / 2}px`,
                    }}
                >
                    {/* Crosshair design */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <div className="w-full h-px bg-slate-900" />
                        <div className="h-full w-px bg-slate-900 absolute" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageMagnifier;

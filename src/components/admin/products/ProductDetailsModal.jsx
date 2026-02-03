import React from "react";

const ProductDetailsModal = ({
    viewProduct,
    setViewProduct,
    getImageUrl,
    getCategoryPath,
    handleEditClick
}) => {
    if (!viewProduct) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-4 md:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{viewProduct.name}</h2>
                        <p className="text-sm text-slate-500">ID: {viewProduct.id || viewProduct._id}</p>
                    </div>
                    <button
                        onClick={() => setViewProduct(null)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <img
                            src={getImageUrl(viewProduct)}
                            alt={viewProduct.name}
                            className="w-full h-64 object-cover rounded-2xl border border-slate-200"
                        />
                        {viewProduct.images && viewProduct.images.length > 0 && (
                            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                {viewProduct.images.map((img, i) => (
                                    <img
                                        key={i}
                                        src={typeof img === 'string' ? img : img.url}
                                        className="w-16 h-16 object-cover rounded-lg border border-slate-200 flex-shrink-0 cursor-pointer hover:border-blue-500"
                                        alt=""
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Price</p>
                                <p className="text-lg font-bold text-slate-800">₹{viewProduct.price}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                <p className="text-[10px] uppercase font-bold text-green-400 mb-1">Sale Price</p>
                                <p className="text-lg font-bold text-green-700">{viewProduct.salePrice ? `₹${viewProduct.salePrice}` : "N/A"}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                <p className="text-[10px] uppercase font-bold text-blue-400 mb-1">SKU</p>
                                <p className="font-semibold text-blue-700">{viewProduct.sku || "N/A"}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Stock</p>
                                <p className="font-semibold text-slate-700">{viewProduct.stockQty || 0} units</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-400 uppercase">Category</p>
                            <p className="text-sm font-medium text-slate-600">{getCategoryPath(viewProduct.categoryId)}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-400 uppercase">Brand</p>
                            <p className="text-sm font-medium text-slate-600">{viewProduct.brand || "Generic"}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-400 uppercase">Availability</p>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${viewProduct.availability === 'INSTOCK' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {viewProduct.availability?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-2 border-l-4 border-blue-500 pl-2">Description</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{viewProduct.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Specifications</h3>
                            <ul className="text-sm space-y-1 text-slate-600">
                                {viewProduct.weight && <li>Weight: {viewProduct.weight}kg</li>}
                                {viewProduct.dimensions && (
                                    <li>Size: {viewProduct.dimensions.length}x{viewProduct.dimensions.width}x{viewProduct.dimensions.height} cm</li>
                                )}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Options</h3>
                            <div className="flex flex-wrap gap-1">
                                {viewProduct.sizes?.map(s => <span key={s} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600 font-medium">{s}</span>)}
                                {viewProduct.colors?.map(c => <span key={c} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600 font-medium">{c}</span>)}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-1">
                                {viewProduct.tags?.map(t => <span key={t} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium">#{t}</span>)}
                            </div>
                        </div>
                    </div>

                    {(viewProduct.metaTitle || viewProduct.metaDescription) && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">SEO / Meta Data</h3>
                            {viewProduct.metaTitle && <p className="text-sm font-bold text-slate-800 mb-1">{viewProduct.metaTitle}</p>}
                            {viewProduct.metaDescription && <p className="text-xs text-slate-600">{viewProduct.metaDescription}</p>}
                        </div>
                    )}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100">
                    <button
                        onClick={() => setViewProduct(null)}
                        className="w-full sm:w-auto px-6 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors order-2 sm:order-1"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            handleEditClick(viewProduct);
                            setViewProduct(null);
                        }}
                        className="w-full sm:w-auto px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md order-1 sm:order-2"
                    >
                        Edit Product
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsModal;

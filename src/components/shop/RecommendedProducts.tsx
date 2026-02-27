import React from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUtils";
import { Product } from "../../types";

interface RecommendedProductsProps {
  products: Product[];
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({ products }) => {
  const navigate = useNavigate();

  if (!products || products.length === 0) return null;

  return (
    <div className="mt-24 mb-16 px-4">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            You May Also Like
          </h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">
            AI-Curated Recommendations Just For You
          </p>
        </div>
        <div className="hidden sm:flex gap-2">
          <div className="w-10 h-[2px] bg-blue-600 rounded-full" />
          <div className="w-4 h-[2px] bg-slate-200 rounded-full" />
          <div className="w-4 h-[2px] bg-slate-200 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.slice(0, 4).map((product) => (
          <div
            key={(product as any).id || product._id}
            onClick={() => {
              navigate(`/product/${(product as any).id || product._id}`);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col h-full cursor-pointer p-5"
          >
            <div className="aspect-square bg-slate-50 rounded-[1.5rem] overflow-hidden mb-5 relative group-hover:bg-blue-50/50 transition-colors">
              <img
                src={getImageUrl(product)}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 p-4"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/80 backdrop-blur-md text-blue-600 text-[9px] font-black uppercase tracking-wider rounded-full shadow-sm border border-white/50">
                  {(product.category as any)?.name || "Hot Pick"}
                </span>
              </div>
            </div>

            <div className="flex flex-col flex-1 px-1">
              <h3 className="font-bold text-slate-800 truncate text-lg group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-bold">
                {product.brand || "Artist's Edition"}
              </p>

              <div className="mt-auto pt-5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xl font-black text-slate-900">
                    ₹
                    {(
                      product.variants?.[0]?.sale_price ||
                      product.variants?.[0]?.price ||
                      product.sale_price ||
                      product.price ||
                      0
                    ).toLocaleString()}
                  </span>
                  {(product.variants?.[0]?.sale_price || product.sale_price) && (
                    <span className="text-[10px] text-slate-400 line-through font-bold opacity-60">
                      ₹{(product.variants?.[0]?.price || product.price || 0).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="w-10 h-10 bg-slate-50 group-hover:bg-blue-600 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-white transition-all shadow-sm group-hover:shadow-blue-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;

import React from "react";

export const ProductSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden animate-pulse flex flex-col h-full">
      <div className="aspect-[4/5] bg-slate-100" />
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="h-6 bg-slate-100 rounded-lg w-3/4" />
        <div className="h-3 bg-slate-50 rounded-lg w-1/2" />
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
          <div className="space-y-2">
            <div className="h-3 bg-slate-50 rounded-lg w-10" />
            <div className="h-6 bg-slate-100 rounded-lg w-20" />
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

export const CategorySkeleton = () => {
  return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-8 bg-slate-50 rounded-xl w-full" />
      ))}
    </div>
  );
};

export const CartSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-40 bg-white rounded-3xl border border-slate-100 p-6 flex gap-6">
        <div className="w-28 h-28 bg-slate-100 rounded-2xl" />
        <div className="flex-1 space-y-4">
          <div className="h-6 bg-slate-100 rounded-lg w-1/3" />
          <div className="h-4 bg-slate-100 rounded-lg w-1/4" />
          <div className="h-4 bg-slate-50 rounded-lg w-1/6" />
        </div>
      </div>
      <div className="h-40 bg-white rounded-3xl border border-slate-100 p-6 flex gap-6 text-opacity-0">
        <div className="w-28 h-28 bg-slate-100 rounded-2xl" />
        <div className="flex-1 space-y-4">
          <div className="h-6 bg-slate-100 rounded-lg w-1/2" />
          <div className="h-4 bg-slate-100 rounded-lg w-1/4" />
        </div>
      </div>
    </div>
  );
};
export const ProductDetailSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 animate-pulse">
      <div className="flex justify-between items-center mb-8">
        <div className="h-4 bg-slate-100 rounded-lg w-48" />
        <div className="h-10 bg-slate-100 rounded-xl w-10 sm:w-24" />
      </div>
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-6 md:p-10 border-r border-slate-50">
            <div className="aspect-square bg-slate-100 rounded-3xl mb-6" />
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 h-20 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          </div>
          <div className="p-6 md:p-10 lg:p-14 space-y-8">
            <div className="space-y-4">
              <div className="h-6 bg-slate-100 rounded-full w-24" />
              <div className="h-12 bg-slate-100 rounded-2xl w-3/4" />
              <div className="h-6 bg-slate-100 rounded-lg w-1/2" />
            </div>
            <div className="h-32 bg-slate-50 rounded-[2rem]" />
            <div className="space-y-4">
              <div className="h-4 bg-slate-100 rounded-lg w-1/4" />
              <div className="h-24 bg-slate-50 rounded-2xl" />
            </div>
            <div className="flex gap-4 pt-4">
              <div className="h-16 bg-slate-100 rounded-2xl flex-1" />
              <div className="h-16 bg-slate-100 rounded-2xl flex-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

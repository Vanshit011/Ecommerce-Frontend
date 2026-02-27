import React, { useState, useEffect } from "react";
import { getAllCoupons } from "../../services/api";
import { Coupon, CartItem } from "../../types";

interface CouponListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (code: string) => void;
  currentTotal: number;
  cartItems?: CartItem[];
}

const CouponListModal: React.FC<CouponListModalProps> = ({
  isOpen,
  onClose,
  onApply,
  currentTotal,
  cartItems = [],
}) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchCoupons = async () => {
        try {
          setLoading(true);
          const res = await getAllCoupons();
          // Filter to show only active coupons that are currently valid
          const now = new Date();
          const allCoupons: Coupon[] = (res.data as any).data || (res.data as any) || [];
          const activeCoupons = allCoupons.filter((c) => {
            if (!c.isActive && !c.is_active) return false;
            if (c.start_date && new Date(c.start_date) > now) return false;
            if (c.end_date && new Date(c.end_date) < now) return false;
            if (c.usage_limit > 0 && c.used_count >= c.usage_limit) return false;
            return true;
          });
          setCoupons(activeCoupons);
        } catch (err) {
          console.error("Failed to load coupons", err);
        } finally {
          setLoading(false);
        }
      };
      fetchCoupons();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-zoom-in">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Available Offers</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm active:scale-90"
          >
            ✕
          </button>
        </div>

        <div className="p-8 max-h-[60vh] overflow-y-auto scrollbar-hide space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                Fetching best deals...
              </p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🏷️</div>
              <p className="text-slate-600 font-bold">No coupons available right now.</p>
              <p className="text-slate-400 text-sm mt-1">Check back later for new offers!</p>
            </div>
          ) : (
            coupons.map((coupon) => {
              const isAmountEligible = currentTotal >= coupon.min_order_amount;

              // A coupon is scope-eligible if it has no products (Global)
              // OR if at least one cart item matches a product in the coupon's product list
              const isScopeEligible =
                !coupon.products ||
                coupon.products.length === 0 ||
                cartItems.some((item) =>
                  coupon.products?.some(
                    (cp: any) => (cp.id || cp) === (item.product?.id || item.product?._id),
                  ),
                );

              const isEligible = isAmountEligible && isScopeEligible;

              return (
                <div
                  key={coupon._id || coupon.id}
                  className={`relative p-6 rounded-3xl border-2 transition-all ${
                    isEligible
                      ? "border-emerald-100 bg-emerald-50/30 hover:border-emerald-200 hover:bg-emerald-50/50 shadow-sm"
                      : "border-slate-100 bg-slate-50/50 opacity-70 grayscale-[0.5]"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div
                        className={`px-4 py-2 rounded-xl border shadow-sm inline-block mb-3 transition-colors ${
                          isEligible ? "bg-white border-slate-200" : "bg-slate-100 border-slate-200"
                        }`}
                      >
                        <span
                          className={`font-black tracking-widest text-sm uppercase ${
                            isEligible ? "text-slate-800" : "text-slate-400"
                          }`}
                        >
                          {coupon.code}
                        </span>
                      </div>
                      <h3
                        className={`text-xl font-black tracking-tight transition-colors ${
                          isEligible ? "text-slate-900" : "text-slate-500"
                        }`}
                      >
                        {coupon.discount_type.toUpperCase() === "PERCENTAGE"
                          ? `${coupon.discount_value}% OFF`
                          : `₹${coupon.discount_value.toLocaleString()} OFF`}
                      </h3>
                    </div>
                    {isEligible ? (
                      <button
                        onClick={() => onApply(coupon.code)}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-bold text-xs hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
                      >
                        Apply
                      </button>
                    ) : (
                      <div className="text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                          {!isScopeEligible ? "Invalid for Cart" : "Below Min Total"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-medium ${isEligible ? "text-slate-600" : "text-slate-400"}`}
                      >
                        Min order:{" "}
                        <span className="font-bold">
                          ₹{coupon.min_order_amount.toLocaleString()}
                        </span>
                      </p>
                      {(coupon.products?.length || 0) > 0 && (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                            isScopeEligible
                              ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                              : "bg-slate-100 text-slate-400 border-slate-200"
                          }`}
                        >
                          Specific Items
                        </span>
                      )}
                    </div>

                    {!isEligible && (
                      <div className="mt-2 p-3 bg-white/50 rounded-xl border border-slate-100">
                        {!isScopeEligible ? (
                          <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span className="text-sm">⚠️</span>
                            Not applicable to items in your bag
                          </p>
                        ) : (
                          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span className="text-sm">💡</span>
                            Add ₹{(coupon.min_order_amount - currentTotal).toLocaleString()} more to
                            unlock
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Aesthetic semi-circles for ticket effect */}
                  <div
                    className={`absolute top-1/2 -left-3 w-6 h-6 bg-white border-r-2 rounded-full -translate-y-1/2 transition-colors ${
                      isEligible ? "border-emerald-100" : "border-slate-100"
                    }`}
                  />
                  <div
                    className={`absolute top-1/2 -right-3 w-6 h-6 bg-white border-l-2 rounded-full -translate-y-1/2 transition-colors ${
                      isEligible ? "border-emerald-100" : "border-slate-100"
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Offers are subject to terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
};

export default CouponListModal;

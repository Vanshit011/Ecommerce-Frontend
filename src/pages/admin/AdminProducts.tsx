import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import {
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  bulkUpdateVariants,
  updateProductVariants,
  addVariant,
  deleteVariant,
} from "../../services/api";
import { getImageUrl } from "../../utils/imageUtils";
import {
  Product,
  CategoryTree,
  Order,
  User,
  ApiResponse,
  ProductFormData,
  VariantFormData,
} from "../../types";

// Modular Components
import ProductTable from "../../components/admin/products/ProductTable";
import ProductModal from "../../components/admin/products/ProductModal";
import ProductDetailsModal from "../../components/admin/products/ProductDetailsModal";
import ImagePreviewModal from "../../components/admin/products/ImagePreviewModal";

const initialForm: ProductFormData = {
  name: "",
  description: "",
  brand: "",
  category: "",
  image: null,
  images: [],
  has_variants: true,
  variants: [{ color: "", size: "", price: "", stock_qty: "", sku: "" }],
  specifications: {},
  isActive: true,
  mainImageIndex: 0,
  availability: "INSTOCK",
};

const AdminProducts: React.FC = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // State Management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  // Pagination & Search State
  const [page, setPage] = useState<number>(Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = useState<number>(Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = useState<string>(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState<string>(search);
  const [meta, setMeta] = useState<any>(null);

  const [formData, setFormData] = useState<ProductFormData>(initialForm);

  /*  DATA FETCHING  */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategories();
      const data =
        res?.data?.data ||
        res?.data?.categories ||
        (Array.isArray(res?.data) ? (res.data as any) : []);
      setCategories(data);
    } catch (err) {
      console.error("Fetch Categories Error:", err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, search: debouncedSearch };
      const res = await getMyProducts(params);

      const rawData = res.data;
      let productList: Product[] = [];
      let metadata: any = null;

      if (Array.isArray(rawData)) {
        productList = rawData;
      } else if (rawData?.data && Array.isArray(rawData.data)) {
        productList = rawData.data;
        metadata = rawData.meta || rawData.pagination;
      } else if (rawData?.products && Array.isArray(rawData.products)) {
        productList = rawData.products;
        metadata = rawData.meta || rawData.pagination;
      }

      setProducts(productList);
      setMeta(metadata);
    } catch (err) {
      console.error("Fetch Error:", err);
      setProducts([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  /*  SYNC URL PARAMS  */
  const handlePageChange = useCallback(
    (newPage: number) => {
      const newParams = new URLSearchParams(searchParams);
      if (newPage === 1) newParams.delete("page");
      else newParams.set("page", String(newPage));
      setSearchParams(newParams, { replace: true });
      setPage(newPage);
    },
    [searchParams, setSearchParams],
  );

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      const newParams = new URLSearchParams(searchParams);
      if (newLimit === 10) newParams.delete("limit");
      else newParams.set("limit", String(newLimit));
      newParams.delete("page"); // Reset to page 1 on limit change
      setSearchParams(newParams, { replace: true });
      setLimit(newLimit);
      setPage(1);
    },
    [searchParams, setSearchParams],
  );

  const updateURL = useCallback(
    (params: Record<string, any>) => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(params).forEach(([key, value]) => {
        if (
          value === undefined ||
          value === "" ||
          value === 0 ||
          (key === "page" && value === 1) ||
          (key === "limit" && value === 10)
        ) {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  // Effects for Data and Sync
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  useEffect(() => {
    const p = Number(searchParams.get("page")) || 1;
    const l = Number(searchParams.get("limit")) || 10;
    const s = searchParams.get("search") || "";
    const action = searchParams.get("action");
    const categoryId = searchParams.get("categoryId");

    if (action === "add") {
      setIsEditingId(null);
      setFormData({
        ...initialForm,
        category: categoryId || "",
      });
      setShowModal(true);

      // Clean up the URL to prevent re-opening on refresh
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("action");
      newParams.delete("categoryId");
      setSearchParams(newParams, { replace: true });
    }

    // Only update state if values actually changed to avoid unnecessary re-renders
    setPage((prev) => (p !== prev ? p : prev));
    setLimit((prev) => (l !== prev ? l : prev));
    setSearch((prev) => (s !== prev ? s : prev));
    setDebouncedSearch((prev) => (s !== prev ? s : prev));
  }, [searchParams, setSearchParams]); // Only depend on searchParams

  useEffect(() => {
    const t = setTimeout(() => {
      if (debouncedSearch !== search) {
        if (search.length >= 3 || search.length === 0) {
          updateURL({ search, page: 1 });
        }
      }
    }, 500);
    return () => clearTimeout(t);
  }, [search, updateURL, debouncedSearch]);

  /*  HELPERS  */
  const getCategoryPath = (categoryId: string) => {
    if (!categoryId) return "Uncategorized";
    const flatten = (cats: CategoryTree[]): CategoryTree[] => {
      let res: CategoryTree[] = [];
      cats.forEach((c) => {
        res.push(c);
        if (c.children) res.push(...flatten(c.children));
      });
      return res;
    };
    const all = flatten(categories);
    const find = (id: string) => all.find((c) => String(c._id || (c as any).id) === String(id));
    const build = (id: string, path: string[] = []): string[] => {
      const c = find(id);
      if (!c) return path;
      path.unshift(c.name);
      const parentId = c.parent ? (typeof c.parent === "string" ? c.parent : c.parent._id) : null;
      const pId = (c as any).parentId || parentId;
      return pId ? build(String(pId), path) : path;
    };
    const path = build(categoryId);
    return path.length > 0 ? path.join(" > ") : "Uncategorized";
  };

  const flattenedForDropdown = (() => {
    const result: any[] = [];
    const traverse = (cats: CategoryTree[], level = 0) => {
      cats.forEach((c) => {
        const hasChildren = (c.children?.length ?? 0) > 0;
        const indent = "  ".repeat(level);
        const prefix = level === 0 ? (hasChildren ? "▼ " : "• ") : hasChildren ? "└─▼ " : "└─• ";
        result.push({ ...c, displayName: indent + prefix + c.name });
        if (c.children && hasChildren) traverse(c.children, level + 1);
      });
    };
    const roots = categories.filter((c) => {
      const parentId = c.parent ? (typeof c.parent === "string" ? c.parent : c.parent._id) : null;
      const pId = (c as any).parentId || parentId;
      return !pId;
    });
    traverse(roots);
    return result;
  })();

  /*  HANDLERS  */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const files = (e.target as HTMLInputElement).files;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleEditClick = (product: Product) => {
    setFormData({
      ...product,
      category:
        (product as any).category_id ||
        (product as any).categoryId ||
        (typeof product.category === "string" ? product.category : product.category._id) ||
        "",
      brand: product.brand || "",
      sku: product.sku || "",
      image: product.image || null,
      images: product.images || [],
      has_variants: true,
      variants:
        product.variants?.length > 0
          ? product.variants.map((v) => ({
              ...v,
              stock_qty: v.stock_qty ?? (v as any).stockQty,
            }))
          : [{ color: "", size: "", price: "", stock_qty: "", sku: "" }],
      isActive: product.isActive ?? (product as any).is_active ?? true,
      mainImageIndex: product.mainImageIndex ?? (product as any).main_image_index ?? 0,
      availability: product.availability || "INSTOCK",
    });
    setIsEditingId(product.id || (product as any)._id);
    setShowModal(true);
  };

  const handleUpdateOrCreateVariant = async (
    variantIndex: number,
    variantData: VariantFormData,
  ) => {
    if (!isEditingId) return;
    try {
      setIsSubmitting(true);
      const payload = {
        price: variantData.price,
        stock_qty: variantData.stock_qty || variantData.stockQty,
        color: variantData.color,
        size: variantData.size,
        sku: variantData.sku,
      };

      const variantId = variantData.id || variantData._id;
      let res: ApiResponse<Product> | any;

      if (variantId) {
        res = await updateProductVariants(isEditingId, variantId, payload);
        showToast("Variant updated successfully");
      } else {
        res = await addVariant(isEditingId, payload);
        showToast("New variant added successfully");
      }

      // Update local state instantly with server response
      const serverResponse = res.data?.data || res.data || res;
      // Handle potential nested structures or direct objects
      const updatedVariant =
        serverResponse?.id || serverResponse?._id
          ? serverResponse
          : serverResponse?.variant || serverResponse;

      if (updatedVariant && (updatedVariant.id || updatedVariant._id)) {
        // 1. Update formData for the modal (Saves the new ID so next click is an Update)
        setFormData((prev) => {
          const newVariants = [...(prev.variants || [])];
          newVariants[variantIndex] = { ...newVariants[variantIndex], ...updatedVariant };
          return { ...prev, variants: newVariants };
        });

        // 2. Update products list for the background table
        setProducts((prev) =>
          prev.map((p) => {
            if (String(p.id || (p as any)._id) === String(isEditingId)) {
              let variantExists = false;
              const newVariants = (p.variants || []).map((v) => {
                if (String(v.id || (v as any)._id) === String(variantId)) {
                  variantExists = true;
                  return { ...v, ...updatedVariant };
                }
                return v;
              });

              // If it's a brand new variant or wasn't found in current variants list
              if (!variantId || !variantExists) {
                // Prevent duplicate addition if already somehow added
                const alreadyExists = newVariants.find(
                  (v) =>
                    String(v.id || (v as any)._id) ===
                    String(updatedVariant.id || updatedVariant._id),
                );
                if (!alreadyExists) {
                  newVariants.push(updatedVariant);
                }
              }

              return { ...p, variants: newVariants };
            }
            return p;
          }),
        );
      }
    } catch (err) {
      console.error(err);
      showToast(
        variantData.id || variantData._id ? "Error updating variant" : "Error adding variant",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkUpdateVariantsAction = async () => {
    if (!isEditingId) return;
    try {
      setIsSubmitting(true);
      const payload = {
        variants: formData.variants.map((v) => ({
          id: v.id || v._id,
          price: v.price,
          stock_qty: v.stock_qty || v.stockQty,
        })),
      };
      const res = await bulkUpdateVariants(isEditingId, payload);
      showToast("All variants updated successfully");

      // Update local state instantly with server response
      const updatedVariants = res.data?.data || res.data || res;
      if (updatedVariants && Array.isArray(updatedVariants)) {
        // 1. Update formData for the modal
        setFormData((prev) => ({ ...prev, variants: updatedVariants }));

        // 2. Update products list for background table
        setProducts((prev) =>
          prev.map((p) =>
            String(p.id || (p as any)._id) === String(isEditingId)
              ? { ...p, variants: updatedVariants }
              : p,
          ),
        );
      }
    } catch (err) {
      console.error(err);
      showToast("Error update variants", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVariant = async (variantIndex: number, variantData: VariantFormData) => {
    const variantId = variantData.id || variantData._id;

    // Capture current state for potential rollback
    const previousFormData = { ...formData };
    const previousProducts = [...products];

    try {
      // 1. Optimistic local state update (Instant Feedback)
      setFormData((prev) => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== variantIndex),
      }));

      if (variantId) {
        setProducts((prev) =>
          prev.map((p) => {
            if (String(p.id || (p as any)._id) === String(isEditingId)) {
              return {
                ...p,
                variants: (p.variants || []).filter(
                  (v) => String(v.id || (v as any)._id) !== String(variantId),
                ),
              };
            }
            return p;
          }),
        );

        // 2. Delete from server
        setIsSubmitting(true);
        await deleteVariant(isEditingId, variantId);
        showToast("Variant deleted successfully");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting variant", "error");
      // Rollback on error
      setFormData(previousFormData);
      setProducts(previousProducts);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    const append = (k: string, v: any) => {
      if (v !== undefined && v !== null && v !== "") data.append(k, v);
    };

    append("name", formData.name);
    append("description", formData.description);
    append("brand", formData.brand);
    append("sku", formData.sku);
    append("availability", formData.availability);
    // Removed price, sale_price, stock_qty as they are now per-variant
    // Removed has_variants as per backend validation rules
    append("is_active", String(formData.isActive));
    append("main_image_index", String(formData.mainImageIndex));

    // Removed specifications as per user request

    if (!isEditingId && formData.has_variants && formData.variants?.length > 0) {
      formData.variants.forEach((v, idx) => {
        if (v.color) append(`variants[${idx}][color]`, v.color);
        if (v.size) append(`variants[${idx}][size]`, v.size);
        if (v.price) append(`variants[${idx}][price]`, String(v.price));
        // Removed sale_price from variants as per backend validation rules
        if (v.stock_qty) append(`variants[${idx}][stock_qty]`, String(v.stock_qty));
        if (v.sku) append(`variants[${idx}][sku]`, v.sku);
      });
    }

    // Removed dimensions and tags as per user request

    if (formData.category) data.append("category_id", formData.category);
    if (formData.image instanceof File) data.append("images", formData.image);
    if (formData.images?.length > 0)
      Array.from(formData.images).forEach((f) => {
        if (f instanceof File) data.append("images", f);
      });

    try {
      let res: ApiResponse<Product> | any;
      if (isEditingId) {
        res = await updateProduct(isEditingId, data);
        showToast("Product updated successfully");

        // Update local state with server response (single source of truth)
        const updated = res.data?.data || res.data || res;

        setProducts((prev) =>
          prev.map((p) => (String(p.id || (p as any)._id) === String(isEditingId) ? updated : p)),
        );
      } else {
        res = await createProduct(data);
        showToast("Product added successfully");

        // Prepend to local state
        const created = res.data?.data || res.data || res;
        if (created) {
          setProducts((prev) => [created, ...prev]);
        }
      }

      setShowModal(false);
      setFormData(initialForm);
      setIsEditingId(null);

      // Delay background sync to allow DB consistency
      setTimeout(() => fetchProducts(), 1000);
    } catch (err) {
      console.error(err);
      showToast("Error saving product", "error");
      fetchProducts(); // Revert on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      // Optimistic update: Remove immediately from UI
      setProducts((prev) => prev.filter((p) => (p.id || (p as any)._id) !== id));

      try {
        await deleteProduct(id);
        showToast("Product deleted successfully");
        fetchProducts(); // Sync with server
      } catch {
        showToast("Error deleting product", "error");
        fetchProducts(); // Revert on failure
      }
    }
  };

  return (
    <div className="p-4 sm:p-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 px-2 sm:px-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
            Inventory
          </h1>
          <p className="text-slate-400 mt-1 text-sm lg:text-base font-bold uppercase tracking-widest">
            Manage your product catalog and stock levels.
          </p>
        </div>
        <button
          onClick={() => {
            setIsEditingId(null);
            setFormData(initialForm);
            setShowModal(true);
          }}
          className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-[1.25rem] font-bold uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95"
        >
          <span className="text-xl">+</span> Add Product
        </button>
      </div>

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden flex flex-col min-h-[650px] transition-all scrollbar-hide">
        <div className="flex items-center justify-between px-6 sm:px-10 py-6 sm:py-8 border-b border-slate-100 bg-slate-50/30">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              Product Catalog
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
              Live inventory and variants
            </p>
          </div>
        </div>

        <div className="p-0 flex-1 flex flex-col min-h-0">
          <ProductTable
            products={products}
            loading={loading}
            getImageUrl={getImageUrl}
            getCategoryPath={getCategoryPath}
            setPreviewImage={setPreviewImage}
            setOpenMenuId={setOpenMenuId}
            openMenuId={openMenuId}
            setViewProduct={setViewProduct}
            handleEditClick={handleEditClick}
            handleDelete={handleDelete}
            meta={meta}
            page={page}
            setPage={handlePageChange}
            limit={limit}
            setLimit={handleLimitChange}
          />
        </div>
      </div>

      <ProductModal
        showModal={showModal}
        setShowModal={setShowModal}
        isEditingId={isEditingId}
        formData={formData}
        setFormData={setFormData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleUpdateVariant={handleUpdateOrCreateVariant}
        handleDeleteVariant={handleDeleteVariant}
        handleBulkUpdateVariants={handleBulkUpdateVariantsAction}
        isSubmitting={isSubmitting}
        flattenedCategories={flattenedForDropdown}
      />

      <ProductDetailsModal
        viewProduct={viewProduct}
        setViewProduct={setViewProduct}
        getCategoryPath={getCategoryPath}
        handleEditClick={handleEditClick}
      />

      <ImagePreviewModal previewImage={previewImage} setPreviewImage={setPreviewImage} />
    </div>
  );
};

export default AdminProducts;

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import {
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from "../../services/api";
import { getImageUrl } from "../../utils/imageUtils";

// Modular Components
import ProductTable from "../../components/admin/products/ProductTable";
import ProductModal from "../../components/admin/products/ProductModal";
import ProductDetailsModal from "../../components/admin/products/ProductDetailsModal";
import ImagePreviewModal from "../../components/admin/products/ImagePreviewModal";

const AdminProducts = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // State Management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditingId, setIsEditingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);

  // Pagination & Search State
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = useState(Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [meta, setMeta] = useState(null);

  const initialForm = {
    name: "",
    description: "",
    price: "",
    salePrice: "",
    sku: "",
    brand: "",
    stockQty: 0,
    availability: "INSTOCK",
    category: "",
    image: null,
    images: [],
    sizes: "",
    colors: "",
    tags: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    metaTitle: "",
    metaDescription: "",
  };
  const [formData, setFormData] = useState(initialForm);

  /*  DATA FETCHING  */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategories();
      const data =
        res?.data?.data || res?.data?.categories || (Array.isArray(res?.data) ? res.data : []);
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
      let productList = [];
      let metadata = null;

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
  const updateURL = useCallback(
    (params) => {
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
          newParams.set(key, value);
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
    if (p !== page) setPage(p);
    if (l !== limit) setLimit(l);
    if (s !== search) {
      setSearch(s);
      setDebouncedSearch(s);
    }
  }, [searchParams, page, limit, search]);

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
  const getCategoryPath = (categoryId) => {
    if (!categoryId) return "Uncategorized";
    const flatten = (cats) => {
      let res = [];
      cats.forEach((c) => {
        res.push(c);
        if (c.children) res.push(...flatten(c.children));
      });
      return res;
    };
    const all = flatten(categories);
    const find = (id) => all.find((c) => String(c.id || c._id) === String(id));
    const build = (id, path = []) => {
      const c = find(id);
      if (!c) return path;
      path.unshift(c.name);
      const pId = c.parentId || c.parent?.id || c.parent?._id;
      return pId ? build(pId, path) : path;
    };
    const path = build(categoryId);
    return path.length > 0 ? path.join(" > ") : "Uncategorized";
  };

  const flattenedForDropdown = (() => {
    const result = [];
    const traverse = (cats, level = 0) => {
      cats.forEach((c) => {
        const hasChildren = c.children?.length > 0;
        const indent = "  ".repeat(level);
        const prefix = level === 0 ? (hasChildren ? "▼ " : "• ") : hasChildren ? "└─▼ " : "└─• ";
        result.push({ ...c, displayName: indent + prefix + c.name });
        if (hasChildren) traverse(c.children, level + 1);
      });
    };
    const roots = categories.filter(
      (c) => !c.parentId && (!c.parent || (!c.parent.id && !c.parent._id)),
    );
    traverse(roots);
    return result;
  })();

  /*  HANDLERS  */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleEditClick = (product) => {
    setFormData({
      ...product,
      category: product.category_id || product.categoryId || "",
      salePrice: product.sale_price || product.salePrice || "",
      stockQty: product.stock_qty || product.stockQty || 0,
      metaTitle: product.meta_title || product.metaTitle || "",
      metaDescription: product.meta_description || product.metaDescription || "",
      image: null,
      images: [],
      sizes: Array.isArray(product.sizes) ? product.sizes.join(", ") : product.sizes || "",
      colors: Array.isArray(product.colors) ? product.colors.join(", ") : product.colors || "",
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : product.tags || "",
      length: product.dimensions?.length || "",
      width: product.dimensions?.width || "",
      height: product.dimensions?.height || "",
    });
    setIsEditingId(product.id || product._id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    const append = (k, v) => {
      if (v !== undefined && v !== null && v !== "") data.append(k, v);
    };

    append("name", formData.name);
    append("description", formData.description);
    append("price", formData.price);
    append("sale_price", formData.salePrice);
    append("sku", formData.sku);
    append("brand", formData.brand);
    append("stock_qty", formData.stockQty);
    append("availability", formData.availability);
    append("weight", formData.weight);
    append("meta_title", formData.metaTitle);
    append("meta_description", formData.metaDescription);
    if (formData.length || formData.width || formData.height)
      data.append(
        "dimensions",
        JSON.stringify({
          length: Number(formData.length) || 0,
          width: Number(formData.width) || 0,
          height: Number(formData.height) || 0,
        }),
      );
    ["sizes", "colors", "tags"].forEach((k) => {
      if (formData[k]) formData[k].split(",").forEach((v) => data.append(`${k}[]`, v.trim()));
    }); // Fixed brackets
    if (formData.category) data.append("category_id", formData.category);
    if (formData.image) data.append("images", formData.image);
    if (formData.images?.length > 0)
      Array.from(formData.images).forEach((f) => data.append("images", f));

    try {
      let res;
      if (isEditingId) {
        res = await updateProduct(isEditingId, data);
        showToast("Product updated successfully");

        // Update local state with server response (single source of truth)
        const updated = res.data?.data || res.data || res;
        setProducts((prev) =>
          prev.map((p) => (String(p.id || p._id) === String(isEditingId) ? updated : p)),
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      // Optimistic update: Remove immediately from UI
      setProducts((prev) => prev.filter((p) => (p.id || p._id) !== id));

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
    <div className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-blue-600">Inventory</h1>
          <p className="text-slate-600 mt-1 text-sm lg:text-base">
            Manage your product catalog and stock levels.
          </p>
        </div>
        <button
          onClick={() => {
            setIsEditingId(null);
            setFormData(initialForm);
            setShowModal(true);
          }}
          className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 overflow-visible">
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
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
        />
      </div>

      <ProductModal
        showModal={showModal}
        setShowModal={setShowModal}
        isEditingId={isEditingId}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        flattenedCategories={flattenedForDropdown}
        setFormData={setFormData}
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

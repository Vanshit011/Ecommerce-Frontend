import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "../../context/ToastContext";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getMyProducts,
} from "../../services/api";

// Modular Components
import CategoryForm from "../../components/admin/categories/CategoryForm";
import CategoryTable from "../../components/admin/categories/CategoryTable";

const AdminCategories = () => {
  const { showToast } = useToast();

  // State Management
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [parentId, setParentId] = useState("");
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [viewProductsFor, setViewProductsFor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const itemsPerPage = 10;

  const [showModal, setShowModal] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([getCategories(), getMyProducts()]);
      // ... existing fetch logic ...
      const rawCats =
        catRes?.data?.data ||
        catRes?.data?.categories ||
        (Array.isArray(catRes?.data) ? catRes.data : []);

      const sortedCategories = rawCats.sort((a, b) => {
        const dateA = new Date(a.created_at || a._id);
        const dateB = new Date(b.created_at || b._id);
        return dateB - dateA;
      });
      setCategories(sortedCategories);
      setProducts(prodRes.data?.data || prodRes.data || []);
    } catch {
      showToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  /*  HANDLERS  */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = { name: newCategory };
      if (parentId) payload.parentId = parentId;

      if (editId) {
        await updateCategory(editId, payload);
        showToast("Category updated successfully");
      } else {
        await createCategory(payload);
        showToast("Category added successfully");
      }

      setNewCategory("");
      setParentId("");
      setEditId(null);
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      console.error("Save Category Error:", err);
      showToast("Failed to save category", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (cat) => {
    setEditId(cat.id || cat._id);
    setNewCategory(cat.name);
    setParentId(
      cat.parentId || (typeof cat.parent === "object" ? cat.parent.id || cat.parent._id : "") || "",
    );
    setShowModal(true);
  };

  const handleAddClick = () => {
    setEditId(null);
    setNewCategory("");
    setParentId("");
    setShowModal(true);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setNewCategory("");
    setParentId("");
    setShowModal(false);
  };
  // ... rest of handlers ...
  const handleDelete = async (id) => {
    const hasChildren = categories.some(
      (cat) => (cat.parentId || cat.parent?._id || cat.parent?.id) === id,
    );

    if (hasChildren) {
      if (
        !window.confirm(
          "This category has child categories. Deleting it may affect child categories. Continue?",
        )
      )
        return;
    } else {
      if (!window.confirm("Delete this category?")) return;
    }

    try {
      await deleteCategory(id);
      showToast("Category deleted successfully");
      fetchCategories();
    } catch (err) {
      console.error("Delete Category Error:", err);
      showToast("Failed to delete category", "error");
    }
  };

  const toggleExpand = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) newExpanded.delete(categoryId);
    else newExpanded.add(categoryId);
    setExpandedCategories(newExpanded);
  };

  const toggleViewProducts = (categoryId) => {
    setViewProductsFor(viewProductsFor === categoryId ? null : categoryId);
  };

  /*  HELPERS  */
  const buildTree = () => {
    return categories.filter((cat) => {
      const hasNoParent =
        !cat.parentId &&
        (!cat.parent || (typeof cat.parent === "object" && !cat.parent.id && !cat.parent._id));
      return hasNoParent;
    });
  };

  const treeData = buildTree();
  const totalPages = Math.ceil(treeData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTreeData = treeData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setExpandedCategories(new Set());
  };

  const getProductsForCategory = (categoryId, includeChildren = true) => {
    const directProducts = products.filter(
      (p) => (p.categoryId || p.category?.id || p.category?._id || p.category) === categoryId,
    );

    if (!includeChildren) return directProducts;

    const categoryMap = new Map();
    const flattenCategories = (cats) => {
      cats.forEach((cat) => {
        const catId = cat.id || cat._id;
        categoryMap.set(catId, cat);
        if (cat.children?.length > 0) flattenCategories(cat.children);
      });
    };
    flattenCategories(categories);

    const getAllCategoryIds = (catId) => {
      const ids = [catId];
      const category = categoryMap.get(catId);
      if (category?.children?.length > 0) {
        category.children.forEach((child) => ids.push(...getAllCategoryIds(child.id || child._id)));
      }
      return ids;
    };

    const allCategoryIds = getAllCategoryIds(categoryId);
    return products.filter((p) =>
      allCategoryIds.includes(p.categoryId || p.category?.id || p.category?._id || p.category),
    );
  };

  const renderCategoryRow = (cat, level = 0) => {
    const categoryId = cat.id || cat._id;
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expandedCategories.has(categoryId);
    const categoryProducts = getProductsForCategory(categoryId);
    const showProducts = viewProductsFor === categoryId;

    return (
      <React.Fragment key={categoryId}>
        <tr
          className="border-b border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          onClick={() => toggleViewProducts(categoryId)}
        >
          <td className="py-4 px-6">
            <div className="flex items-center gap-3" style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(categoryId);
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
                >
                  {isExpanded ? "▼" : "▶"}
                </button>
              )}
              {!hasChildren && <span className="w-6"></span>}
              <div className="flex flex-col">
                <span className="font-bold text-slate-800">{cat.name}</span>
                {hasChildren && (
                  <span className="text-[10px] uppercase font-bold tracking-widest text-blue-500 mt-0.5">
                    {cat.children.length} Subcategories
                  </span>
                )}
              </div>
            </div>
          </td>
          <td className="py-4 px-6">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">
                {categoryProducts.length} Items
              </span>
            </div>
          </td>
          <td className="py-4 px-6 text-center">
            <div className="relative inline-block text-left">
              <button
                className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 mx-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === categoryId ? null : categoryId);
                }}
              >
                Actions
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {openMenuId === categoryId && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-10 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    onClick={() => {
                      toggleViewProducts(categoryId);
                      setOpenMenuId(null);
                    }}
                  >
                    View Products
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    onClick={() => {
                      handleEditClick(cat);
                      setOpenMenuId(null);
                    }}
                  >
                    Edit Category
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 flex items-center gap-2"
                    onClick={() => {
                      handleDelete(categoryId);
                      setOpenMenuId(null);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </td>
        </tr>
        {showProducts && categoryProducts.length > 0 && (
          <tr className="bg-slate-50/50">
            <td colSpan="3" className="py-4 px-6">
              <div
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"
                style={{ marginLeft: `${(level + 1) * 24}px` }}
              >
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Linked Products in {cat.name}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {categoryProducts.map((product) => (
                    <span
                      key={product.id || product._id}
                      className="px-3 py-1 bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-100"
                    >
                      {product.name || product.title}
                    </span>
                  ))}
                </div>
              </div>
            </td>
          </tr>
        )}
        {isExpanded &&
          hasChildren &&
          cat.children.map((child) => renderCategoryRow(child, level + 1))}
      </React.Fragment>
    );
  };

  const getAllCategoriesFlat = (cats = categories, level = 0, result = []) => {
    cats.forEach((cat) => {
      const catId = cat.id || cat._id;
      if (catId !== editId) {
        const hasChildren = cat.children?.length > 0;
        const indent = "  ".repeat(level);
        const prefix = level === 0 ? (hasChildren ? "▼ " : "• ") : hasChildren ? "└─▼ " : "└─• ";
        result.push({ ...cat, displayName: indent + prefix + cat.name });
        if (hasChildren) getAllCategoriesFlat(cat.children, level + 1, result);
      }
    });
    return result;
  };

  const flattenedCategories = getAllCategoriesFlat(treeData);

  return (
    <div className="p-4 sm:p-8 pb-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 px-2 sm:px-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
            Product Categories
          </h1>
          <p className="text-slate-400 mt-1 text-sm lg:text-base font-bold uppercase tracking-widest">
            Manage your store hierarchy and product organization.
          </p>
        </div>

        <button
          onClick={handleAddClick}
          className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-[1.25rem] font-bold uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95"
        >
          <svg className="w-5 h-5 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span className="relative">Create New Category</span>
        </button>
      </div>

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden flex flex-col min-h-[650px] transition-all scrollbar-hide">
        <div className="flex items-center justify-between px-6 sm:px-10 py-6 sm:py-8 border-b border-slate-100 bg-slate-50/30">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              Store Hierarchy
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
              Nested classification system
            </p>
          </div>
        </div>

        <div className="p-0 flex-1 overflow-x-auto scrollbar-hide pb-44">
          <CategoryTable
            loading={loading}
            treeData={treeData}
            paginatedTreeData={paginatedTreeData}
            renderCategoryRow={renderCategoryRow}
            totalPages={totalPages}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        </div>
      </div>

      {/* CATEGORY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={handleCancelEdit}
          />
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
            <CategoryForm
              editId={editId}
              newCategory={newCategory}
              setNewCategory={setNewCategory}
              parentId={parentId}
              setParentId={setParentId}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              handleCancelEdit={handleCancelEdit}
              flattenedCategories={flattenedCategories}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;

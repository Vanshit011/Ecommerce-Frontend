import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, getCategories, addToCart } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import Header from "../../components/common/Header";

const Home = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [featured, setFeatured] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);

        const products = prodRes?.data?.data || prodRes?.data;
        const cats = catRes?.data?.data || catRes?.data;

        setCategories(cats);
        setFeatured(products.slice(0, 8));
        setBestSellers(products.slice(8, 16));
      } catch (err) {
        console.error("Home data load failed:", err);
      }
    };

    loadData();
  }, []);

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    try {
      await addToCart(productId);
      showToast("Product added to bag!", "success");
    } catch (err) {
      console.error("Add to cart error:", err);
      showToast(
        err.response?.data?.message || "Failed to add to bag",
        "error"
      );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      {/* HERO */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">
            Flash Sale is Live 🔥
          </h1>
          <p className="text-lg mb-6">
            Up to 70% OFF on Electronics & Fashion
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-yellow-400 text-black px-6 py-3 rounded font-semibold hover:bg-yellow-300 transition"
          >
            Shop Now
          </button>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl font-semibold mb-5">
            Shop by Category
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
            {categories.map((cat) => (
              <div
                key={cat.id || cat._id}
                onClick={() =>
                  navigate(`/products?category=${cat.id || cat._id}`)
                }
                className="min-w-[120px] cursor-pointer bg-white shadow rounded-lg p-4 flex flex-col items-center hover:shadow-lg hover:-translate-y-1 transition"
              >
                <div className="w-14 h-14 bg-blue-100 flex items-center justify-center rounded-full mb-2 text-xl">
                  🛍️
                </div>
                <span className="text-sm font-medium text-gray-700 text-center">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">

          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold">
              Featured Products
            </h2>
            <span
              onClick={() => navigate("/products")}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              View All
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {featured.map((p) => (
              <div
                key={p.id || p._id}
                onClick={() =>
                  navigate(`/product/${p.id || p._id}`)
                }
                className="bg-white rounded-lg shadow hover:shadow-xl transition cursor-pointer group"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-48 w-full object-contain p-4 group-hover:scale-105 transition"
                />

                <div className="px-4 pb-4">
                  <h4 className="font-medium text-gray-800 truncate">
                    {p.name}
                  </h4>

                  <p className="text-lg font-semibold text-green-600 mt-1">
                    ₹{p.price}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={(e) =>
                        handleAddToCart(e, p.id || p._id)
                      }
                      className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700"
                    >
                      Add to Cart
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/product/${p.id || p._id}`)
                      }
                      className="flex-1 border border-gray-300 py-2 rounded text-sm hover:bg-gray-100"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">

          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold">
              Best Sellers
            </h2>
            <span
              onClick={() => navigate("/products")}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              View All
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {bestSellers.map((p) => (
              <div
                key={p.id || p._id}
                onClick={() =>
                  navigate(`/product/${p.id || p._id}`)
                }
                className="bg-white rounded-lg shadow hover:shadow-xl transition cursor-pointer group"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-48 w-full object-contain p-4 group-hover:scale-105 transition"
                />

                <div className="px-4 pb-4">
                  <h4 className="font-medium text-gray-800 truncate">
                    {p.name}
                  </h4>

                  <p className="text-lg font-semibold text-green-600 mt-1">
                    ₹{p.price}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={(e) =>
                        handleAddToCart(e, p.id || p._id)
                      }
                      className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700"
                    >
                      Add to Cart
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/product/${p.id || p._id}`)
                      }
                      className="flex-1 border border-gray-300 py-2 rounded text-sm hover:bg-gray-100"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
};

export default Home;

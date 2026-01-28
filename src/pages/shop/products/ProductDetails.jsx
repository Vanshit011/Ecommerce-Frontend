import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProductDetails,
  addToCart,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
} from "../../../services/api";
import { useToast } from "../../../context/ToastContext";
import Header from "../../../components/common/Header";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductDetails(id);
        setProduct(res.data);
        setSelectedImage(res.data.image);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };

    const checkFavoriteStatus = async () => {
      try {
        const res = await getFavorites();
        const favs = res.data || [];
        const found = favs.some((f) => (f.product?.id || f.id) === id);
        setIsFavorite(found);
      } catch (err) {
        console.error("Error checking favorite status:", err);
      }
    };

    fetchProduct();
    checkFavoriteStatus();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFromFavorites(id);
        showToast("Removed from favorites", "success");
      } else {
        await addToFavorites(id);
        showToast("Added to favorites", "success");
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error("Error toggling favorite:", err);
      showToast("Failed to update favorites", "error");
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(id);
      showToast("Product added to cart!", "success");
    } catch (err) {
      console.error("Error adding to cart:", err);
      showToast(
        err.response?.data?.message || "Failed to add to cart",
        "error"
      );
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <span className="text-gray-500">Loading product...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center flex-col">
          <h2 className="text-xl font-semibold mb-3">{error}</h2>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:underline"
          >
            Go Home
          </button>
        </div>
      </div>
    );

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8 relative">

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-10 right-10 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* IMAGE */}
          <div className="flex justify-center items-center bg-gray-50 rounded-lg p-6">
            <img
              src={selectedImage}
              alt={product?.name}
              className="max-h-[420px] object-contain hover:scale-105 transition"
            />
          </div>

          {/* INFO */}
          <div>

            {/* BREADCRUMB */}
            <nav className="text-sm text-gray-500 mb-2">
              <span
                onClick={() => navigate("/")}
                className="cursor-pointer hover:text-blue-600"
              >
                Home
              </span>{" "}
              /{" "}
              <span
                onClick={() => navigate("/products")}
                className="cursor-pointer hover:text-blue-600"
              >
                Products
              </span>{" "}
              /{" "}
              <span className="text-gray-700 font-medium">
                {product?.name}
              </span>
            </nav>

            {/* TITLE */}
            <div className="flex justify-between items-start gap-3">
              <h1 className="text-2xl font-semibold">{product?.name}</h1>

              <button
                onClick={toggleFavorite}
                className={`text-2xl ${isFavorite ? "text-red-500" : "text-gray-400"
                  }`}
              >
                ♥
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-1">
              {product?.category?.name || "General"}
            </p>

            {/* PRICE */}
            <div className="mt-4">
              <span className="text-3xl font-bold text-green-600">
                ₹{product?.price}
              </span>
            </div>

            {/* DESC */}
            <div className="mt-6">
              <h3 className="font-medium mb-1">Description</h3>
              <p className="text-gray-600 text-sm">
                {product?.description}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="mt-8 flex gap-4">

              <button
                onClick={handleAddToCart}
                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
              >
                Add to Cart
              </button>

              <button
                onClick={async () => {
                  await handleAddToCart();
                  navigate("/cart");
                }}
                className="bg-yellow-400 px-6 py-3 rounded font-semibold hover:bg-yellow-300"
              >
                Buy Now
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('mj_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('mj_cart', JSON.stringify(cart));
  }, [cart]);

  // 1. Ajouter un produit avec prise en compte de la taille
  const addToCart = (product, selectedSize = null) => {
    if (!product.inStock) return;

    setCart((prevCart) => {
      // On cherche si le produit AVEC LA MÊME TAILLE existe déjà
      const existingProduct = prevCart.find(
        (item) => item.id === product.id && item.size === selectedSize
      );

      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id && item.size === selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // On ajoute la propriété "size" à l'article du panier
      return [...prevCart, { ...product, quantity: 1, size: selectedSize }];
    });
  };

  // 2. Retirer ou baisser la quantité d'un produit (différencié par taille)
  const removeFromCart = (productId, selectedSize = null) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId && item.size === selectedSize
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('mj_cart');
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

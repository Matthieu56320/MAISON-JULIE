import React, { createContext, useState, useContext } from 'react';

// Création du contexte
const CartContext = createContext();

// Fournisseur du contexte qui va envelopper toute l'application
export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // 1. Ajouter un produit au panier
  const addToCart = (product) => {
    if (!product.inStock) return; // Sécurité : on n'ajoute pas un produit épuisé

    setCart((prevCart) => {
      // On cherche si le produit est déjà présent dans le panier
      const existingProduct = prevCart.find((item) => item.id === product.id);

      if (existingProduct) {
        // S'il existe, on augmente sa quantité de 1
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Sinon, on l'ajoute au tableau avec une quantité initiale de 1
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // 2. Retirer ou baisser la quantité d'un produit
  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0) // Si la quantité tombe à 0, on supprime l'article
    );
  };

  // 3. Vider complètement le panier (utile après une commande)
  const clearCart = () => setCart([]);

  // 4. Calculer le nombre total d'articles dans le panier (pour la Navbar)
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // 5. Calculer le montant total en euros
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook personnalisé pour utiliser le panier super facilement ailleurs dans le code
export function useCart() {
  return useContext(CartContext);
}
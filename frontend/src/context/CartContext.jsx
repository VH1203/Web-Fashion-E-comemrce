import { createContext, useContext } from "react";
import { cartService } from "../services/cartService";
import { useAuth } from "./AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: cartData,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartService.get(),
    enabled: !!user,
    select: (data) => data.data,
  });

  const { mutateAsync: addItemToCart } = useMutation({
    mutationFn: (item) => cartService.addItem(item),
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], (oldData) => {
        if (!oldData) return { data };
        return { ...oldData, data };
      });
    },
  });

  const value = {
    cart: cartData,
    loading,
    error,
    fetchCart: () => queryClient.invalidateQueries(["cart"]),
    addItemToCart,
    itemCount: cartData?.items?.length || 0,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

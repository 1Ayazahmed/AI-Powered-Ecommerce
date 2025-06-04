export const addDecimals = (num) => {
  return Math.round(num * 100) / 100;
};

export const updateCart = (state) => {
  // Calculate the items price
  state.itemsPrice = addDecimals(
    state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  );

  // Calculate the shipping price
  state.shippingPrice = addDecimals(state.itemsPrice > 100 ? 0 : 10);

  // Calculate the tax price
  state.taxPrice = addDecimals(0.15 * state.itemsPrice);

  // Calculate the total price
  state.totalPrice = addDecimals(
    state.itemsPrice +
    state.shippingPrice +
    state.taxPrice
  );

  // Save the cart to localStorage
  localStorage.setItem("cart", JSON.stringify(state));

  return state;
};

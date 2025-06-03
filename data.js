// data.js
// export let items = [
//   { name: "A3", price: 20, type: "print", color: "#FFCC6F" },
//   // ...
// ];

export const defaultItems = [
  { name: "A3", price: 20, type: "print", color: "#FFCC6F" },
  { name: "A4", price: 12, type: "print", color: "#CF6FFF" },
  { name: "A5", price: 8, type: "print", color: "#6FFAFF" },
  { name: "Mini", price: 4, type: "print", color: "#FF6FB2" },
  { name: "Sticker", price: 2, type: "print", color: "#FF9999" },
  {
    name: "Keychain",
    price: 8,
    type: "keychain",
    color: "#FFA07A",
    hasSpecial: true,
  },
  // { name: "Special Keychain", price: 2, type: "special_keychain", color: "#FFA07A" },
  { name: "Stand", price: 20, type: "stand", color: "#90EE90" },
];

export let deals = {
  print: "3-for-2",
  keychain: { pair: 15, single: 8, special: 2 },
  stand: { pair: 36, single: 20 },
};

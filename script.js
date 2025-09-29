import { defaultItems, defaultDeals } from "./data.js";

const items = defaultItems;
const deals = defaultDeals;
const state = {};

// const row1 = document.getElementById("cart");
const breakdownEl = document.getElementById("calculation-breakdown");
const totalEl = document.getElementById("total");
// const cartEl = document.getElementById("shopping-cart-items"); // optional div inside your cart

// // Initialize state
// items.forEach(item => {
//   state[item.name] = 0;
//   if (item.hasSpecial) state[`${item.name}_special`] = 0;
// });

window.addEventListener("DOMContentLoaded", () => {
  updateTotal();
});

// ------------------ Quantity logic ------------------
window.changeQty = function(name, delta) {
  if (!state[name]) state[name] = 0;
  state[name] = Math.max(0, state[name] + delta);

  const base = name.split("_")[0];

  // Limit special count to base count
  if (name.includes("_special")) {
    state[name] = Math.min(state[name], state[base]);
  } else {
    if (items.find(i => i.name === base)?.hasSpecial) {
      const specialName = `${base}_special`;
      if (state[specialName] > state[base]) state[specialName] = state[base];
    }
  }

  // Update DOM
  document.getElementById(`count-${name}`).textContent = state[name];
  if (document.getElementById(`count-${base}_special`))
    document.getElementById(`count-${base}_special`).textContent = state[`${base}_special`];

  updateTotal();
};

// ------------------ Total and breakdown ------------------
function updateTotal() {
  let total = 0;
  const printItems = [];

  items.forEach(({ name, type, price, hasSpecial }) => {
    const count = state[name];
    if (!count) return;

    if (type === "print") {
      for (let i=0;i<count;i++) printItems.push(price);
    } else if (type === "keychain" || type === "stand") {
      const deal = deals[type];
      if (deal?.type === "Bundle2") {
        const pairs = Math.floor(count/2);
        const singles = count % 2;
        total += pairs*deal.pair + singles*deal.single;

        if (hasSpecial && deal.special) {
          const specialCount = Math.min(state[`${name}_special`]||0, count);
          total += specialCount*deal.special;
        }
      }
    }
  });

  printItems.sort((a,b)=>b-a);
  total += calculatePrintDeals(printItems);

  totalEl.textContent = `Total: $${total}`;

  renderCartItems(); // optional: show item counts in cart
}

// ------------------ Prints Buy2Free1 ------------------
function calculatePrintDeals(printItems) {
  let sum = 0;
  let line = "[Prints Buy-2-Free-1]: ";
  printItems.forEach((price,i) => {
    const isFree = (i+1)%3===0;
    line += isFree ? `<s>$${price}</s>, ` : `$${price}, `;
    if(!isFree) sum += price;
  });
  breakdownEl.innerHTML = line.replace(/, $/,' = $'+sum);
  return sum;
}

// ------------------ Render cart items (optional) ------------------
function renderCartItems() {
  if(!cartEl) return;
  cartEl.innerHTML = "";
  items.forEach(({name}) => {
    const count = state[name];
    if(count>0){
      const div = document.createElement("div");
      div.textContent = `${name}: ${count}`;
      cartEl.appendChild(div);
    }
  });
}

// ------------------ Reset ------------------
document.getElementById("reset").addEventListener("click", () => {
  items.forEach(i => {
    state[i.name]=0;
    if(i.hasSpecial) state[`${i.name}_special`] = 0;
    if(document.getElementById(`count-${i.name}`)) document.getElementById(`count-${i.name}`).textContent = "0";
    if(i.hasSpecial && document.getElementById(`count-${i.name}_special`)) document.getElementById(`count-${i.name}_special`).textContent="0";
  });
  updateTotal();
});

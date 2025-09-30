const sizeConfig = {
  A7: { price: "$4", color: "#ff6fb2" },
  A5: { price: "$8", color: "#52c8cc" },
  A4: { price: "$12", color: "#cf6fff" },
  A3: { price: "$20", color: "#ffcc6f" },
  C: { price: "$6", color: "#91C768" },
  KeyC: { price: "$8", color: "#d59351ff" },
  Scratch: { price: "$0", color: "#000" },
  Stand: { price: "$15", color: "#4d5cffff" },
  Sticker: { price: "$2", color: "#8b8b8bff" },
  StickerSheet: { price: "$8", color: "#905050ff" },
};

function categorizeImages(data) {
  const categories = {
    front: [],
    back: [],
    insideLeft: [],
    insideRight: [],
    zzzkeychains: [],
    bakeychains: [],
    hsrkeychains: [],
    stands: [],
    stickers: [],
  };
  let baCounter = 1,
    zzzCounter = 1,
    genCounter = 1,
    hsrCounter = 1,
    miscCounter = 1,
    zzzkeychainsCounter = 1,
    bakeychainsCounter = 1,
    hsrkeychainsCounter = 1,
    standsCounter = 1,
    stickerCounter = 1;

  data.forEach((item) => {
    const imagePath = item.image.toLowerCase();
    const imageName = item.image.split("/").pop().split(".")[0];

    if (imagePath.includes("/keychains_webp/zzz")) {
      categories.zzzkeychains.push({
        ...item,
        name: imageName,
        id: `KZ${zzzkeychainsCounter++}`,
      });
    } else if (imagePath.includes("/keychains_webp/ba")) {
      categories.bakeychains.push({
        ...item,
        name: imageName,
        id: `KB${bakeychainsCounter++}`,
      });
    } else if (imagePath.includes("/keychains_webp/hsr")) {
      categories.hsrkeychains.push({
        ...item,
        name: imageName,
        id: `KH${hsrkeychainsCounter++}`,
      });
    } else if (imagePath.includes("/standees/")) {
      categories.stands.push({
        ...item,
        name: imageName,
        id: `S${standsCounter++}`,
      });
    } else if (imagePath.includes("/stickers/")) {
      categories.stickers.push({
        ...item,
        name: imageName,
        id: `S${stickerCounter++}`,
      });
    } else if (imagePath.includes("/ba/")) {
      categories.back.push({ ...item, name: imageName, id: `B${baCounter++}` });
    } else if (imagePath.includes("/zzz/")) {
      categories.front.push({
        ...item,
        name: imageName,
        id: `Z${zzzCounter++}`,
      });
    } else if (imagePath.includes("/genshin/")) {
      categories.insideLeft.push({
        ...item,
        name: imageName,
        id: `G${genCounter++}`,
      });
    } else if (imagePath.includes("/hsr/")) {
      categories.insideLeft.push({
        ...item,
        name: imageName,
        id: `H${hsrCounter++}`,
      });
    } else if (imagePath.includes("/misc/")) {
      categories.insideRight.push({
        ...item,
        name: imageName,
        id: `M${miscCounter++}`,
      });
    }
  });
  return categories;
}

function renderTab(categories, tab) {
  const container = document.getElementById("tab-content");
  container.innerHTML = "";

  categories[tab].forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";

    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div><strong>${item.id}</strong> - ${item.name}</div>
      <div class="size-tags">
        ${item.sizes
          .map(
            (size) => `
          <button 
            class="size-tag" 
            data-id="${item.id}" 
            data-name="${item.name}" 
            data-size="${size}" 
            data-price="${sizeConfig[size].price}" 
             data-image="${item.image}" 
            style="background:${sizeConfig[size].color}">
            + ${size} (${sizeConfig[size].price})
          </button>`
          )
          .join("")}
      </div>
    `;

    container.appendChild(card);
  });

  // Attach listeners after rendering
  container.querySelectorAll(".size-tag").forEach((btn) => {
    btn.addEventListener("click", () => {
      const image = btn.dataset.image;
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const size = btn.dataset.size;
      const price = parseInt(btn.dataset.price.replace(/\$/g, ""), 10);

      // Determine type based on size
      const type = sizeTypeMap[size] || "other"; // fallback if unknown

      addToCart({ id, name, size, price, type, image });
    });
  });
}

const sizeTypeMap = {
  A3: "print",
  A4: "print",
  A5: "print",
  A7: "print",
  C: "print",
  Sticker: "print",
  StickerSheet: "print",
  // add other types if needed
};

// Load dataset.json dynamically
fetch("dataset.json")
  .then((res) => res.json())
  .then((dataset) => {
    const categories = categorizeImages(dataset);

    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".tab-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderTab(categories, btn.dataset.tab);
      });
    });

    // Default to first tab
    document.querySelector(".tab-btn").click();
  })
  .catch((err) => console.error("Failed to load dataset.json:", err));

let cart = [];

function addToCart(item) {
  cart.push(item);
  renderCart();
}

function renderCart() {
  const cartDiv = document.getElementById("cart");
  const totalDiv = document.getElementById("cart-total");

  if (cart.length === 0) {
    cartDiv.innerHTML = "";
    totalDiv.textContent = "Total: $0";
    return;
  }
  cartDiv.innerHTML = cart
    .map(
      (c, idx) => `
    <div class="cart-item" style="display:flex; align-items:center; gap:8px; margin-bottom:8px; font-size:18px;">
      <img src="${c.image}" alt="${c.name}" style="width:70px; height:70px; object-fit:cover; border-radius:4px;">
      <div>
        ${c.id} - ${c.name} [${c.size}] $${c.price}
      </div>
      <button onclick="removeFromCart(${idx})" style="width:30px; height:30px; margin-left:auto; font-size:25px;">-</button>
    </div>
  `
    )
    .join("");

  updateCartTotal();
}

window.removeFromCart = function (index) {
  cart.splice(index, 1);
  renderCart();
};

function updateCartTotal() {
  let total = 0;

  // Group prints for Buy2Free1
  const prints = cart.filter((c) => c.type === "print");

  // Sort highest → lowest
  prints.sort((a, b) => b.price - a.price);

  prints.forEach((p, i) => {
    // Every 3rd print (cheapest, because sorted) is free
    if ((i + 1) % 3 !== 0) {
      total += p.price;
    }
  });

  // Handle keychains and stands as Bundle2
  const keychains = cart.filter((c) => c.size == "KeyC");
  keychains.forEach((p, i) => {
    // every 2nd keychain is $7
    if ((i + 1) % 2 !== 0) {
      total += 8;
    } else {
      total += 7;
    }
  });

  const stands = cart.filter((c) => c.size == "Stand");
  stands.forEach((p, i) => {
    // every 2nd stand is $10
    if ((i + 1) % 2 !== 0) {
      total += 15;
    } else {
      total += 10;
    }
  });

  document.getElementById("cart-total").textContent = `Total: $${total}`;
  syncTotal = total;
  updateCashTotal(total);
}
let syncTotal = 0;

// Prevent pinch-to-zoom
document.addEventListener(
  "touchmove",
  function (event) {
    if (event.scale !== 1) event.preventDefault();
  },
  { passive: false }
);

// Prevent double-tap zoom
let lastTouch = 0;
document.addEventListener(
  "touchend",
  function (event) {
    const now = Date.now();
    if (now - lastTouch <= 300) {
      event.preventDefault();
    }
    lastTouch = now;
  },
  { passive: false }
);

function resetCart() {
  cart = []; // just clear it directly
  renderCart(); // this will also call updateCartTotal()
  updateCashTotal(0); // reset cash calculator too
}

// ------------------ Reset ------------------
document.getElementById("reset").addEventListener("click", () => {
  resetCart();
});

// ------------------ Save ------------------
// Load cached orders on page load
let savedOrders = JSON.parse(localStorage.getItem("savedOrders") || "[]");

// Function to save to cache whenever orders change
function cacheOrders() {
  localStorage.setItem("savedOrders", JSON.stringify(savedOrders));
}

function saveOrder(order) {
  savedOrders.push(order);
  cacheOrders(); // update localStorage
  renderOrderList(); // update the UI
}

document.getElementById("save").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Cart is empty, nothing to save!");
    return;
  }

  const timestamp = new Date().toLocaleString(); // device-local time

  const total = syncTotal;
  saveOrder({
    timestamp,
    items: [...cart],
    total
  });

  // renderOrderList(); // update the UI
  resetCart();
});

function renderOrderList() {
  const orderListDiv = document.getElementById("order-list");

  if (savedOrders.length === 0) {
    orderListDiv.innerHTML = "<em>No previous orders</em>";
    return;
  }

  orderListDiv.innerHTML = savedOrders
    .slice() // copy so we don't mutate
    .reverse() // newest first
    .map(
      (order, idx) => `
        <div style="border:1px solid #ccc; margin-bottom:8px; padding:6px; border-radius:4px;">
          <div><strong>Order ${savedOrders.length - idx}</strong> (${
        order.timestamp
      })</div> $${order.total}
          <ul style="margin:4px 0 0 12px; padding:0;">
            ${order.items
              .map(
                (item) =>
                  `<li>${item.id} - ${item.name} [${item.size}] $${item.price}</li>`
              )
              .join("")}
          </ul>
        </div>
      `
    )
    .join("");
}

// ------------------ Download ------------------
// Download all saved orders
document.getElementById("download").addEventListener("click", () => {
  if (savedOrders.length === 0) {
    alert("No saved orders to download!");
    return;
  }

  // Flatten orders into rows
  const header = [
    "Date",
    "Timestamp",
    "ID",
    "Name",
    "Size",
    "Price",
    "Order Total",
  ];
  const rows = [];

  savedOrders.forEach((order, idx) => {
    order.items.forEach((item) => {
      rows.push([
        order.timestamp,
        item.id,
        item.name,
        item.size,
        item.price,
        order.total,
      ]);
    });
  });

  // Build CSV string
  let csvContent = header.join(",") + "\n";
  csvContent += rows.map((r) => r.join(",")).join("\n");

  // Download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "orders.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  clearOrders();
});

document.getElementById("clear-orders").addEventListener("click", () => {
  clearOrders();
});
function clearOrders() {
  savedOrders = [];
  cacheOrders();
  renderOrderList();
}

// On page load, render cached orders
document.addEventListener("DOMContentLoaded", () => {
  renderOrderList();
});

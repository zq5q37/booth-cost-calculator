const sizeConfig = {
  A7: { price: "$4", color: "#ff6fb2" },
  A5: { price: "$8", color: "#52c8cc" },
  A4: { price: "$12", color: "#cf6fff" },
  A3: { price: "$20", color: "#ffcc6f" },
  C: { price: "$6", color: "#91C768" },
  KeyC: { price: "$8", color: "#d59351ff" },
  Scratch: {price: "$0", color: "#000"},
  Stand: {price: "$15", color: "#4d5cffff"},
  Sticker: {price: "$2", color: "#8b8b8bff"},
  StickerSheet: {price: "$8", color: "#905050ff"},
};

function categorizeImages(data) {
  const categories = { front: [], back: [], insideLeft: [], insideRight: [], zzzkeychains: [],  bakeychains: [],  hsrkeychains: [], stands:[], stickers:[]};
  let baCounter = 1,
    zzzCounter = 1,
    genCounter = 1,
    hsrCounter = 1,
    miscCounter = 1,
    zzzkeychainsCounter = 1,
    bakeychainsCounter = 1,
    hsrkeychainsCounter = 1,
    standsCounter=1,
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
    }
    else if (imagePath.includes("/keychains_webp/ba")) {
      categories.bakeychains.push({
        ...item,
        name: imageName,
        id: `KB${bakeychainsCounter++}`,
      });
    }
    else if (imagePath.includes("/keychains_webp/hsr")) {
      categories.hsrkeychains.push({
        ...item,
        name: imageName,
        id: `KH${hsrkeychainsCounter++}`,
      });
    }
    else if (imagePath.includes("/standees/")) {
      categories.stands.push({
        ...item,
        name: imageName,
        id: `S${standsCounter++}`,
      });
    }
        else if (imagePath.includes("/stickers/")) {
      categories.stickers.push({
        ...item,
        name: imageName,
        id: `S${stickerCounter++}`,
      });
    }

    else if (imagePath.includes("/ba/")) {
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
  StickerSheet: "print"
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
    cartDiv.innerHTML = "<em>Cart is empty</em>";
    totalDiv.textContent = "Total: $0";
    return;
  }
cartDiv.innerHTML = cart
  .map((c, idx) => `
    <div class="cart-item" style="display:flex; align-items:center; gap:8px; margin-bottom:8px; font-size:18px;">
      <img src="${c.image}" alt="${c.name}" style="width:70px; height:70px; object-fit:cover; border-radius:4px;">
      <div>
        ${c.id} - ${c.name} [${c.size}] $${c.price}
      </div>
      <button onclick="removeFromCart(${idx})" style="width:30px; height:30px;margin-left:auto;">x</button>
    </div>
  `)
  .join("");


  updateCartTotal();
}

window.removeFromCart = function(index) {
  cart.splice(index, 1);
  renderCart();
}

function updateCartTotal() {
  let total = 0;

  // Group prints for Buy2Free1
  const prints = cart.filter((c) => c.type === "print");
  prints.forEach((p, i) => {
    // every 3rd print is free
    if ((i + 1) % 3 !== 0) total += p.price;
  });

  // Handle keychains and stands as Bundle2
    const keychains = cart.filter((c) => c.size == "KeyC");
      keychains.forEach((p, i) => {
    // every 2nd keychain is $7
    if ((i + 1) % 2 !== 0){total += 8}  else {total+=7};
  });

      const stands = cart.filter((c) => c.size == "Stand");
      stands.forEach((p, i) => {
    // every 2nd stand is $10
    if ((i + 1) % 2 !== 0){total += 15}  else {total+=10};
  });


  document.getElementById("cart-total").textContent = `Total: $${total}`;
}

// Prevent pinch-to-zoom
document.addEventListener('touchmove', function (event) {
  if (event.scale !== 1) event.preventDefault();
}, { passive: false });

// Prevent double-tap zoom
let lastTouch = 0;
document.addEventListener('touchend', function (event) {
  const now = Date.now();
  if (now - lastTouch <= 300) {
    event.preventDefault();
  }
  lastTouch = now;
}, { passive: false });


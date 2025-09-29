const sizeConfig = {
  A7: { price: "$4", color: "#ff6fb2" },
  A5: { price: "$8", color: "#52c8cc" },
  A4: { price: "$12", color: "#cf6fff" },
  A3: { price: "$20", color: "#ffcc6f" },
  C: { price: "$6", color: "#91C768" },
};

function categorizeImages(data) {
  const categories = { front: [], back: [], insideLeft: [], insideRight: [] };
  let baCounter = 1,
    zzzCounter = 1,
    genCounter = 1,
    hsrCounter = 1,
    miscCounter = 1;

  data.forEach((item) => {
    const imagePath = item.image.toLowerCase();
    const imageName = item.image.split("/").pop().split(".")[0];

    if (imagePath.includes("/ba/")) {
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

  console.log(cart);

  if (cart.length === 0) {
    cartDiv.innerHTML = "<em>Cart is empty</em>";
    totalDiv.textContent = "Total: $0";
    return;
  }
cartDiv.innerHTML = cart
  .map((c, idx) => `
    <div class="cart-item" style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
      <img src="${c.image}" alt="${c.name}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">
      <div>
        ${c.id} - ${c.name} [${c.size}] $${c.price}
      </div>
      <button onclick="removeFromCart(${idx})" style="margin-left:auto;">x</button>
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
  const others = cart.filter((c) => c.type !== "print");
  const grouped = {};

  others.forEach((item) => {
    if (!grouped[item.name]) grouped[item.name] = [];
    grouped[item.name].push(item);
  });

  for (const name in grouped) {
    const itemsArray = grouped[name];
    const count = itemsArray.length;
    const type = itemsArray[0].type;
    const deal = defaultDeals[type];

    if (deal?.type === "Bundle2") {
      const pairs = Math.floor(count / 2);
      const singles = count % 2;
      total += pairs * deal.pair + singles * deal.single;
    }
  }

  document.getElementById("cart-total").textContent = `Total: $${total}`;
}

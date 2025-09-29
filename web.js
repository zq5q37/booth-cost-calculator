const sizeConfig = {
  A7: { price: "$4", color: "#ff6fb2" },
  A5: { price: "$8", color: "#52c8cc" },
  A4: { price: "$12", color: "#cf6fff" },
  A3: { price: "$20", color: "#ffcc6f" },
  C:  { price: "$6", color: "#91C768" },
};

function categorizeImages(data) {
  const categories = { front: [], back: [], insideLeft: [], insideRight: [] };
  let baCounter = 1, zzzCounter = 1, genCounter = 1, hsrCounter = 1, miscCounter = 1;

  data.forEach((item) => {
    const imagePath = item.image.toLowerCase();
    const imageName = item.image.split("/").pop().split(".")[0];

    if (imagePath.includes("/ba/")) {
      categories.back.push({ ...item, name: imageName, id: `B${baCounter++}` });
    } else if (imagePath.includes("/zzz/")) {
      categories.front.push({ ...item, name: imageName, id: `Z${zzzCounter++}` });
    } else if (imagePath.includes("/genshin/")) {
      categories.insideLeft.push({ ...item, name: imageName, id: `G${genCounter++}` });
    } else if (imagePath.includes("/hsr/")) {
      categories.insideLeft.push({ ...item, name: imageName, id: `H${hsrCounter++}` });
    } else if (imagePath.includes("/misc/")) {
      categories.insideRight.push({ ...item, name: imageName, id: `M${miscCounter++}` });
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
        ${item.sizes.map(size => `
          <button 
            class="size-tag" 
            data-id="${item.id}" 
            data-name="${item.name}" 
            data-size="${size}" 
            data-price="${sizeConfig[size].price}" 
            style="background:${sizeConfig[size].color}">
            + ${size} (${sizeConfig[size].price})
          </button>`).join("")}
      </div>
    `;

    container.appendChild(card);
  });

  // Attach listeners after rendering
  container.querySelectorAll(".size-tag").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const size = btn.dataset.size;
      const price = btn.dataset.price;

      addToCart({ id, name, size, price });
    });
  });
}


// Load dataset.json dynamically
fetch("dataset.json")
  .then(res => res.json())
  .then(dataset => {
    const categories = categorizeImages(dataset);

    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderTab(categories, btn.dataset.tab);
      });
    });

    // Default to first tab
    document.querySelector(".tab-btn").click();
  })
  .catch(err => console.error("Failed to load dataset.json:", err));

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

  cartDiv.innerHTML = cart.map((c, idx) => `
    <div class="cart-item">
      ${c.id} - ${c.name} [${c.size}] ${c.price}
      <button onclick="removeFromCart(${idx})">x</button>
    </div>
  `).join("");

  const total = cart.reduce((sum, c) => sum + parseFloat(c.price.replace("$","")), 0);
  totalDiv.textContent = "Total: $" + total;
}

window.removeFromCart = function(index) {
  cart.splice(index, 1);
  renderCart();
};
//test
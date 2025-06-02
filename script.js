const items = [
    { name: "A3", price: 20, type: "print", color: "#FFCC6F" },
    { name: "A4", price: 12, type: "print", color: "#CF6FFF" },
    { name: "A5", price: 8, type: "print", color: "#6FFAFF" },
    { name: "Mini", price: 4, type: "print", color: "#FF6FB2" },
    { name: "Sticker", price: 2, type: "print", color: "#FF9999" },
    { name: "Keychain", price: 8, type: "keychain", color: "#FFA07A" , hasSpecial: true },
    { name: "Stand", price: 20, type: "stand", color: "#90EE90" },
  ];
  
  const state = {};
  const row1 = document.getElementById("row1");
const row2 = document.getElementById("row2");

  
items.forEach((item, index) => {
    state[item.name] = 0;
  
    const card = document.createElement("div");
    card.className = "card";
    card.style.backgroundColor = item.color;
  
    card.innerHTML = `
      <span>${item.name}</span>
      <div class="controls">
        <button onclick="changeQty('${item.name}', -1)">-</button>
        <div class="count" id="count-${item.name}">0</div>
        <button onclick="changeQty('${item.name}', 1)">+</button>
      </div>
      ${
        item.hasSpecial
          ? `
          <div class="controls">
            <button onclick="changeQty('${item.name}_special', -1)">-</button>
            <div class="count" id="count-${item.name}_special">0</div>
            <button onclick="changeQty('${item.name}_special', 1)">+</button>
          </div>
          <div style="font-size: 12px;">Special (+$2)</div>
        `
          : ""
      }
    `;
  
    // First 4 in row1, rest in row2
    (index < 4 ? row1 : row2).appendChild(card);
  });
  
  
  function changeQty(name, delta) {
    if (typeof state[name] !== 'number') state[name] = 0;
  
    state[name] = Math.max(0, state[name] + delta);
  
    const base = name.split('_')[0];
  
    if (name.includes('_special')) {
      if (typeof state[base] !== 'number') state[base] = 0;
      if (state[name] > state[base]) {
        state[name] = state[base];
      }
    } else {
      const specialName = `${name}_special`;
      if (typeof state[specialName] !== 'number') state[specialName] = 0;
      if (state[specialName] > state[name]) {
        state[specialName] = state[name];
      }
    }
  
    if (document.getElementById(`count-${name}`))
      document.getElementById(`count-${name}`).textContent = state[name];
    if (document.getElementById(`count-${base}_special`))
      document.getElementById(`count-${base}_special`).textContent = state[`${base}_special`];
  
    updateTotal();
  }
  
  
  
  function updateTotal() {
    let total = 0;
    const printItems = [];
  
    items.forEach(({ name, type, price, hasSpecial }) => {
      const count = state[name];
  
      if (type === "print") {
        for (let i = 0; i < count; i++) printItems.push(price);
      } else if (type === "keychain" || type === "stand") {
        const [p1, p2] = type === "keychain" ? [8, 15] : [20, 36];
        const pairs = Math.floor(count / 2);
        const singles = count % 2;
        total += pairs * p2 + singles * p1;
  
        if (hasSpecial) {
          const specialCount = Math.min(state[`${name}_special`], count);
          total += specialCount * 2;
        }
      }
    });
  
    printItems.sort((a, b) => b - a);
    for (let i = 0; i < printItems.length; i++) {
      if ((i + 1) % 3 !== 0) total += printItems[i];
    }
  
    document.getElementById("total").textContent = `Total: $${total}`;
  }
  

    document.getElementById("reset").addEventListener("click", () => {
        for (const name in state) {
          state[name] = 0;
          document.getElementById(`count-${name}`).textContent = "0";
        }
        updateTotal();
      });
      
  
// window.addEventListener("DOMContentLoaded", () => {
const items = [
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

const state = {};
const row1 = document.getElementById("row1");
const row2 = document.getElementById("row2");

const isMobile = /Mobi|Android/i.test(navigator.userAgent);

items.forEach((item, index) => {
  state[item.name] = 0;
  if (item.hasSpecial) {
    state[`${item.name}_special`] = 0;
  }

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

  if (!isMobile) {
    // On desktop, split cards: first 4 to row1, rest to row2
    (index < 4 ? row1 : row2).appendChild(card);
  } else {
    // On mobile, just append all to row1 (or your preferred logic)
    row1.appendChild(card);
  }
});

function changeQty(name, delta) {
  if (typeof state[name] !== "number") state[name] = 0;

  state[name] = Math.max(0, state[name] + delta);

  const base = name.split("_")[0];

  if (name.includes("_special")) {
    if (typeof state[base] !== "number") state[base] = 0;
    if (state[name] > state[base]) {
      state[name] = state[base];
    }
  } else {
    const item = items.find((i) => i.name === name);
    if (item && item.hasSpecial === true) {
      const specialName = `${name}_special`;
      if (typeof state[specialName] !== "number") state[specialName] = 0;
      if (state[specialName] > state[name]) {
        state[specialName] = state[name];
      }
    }
  }

  if (document.getElementById(`count-${name}`))
    document.getElementById(`count-${name}`).textContent = state[name];
  if (document.getElementById(`count-${base}_special`))
    document.getElementById(`count-${base}_special`).textContent =
      state[`${base}_special`];

  updateTotal();
}

function updateBreakdown(printItems) {
  let breakdown = [];
  let printTotal = 0;

  if (printItems.length) {
    let line = `[Prints 3-for-2]: `;
    let groupTotal = 0;

    printItems.sort((a, b) => b - a);
    let labels = [];

    let tempIndex = 0;
    items.forEach(({ name, type, price }) => {
      if (type === "print" && state[name] > 0) {
        for (let i = 0; i < state[name]; i++) {
          labels.push({ price, label: name });
        }
      }
    });

    for (let i = 0; i < printItems.length; i++) {
      const isFree = (i + 1) % 3 === 0;
      const price = printItems[i];
      const label = labels[i]?.label || "";
      const text = `$${price} (${label})`;

      if (isFree) {
        line += `<s>${text}</s>, `;
      } else {
        groupTotal += price;
        line += `${text}, `;
      }
    }

    line = line.replace(/, $/, ` = $${groupTotal}`);
    printTotal = groupTotal;
    breakdown.push(line);
  }

  let keychainTotal = 0;
  let standTotal = 0;

  items.forEach(({ name, type, hasSpecial }) => {
    const count = state[name];
    if (count === 0 || type === "print") return;

    if (type === "keychain" || type === "stand") {
      const [p1, p2] = type === "keychain" ? [8, 15] : [20, 36];
      const pairs = Math.floor(count / 2);
      const singles = count % 2;
      let group = [];
      let groupSum = 0;

      if (pairs > 0) {
        group.push(`(${pairs} pair x $${p2})`);
        groupSum += pairs * p2;
      }

      if (singles > 0) {
        group.push(`(${singles} single x $${p1})`);
        groupSum += singles * p1;
      }

      if (hasSpecial) {
        const specialCount = Math.min(state[`${name}_special`] || 0, count);
        if (specialCount > 0) {
          group.push(`(${specialCount} special +$2)`);
          groupSum += specialCount * 2;
        }
      }

      const line = `[${name}]: ${group.join(" + ")} = $${groupSum}`;
      breakdown.push(line);

      if (type === "keychain") keychainTotal = groupSum;
      if (type === "stand") standTotal = groupSum;
    }
  });

  document.getElementById("calculation-breakdown").innerHTML =
    breakdown.join("<br>");

  return printTotal;
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
      const subTotal = pairs * p2 + singles * p1;
      total += subTotal;

      if (hasSpecial) {
        const specialCount = Math.min(state[`${name}_special`] || 0, count);
        if (specialCount > 0) {
          const specialTotal = specialCount * 2;
          total += specialTotal;
        }
      }
    }
  });

  printItems.sort((a, b) => b - a);

  const printTotal = updateBreakdown(printItems);
  total += printTotal;

  document.getElementById("total").textContent = `Total: $${total}`;
}

document.getElementById("reset").addEventListener("click", () => {
  for (const name in state) {
    state[name] = 0;
    const countEl = document.getElementById(`count-${name}`);
    if (countEl) countEl.textContent = "0";

    if (document.getElementById(`count-${name}_special`)) {
      document.getElementById(`count-${name}_special`).textContent = "0";
    }
  }
  updateTotal();
});

let orders = [];
const savedOrders = localStorage.getItem("orders");
if (savedOrders) {
  orders = JSON.parse(savedOrders);
  renderOrders(); // ⬅️ Restore table
}

document.getElementById("save").addEventListener("click", () => {
  const currentOrder = {};

  let hasItems = false;
  let totalItems = 0;

  for (const name in state) {
    currentOrder[name] = state[name];
    totalItems += state[name];
  }

  if (totalItems > 0) {
    hasItems = true;
  }

  if (!hasItems) return; // Don't save empty orders

  const totalText = document.getElementById("total").textContent;
  currentOrder.total = parseInt(totalText.replace(/\D/g, ""), 10);

  // ✅ Add timestamp here
  currentOrder.timestamp = new Date().toLocaleString();

  orders.push(currentOrder);
  localStorage.setItem("orders", JSON.stringify(orders)); // ⬅️ Save to localStorage
  renderOrders();

  document.getElementById("reset").click();
});

function renderOrders() {
  const orderList = document.getElementById("order-list");
  orderList.innerHTML = "";

  if (orders.length === 0) {
    orderList.textContent = "No saved orders yet.";
    return;
  }

  const allKeys = new Set();
  orders.forEach((order) => Object.keys(order).forEach((k) => allKeys.add(k)));
  allKeys.delete("total");
  allKeys.delete("timestamp"); // We'll add it manually to control position
  const itemKeys = Array.from(allKeys);

  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";
  table.style.maxWidth = "600px";
  table.style.marginTop = "16px";
  table.style.fontSize = "16px";

  // ✅ Include "Time" in the header
  const headerRow = document.createElement("tr");
  ["Order", ...itemKeys, "Total", "Time"].forEach((text) => {
    const th = document.createElement("th");
    th.textContent = text;
    th.style.border = "1px solid #ccc";
    th.style.padding = "8px";
    th.style.backgroundColor = "#f0f0f0";
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // ✅ Add timestamp to each row
  orders.forEach((order, idx) => {
    const row = document.createElement("tr");

    const orderCell = document.createElement("td");
    orderCell.textContent = idx + 1;
    orderCell.style.border = "1px solid #ccc";
    orderCell.style.padding = "8px";
    row.appendChild(orderCell);

    itemKeys.forEach((key) => {
      const td = document.createElement("td");
      td.textContent = order[key] || "0";
      td.style.border = "1px solid #ccc";
      td.style.padding = "8px";
      row.appendChild(td);
    });

    const totalCell = document.createElement("td");
    totalCell.textContent = order.total ? `$${order.total}` : "$0";
    totalCell.style.border = "1px solid #ccc";
    totalCell.style.padding = "8px";
    row.appendChild(totalCell);

    const timeCell = document.createElement("td");
    timeCell.textContent = order.timestamp || "";
    timeCell.style.border = "1px solid #ccc";
    timeCell.style.padding = "8px";
    row.appendChild(timeCell);

    table.appendChild(row);
  });

  orderList.appendChild(table);
}

document.getElementById("download").addEventListener("click", () => {
  if (orders.length === 0) return alert("No orders to download!");

  const rows = [];

  orders.forEach((order, idx) => {
    const row = { Order: idx + 1 };
    for (const key in order) {
      row[key] = order[key];
    }
    rows.push(row);
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

  XLSX.writeFile(workbook, "Day_x_orders.xlsx");
});

document.getElementById("clear-orders").addEventListener("click", () => {
  localStorage.removeItem("orders");
  orders = [];
  renderOrders();
});

// });

// settings.js
import { defaultItems, defaultDeals } from "./data.js";

// const originalDefaultItems = defaultItems;
// const originalDefaultDeals = defaultDeals;
const originalDefaultItems = JSON.parse(JSON.stringify(defaultItems));
const originalDefaultDeals = JSON.parse(JSON.stringify(defaultDeals));

let pending;
function safeRefresh() {
  clearTimeout(pending);
  pending = setTimeout(async () => {
    openSettings();
    await refreshItems();
    updateTotal();
  }, 100);
}

export function openSettings() {
  const panel = document.getElementById("settings-panel");

  let rows = "";
  let bundleRows = "";

  defaultItems.forEach((item, index) => {
    const deal = defaultDeals[item.type];

    if (deal?.type === "Bundle2") {
      bundleRows += `
        <tr data-index="${index}">
          <td>${
            item.name
          } <button class="delete-item" data-index="${index}">✕</button></td>
          <td><input type="number" value="${deal.single}" data-deal="${
        item.type
      }-single" /></td>
          <td><input type="number" value="${deal.pair}" data-deal="${
        item.type
      }-pair" /></td>
          <td>
            ${
              deal.special != null
                ? `<input type="number" value="${deal.special}" data-deal="${item.type}-special" />`
                : "-"
            }
          </td>
        </tr>
      `;
    } else {
      rows += `
        <div data-index="${index}">
          <label>${item.name}</label>
          <input type="number" value="${item.price}" data-name="${item.name}" />
          <button class="delete-item" data-index="${index}">✕</button>
        </div>
      `;
    }
  });

  panel.innerHTML = rows;

  if (bundleRows) {
    panel.innerHTML += `
      <h3>Bundle Deals</h3>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Single</th>
            <th>Pair</th>
            <th>Special</th>
          </tr>
        </thead>
        <tbody>
          ${bundleRows}
        </tbody>
      </table>
    `;
  }

  // Add 'Add Item' form
  panel.innerHTML += `
    <hr />


    <button id="reset-settings-button">Reset to Default</button>
    <button id="close-settings-button">Close</button>
  `;

  panel.style.display = "block";

  //   <h3>Add New Item</h3>
  // <div>
  //   <input id="new-item-name" type="text" placeholder="Name" />
  //   <input id="new-item-price" type="number" placeholder="Price" />
  //   <select id="new-item-type">
  //     <option value="print">Print</option>
  //     <option value="keychain">Keychain</option>
  //     <option value="stand">Stand</option>
  //     <!-- add more types if needed -->
  //   </select>
  //   <input id="new-item-color" type="color" value="#8F8F8F" title="Pick color" />
  //   <button id="add-item-button">Add Item</button>
  // </div>

  document
    .getElementById("close-settings-button")
    .addEventListener("click", closeSettings);

  document
    .getElementById("reset-settings-button")
    .addEventListener("click", async () => {
      // Step 1: Replace in-memory
      defaultItems.length = 0;
      defaultItems.push(...JSON.parse(JSON.stringify(originalDefaultItems)));

      Object.keys(defaultDeals).forEach((key) => delete defaultDeals[key]);
      Object.assign(
        defaultDeals,
        JSON.parse(JSON.stringify(originalDefaultDeals))
      );

      // Step 2: Save to storage
      await localforage.setItem("customItems", defaultItems);
      await localforage.setItem("customItemsdeals", defaultDeals);

      // Step 3: Refresh UI
      // openSettings();
      // refreshItems();
      // updateTotal();
      safeRefresh();
    });

  panel.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", saveSettings);
  });

  // Delete item handlers
  panel.querySelectorAll(".delete-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.target.dataset.index);
      if (!isNaN(idx)) {
        const item = defaultItems[idx]; // ✅ Save the item before deletion
        const type = item?.type;

        defaultItems.splice(idx, 1); // ✅ Then delete it

        // ✅ Only delete deal if no more items use that type
        const stillExists = defaultItems.some((i) => i.type === type);
        if (!stillExists && defaultDeals[type]) {
          delete defaultDeals[type];
        }

        localforage.setItem("customItems", defaultItems);
        localforage.setItem("customItemsdeals", defaultDeals);

        // openSettings();
        // refreshItems();
        // updateTotal();

        safeRefresh();
      }
    });
  });
}
// Add item handler
// document.getElementById("add-item-button").addEventListener("click", () => {
//   const name = document.getElementById("new-item-name").value.trim();
//   const price = parseInt(document.getElementById("new-item-price").value, 10);
//   const type = document.getElementById("new-item-type").value;
//   const color = document.getElementById("new-item-color").value;

//   if (!name || isNaN(price)) {
//     alert("Please enter valid name and price.");
//     return;
//   }

//   // Add new item
//   defaultItems.push({ name, price, type, color });

//   // Optionally add default deal for new item type if needed
//   // if (type === "keychain" || type === "stand") {
//   //   defaultDeals[type] = {
//   //     type: "Bundle2",
//   //     single: price,
//   //     pair: price * 2,
//   //     special: 2,
//   //   };
//   // }

//   localforage.setItem("customItems", defaultItems);
//   localforage.setItem("customItemsdeals", defaultDeals);

//   safeRefresh();
// });

function closeSettings() {
  const panel = document.getElementById("settings-panel");
  panel.style.display = "none";
}

export async function saveSettings() {
  const panel = document.getElementById("settings-panel");

  document.querySelectorAll("#settings-panel input").forEach((input) => {
    const itemName = input.dataset.name;
    const dealKey = input.dataset.deal;

    if (itemName) {
      const item = defaultItems.find((i) => i.name === itemName);
      if (item) item.price = parseInt(input.value, 10);
    }

    if (dealKey) {
      const [type, key] = dealKey.split("-");
      let deals = defaultDeals;
      if (!deals[type]) deals[type] = { type: "Bundle2" };
      deals[type][key] = parseInt(input.value, 10);
    }
  });

  await localforage.setItem("customItems", defaultItems);
  await localforage.setItem("customItemsDeals", defaultDeals);

  updateTotal();
}

window.openSettings = openSettings; // 👈 make globally accessible

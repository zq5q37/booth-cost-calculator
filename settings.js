// settings.js
import { defaultItems, defaultDeals } from "./data.js";

const originalDefaultItems = JSON.parse(JSON.stringify(defaultItems));
const originalDefaultDeals = JSON.parse(JSON.stringify(defaultDeals));

export function openSettings() {
  const panel = document.getElementById("settings-panel");

  let rows = "";
  let bundleRows = "";

  defaultItems.forEach((item) => {
    const deal = defaultDeals[item.type];

    if (deal?.type === "Bundle2") {
      bundleRows += `
        <tr>
          <td>${item.name}</td>
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
        <div>
          <label>${item.name}</label>
          <input type="number" value="${item.price}" data-name="${item.name}" />
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

  panel.innerHTML += `
    <button id="reset-settings-button">Reset to Default</button>
    <button id="close-settings-button">Close</button>
  `;

  panel.style.display = "block";

  document
    .getElementById("close-settings-button")
    .addEventListener("click", closeSettings);

  document
    .getElementById("reset-settings-button")
    .addEventListener("click", () => {
      // Reset in-memory items & deals to default
      Object.assign(
        defaultItems,
        JSON.parse(JSON.stringify(originalDefaultItems))
      );
      Object.assign(
        defaultDeals,
        JSON.parse(JSON.stringify(originalDefaultDeals))
      );

      // Update localforage
      localforage.setItem("customItems", originalDefaultItems);
      localforage.setItem("customItemsdeals", originalDefaultDeals);

      // Reopen the panel to refresh UI with default values
      openSettings();

      updateTotal();
    });

  panel.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", saveSettings);
  });
}

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

// settings.js
import { defaultItems, deals } from "./data.js";
// import localforage from "localforage";

export function openSettings() {
  const panel = document.getElementById("settings-panel");

  panel.innerHTML = defaultItems
    .map(
      (item) => `
        <div>
          <label>${item.name}</label>
          <input type="number" value="${item.price}" data-name="${item.name}" />
        </div>
      `
    )
    .join("");

  // Optionally keep the Save button (for user feedback)
  panel.innerHTML += `
    <button id="close-settings-button">Close</button>
  `;

  panel.style.display = "block";

  // Save when the Save button is clicked
  document
    .getElementById("close-settings-button")
    .addEventListener("click", closeSettings);

  // Auto-save on input change
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
    const item = defaultItems.find((i) => i.name === input.dataset.name);
    if (item) item.price = parseInt(input.value, 10);
  });

  await localforage.setItem("customItems", defaultItems);

  // await refreshItems();
  // resetAll();
  updateTotal();
}

window.openSettings = openSettings; // 👈 make globally accessible

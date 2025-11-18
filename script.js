// Handle Generate Routine button click
const generateBtn = document.getElementById("generateRoutine");
if (generateBtn) {
  generateBtn.addEventListener("click", async () => {
    if (!selectedProducts.length) {
      chatWindow.innerHTML =
        "Please select at least one product to generate a routine.";
      return;
    }
    // Add a message to chat history describing the selected products
    const productList = selectedProducts
      .map((p) => `${p.name} (${p.brand})`)
      .join(", ");
    const routinePrompt = `Here are the products I have: ${productList}. Please create a personalized skincare or haircare routine using only these products. Explain the order and how to use each one.`;
    messages.push({ role: "user", content: routinePrompt });
    renderMessages();
    messages.push({ role: "assistant", content: "Thinking..." });
    renderMessages();
    try {
      const response = await fetch(
        "https://loreal-chatbot-info.arsule.workers.dev/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
        }
      );
      const data = await response.json();
      messages.pop(); // Remove "Thinking..."
      let aiReply =
        data.choices?.[0]?.message?.content ||
        "Sorry, I couldn't get a response.";
      messages.push({ role: "assistant", content: aiReply });
      renderMessages();
    } catch (err) {
      messages.pop();
      messages.push({
        role: "assistant",
        content: "Sorry, there was a problem connecting to the server.",
      });
      renderMessages();
    }
  });
}
/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

// Selected products array, loaded from localStorage if available
let selectedProducts = JSON.parse(
  localStorage.getItem("selectedProducts") || "[]"
);

// Render selected products above the button
function renderSelectedProducts() {
  const selectedList = document.getElementById("selectedProductsList");
  if (!selectedList) return;
  if (selectedProducts.length === 0) {
    selectedList.innerHTML =
      '<div class="placeholder-message">No products selected</div>';
    return;
  }
  selectedList.innerHTML = selectedProducts
    .map(
      (product, idx) => `
        <div class="selected-product">
          <span>${product.name}</span>
          <button class="remove-selected" data-idx="${idx}" title="Remove">&times;</button>
        </div>
      `
    )
    .join("");
  // Add remove event listeners
  document.querySelectorAll(".remove-selected").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.target.getAttribute("data-idx"));
      selectedProducts.splice(idx, 1);
      localStorage.setItem(
        "selectedProducts",
        JSON.stringify(selectedProducts)
      );
      renderSelectedProducts();
      // Also update product card highlights
      updateProductCardHighlights();
    });
  });
}

// Update product card highlights based on selection
function updateProductCardHighlights() {
  document.querySelectorAll(".product-card").forEach((card) => {
    // const pid = card.getAttribute("data-id");
    const pid = Number(card.getAttribute("data-id"));
    if (selectedProducts.some((p) => p.id === pid)) {
      card.classList.add("selected");
    } else {
      card.classList.remove("selected");
    }
  });
}

// Create HTML for displaying product cards with selection logic
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card" data-id="${product.id}">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
        <button class="desc-toggle-btn" aria-expanded="false" aria-controls="desc-${product.id}">Show Description</button>
      </div>
      <div class="product-desc-overlay" id="desc-${product.id}" hidden>
        <p>${product.description}</p>
      </div>
    </div>
  `
    )
    .join("");

  // Add toggle logic for description
  document.querySelectorAll(".desc-toggle-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const overlay = btn
        .closest(".product-card")
        .querySelector(".product-desc-overlay");
      const isOpen = !overlay.hasAttribute("hidden");
      if (isOpen) {
        overlay.setAttribute("hidden", "");
        btn.textContent = "Show Description";
        btn.setAttribute("aria-expanded", "false");
      } else {
        overlay.removeAttribute("hidden");
        btn.textContent = "Hide Description";
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
  // Add CSS for product description toggle if not present
  function addProductDescToggleStyles() {
    if (document.getElementById("product-desc-toggle-style")) return;
    const style = document.createElement("style");
    style.id = "product-desc-toggle-style";
    style.textContent = `
      .product-card { position: relative; cursor: pointer; }
      .desc-toggle-btn {
        margin-top: 8px;
        background: #222;
        color: #fff;
        border: none;
        border-radius: 4px;
        padding: 4px 10px;
        font-size: 0.95em;
        cursor: pointer;
        transition: background 0.2s;
      }
      .desc-toggle-btn[aria-expanded="true"] {
        background: #444;
      }
      .product-desc-overlay {
        position: absolute;
        left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.92);
        color: #fff;
        padding: 12px;
        font-size: 0.95em;
        border-radius: 0 0 8px 8px;
        z-index: 2;
        max-height: 60%;
        overflow-y: auto;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
      .product-desc-overlay[hidden] {
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  // Ensure toggle styles are present on page load
  window.addEventListener("DOMContentLoaded", addProductDescToggleStyles);

  // Add click event to each product card
  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", () => {
      const pid = Number(card.getAttribute("data-id"));
      // Find product by id
      loadProducts().then((allProducts) => {
        const product = allProducts.find((p) => p.id === pid);
        if (!product) return;
        const idx = selectedProducts.findIndex((p) => p.id === pid);
        if (idx === -1) {
          selectedProducts.push(product);
        } else {
          selectedProducts.splice(idx, 1);
        }
        localStorage.setItem(
          "selectedProducts",
          JSON.stringify(selectedProducts)
        );
        renderSelectedProducts();
        updateProductCardHighlights();
      });
    });
  });
  updateProductCardHighlights();
}

/* Filter and display products when category changes */

categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );
  displayProducts(filteredProducts);
});

// On page load, render selected products and highlights
window.addEventListener("DOMContentLoaded", () => {
  renderSelectedProducts();
  updateProductCardHighlights();
});

/* Chat form submission handler - connects to OpenAI API */

// Store chat history
let messages = [
  {
    role: "system",
    content: "You are a helpful assistant for skincare routines.",
  },
];

// Render all messages in the chat window
function renderMessages() {
  chatWindow.innerHTML = messages
    .filter((msg) => msg.role !== "system")
    .map(
      (msg) =>
        `<div class="${msg.role}"><strong>${
          msg.role === "user" ? "You" : "AI"
        }:</strong> ${msg.content}</div>`
    )
    .join("");
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's message from the input field
  const userInput = document.getElementById("userInput").value;
  if (!userInput.trim()) return;

  // Add user message to history
  messages.push({ role: "user", content: userInput });
  renderMessages();

  // Show a loading message from AI
  messages.push({ role: "assistant", content: "Thinking..." });
  renderMessages();

  // Remove the loading message after response
  try {
    const response = await fetch(
      "https://loreal-chatbot-info.arsule.workers.dev/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      }
    );
    const data = await response.json();
    // Remove the last ("Thinking...") message
    messages.pop();
    let aiReply =
      data.choices?.[0]?.message?.content ||
      "Sorry, I couldn't get a response.";
    // Add assistant message to history
    messages.push({ role: "assistant", content: aiReply });
    renderMessages();
  } catch (err) {
    messages.pop();
    messages.push({
      role: "assistant",
      content: "Sorry, there was a problem connecting to the server.",
    });
    renderMessages();
  }
  // Clear the input field
  document.getElementById("userInput").value = "";
});

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

/* Create HTML for displaying product cards */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
      </div>
    </div>
  `
    )
    .join("");
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;

  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  displayProducts(filteredProducts);
});

/* Chat form submission handler - placeholder for OpenAI integration */
<<<<<<< HEAD
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  chatWindow.innerHTML = "Connect to the OpenAI API for a response!";
=======
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
>>>>>>> 27aa8cf (secure ai stuff)
});

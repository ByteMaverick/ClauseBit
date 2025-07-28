document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");
  const chatbox = document.getElementById("chatbox");
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const chatForm = document.querySelector(".chat-form");
  let currentURL = "";

  // 🛡️ Escape to prevent injection
  const escapeHTML = (str) =>
    str.replace(/[&<>"']/g, (tag) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[tag]);

  // 🧠 Display message in chat
  const appendMessage = (sender, text, isBot = false) => {
    const div = document.createElement("div");
    div.className = isBot ? "bot-message" : "user-message";
    div.innerHTML = `<strong>${sender}:</strong> ${escapeHTML(text)}`;
    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;
  };

  // ✉️ Handle sending a message
  async function handleSend() {
    const message = userInput.value.trim();
    if (!message) return;
    appendMessage("You", message);
    userInput.value = "";

    try {
      const res = await fetch("http://127.0.0.1:8080/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: message,
          session_id: "default-session"
        })
      });

      const data = await res.text();
      appendMessage("ClauseBit", data, true);
    } catch {
      appendMessage("ClauseBit", `❌ Error contacting AI backend.`, true);
    }
  }

  // 🖱️ Button and keyboard support
  sendBtn?.addEventListener("click", handleSend);
  chatForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSend();
  });

  // 🧭 Tab switching
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.getAttribute("data-tab");
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((tabContent) =>
        tabContent.classList.remove("active")
      );
      document.getElementById(`${tab}-tab`)?.classList.add("active");
      button.classList.add("active");
    });
  });

  // 🔍 Grab current tab URL (Chrome extension context)
  try {
    chrome.runtime.sendMessage({ type: "GET_CURRENT_TAB" }, (response) => {
      if (response?.url) {
        currentURL = response.url;
        sendInitialRequest(currentURL); // send to classifier
        loadSummaryFromBackend(currentURL); // fetch summary
      }
    });
  } catch (e) {
    console.warn("⚠️ Chrome API not available", e);
    loadSummaryFromBackend(""); // fallback
  }

  // 📡 Send site info to classifier endpoint
  async function sendInitialRequest(url) {
    appendMessage("System", `🔍 Scanning ${url}...`, true);
    try {
      await fetch("http://127.0.0.1:8080/classifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: url })
      });
      appendMessage("System", `✅ Scan complete.`, true);
    } catch {
      appendMessage("System", `❌ Failed to contact server.`, true);
    }
  }

  // 📑 Load summary UI from backend
  async function loadSummaryFromBackend(url) {
    try {
      console.log("Calling /summary with:", url);

      const res = await fetch("http://127.0.0.1:8080/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: url })
      });

      const data = await res.json();

      // 🌟 Update banner and main summary text
      document.querySelector(".alert-text").textContent = data.riskLevel;
      document.querySelector(".summary-text").textContent = data.summaryText;

      // 🧱 Inject each clause as a card
      const cardsContainer = document.querySelector(".cards");
      cardsContainer.innerHTML = ""; // clear existing

      data.clauses.forEach((clause) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <div class="card-content">
            <div class="card-icon-text">
              <i data-lucide="${clause.icon}" class="card-icon ${clause.type}"></i>
              <div class="card-text">
                <h3 class="card-title">${clause.title}</h3>
                <p class="card-description">${clause.description}</p>
              </div>
            </div>
            ${
              clause.action
                ? `<button class="${clause.action === "Why?" ? "why-button" : "flag-button"}">${clause.action}</button>`
                : ""
            }
          </div>
        `;
        cardsContainer.appendChild(card);
      });

      lucide.createIcons(); // ensure icons show up
    } catch (error) {
      console.error("❌ Failed to load summary:", error);
      document.querySelector(".summary-text").textContent = "Failed to load summary.";
      document.querySelector(".alert-text").textContent = "⚠️ Risk summary unavailable.";
      console.error("Summary fetch failed:", error);

    }
  }
});

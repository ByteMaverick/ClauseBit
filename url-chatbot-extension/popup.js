document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");
  const chatbox = document.getElementById("chatbox");
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const chatForm = document.querySelector(".chat-form");
  let currentURL = "";

  const escapeHTML = (str) =>
    str.replace(/[&<>"']/g, (tag) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[tag]);

  const appendMessage = (sender, text, isBot = false) => {
    const div = document.createElement("div");
    div.className = isBot ? "bot-message" : "user-message";
    div.innerHTML = `<strong>${sender}:</strong> ${escapeHTML(text)}`;
    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;
  };

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
          session_id: "default-session",
          current_url: currentURL
        })
      });

      const data = await res.json();
      appendMessage("ClauseBit", data.response, true);
    } catch {
      appendMessage("ClauseBit", `❌ Error contacting AI backend.`, true);
    }
  }

  sendBtn?.addEventListener("click", handleSend);
  chatForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSend();
  });

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

  // 🔍 Get tab URL
  try {
    chrome.runtime.sendMessage({ type: "GET_CURRENT_TAB" }, (response) => {
      if (response?.url) {
        try {
          const urlObj = new URL(response.url);
          currentURL = urlObj.origin + "/";
        } catch (e) {
          console.warn("⚠️ URL parse failed:", e);
          currentURL = response.url;
        }

        // 🌐 First try from cache
        chrome.storage.local.get([`summary_${currentURL}`], (result) => {
          const cachedSummary = result[`summary_${currentURL}`];
          if (cachedSummary) {
            renderSummary(cachedSummary);
          }
        });

        // 🔄 Always fetch latest
        setTimeout(() => {
          loadSummaryFromBackend(currentURL);
        }, 1000);
      }
    });
  } catch (e) {
    console.warn("⚠️ Chrome API not available", e);
    loadSummaryFromBackend(""); // fallback
  }

  async function loadSummaryFromBackend(url) {
    try {
      const res = await fetch("http://127.0.0.1:8080/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: url })
      });

      const data = await res.json();

      // 🔄 Update cache and UI
      chrome.storage.local.set({ [`summary_${url}`]: data });
      renderSummary(data);
    } catch (error) {
      console.error("❌ Failed to load summary:", error);
      document.querySelector(".summary-text").textContent = "Failed to load summary.";
      document.querySelector(".alert-text").textContent = "⚠️ Risk summary unavailable.";
    }
  }

  function renderSummary(data) {
    document.querySelector(".alert-text").textContent = data.riskLevel;
    document.querySelector(".summary-text").textContent = data.summaryText;

    const cardsContainer = document.querySelector(".cards");
    cardsContainer.innerHTML = "";

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

    lucide.createIcons();
    chrome.action.setBadgeText({ text: "" }); // Clear badge after showing
  }
});

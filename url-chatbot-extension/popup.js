document.addEventListener("DOMContentLoaded", () => {
  // 1. Show loading screen
  const loadingScreen = document.getElementById("loading-screen");
  const mainSection = document.getElementById("main-section");
  const unauthSection = document.getElementById("unauth-section");

  // 2. Auth check via Clerk cookie
  chrome.cookies.get(
    {
      url: "https://clausebit.online/",
      name: "__session"
    },
    function (cookie) {
      if (cookie) {
        const jwt = cookie.value;
        fetch("https://clausebitbackendimg-834600606953.us-central1.run.app/api/extension-auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`
          }
        })
        .then(res => res.json())
        .then(data => {
          loadingScreen.style.display = "none";
          if (data.is_authenticated) {
            mainSection.style.display = "block";
            unauthSection.style.display = "none";
            initializePopup();
          } else {
            unauthSection.style.display = "block";
          }
        })
        .catch(() => {
          loadingScreen.style.display = "none";
          unauthSection.style.display = "block";
        });
      } else {
        loadingScreen.style.display = "none";
        unauthSection.style.display = "block";
      }
    }
  );
  function initializePopup() {
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
        const res = await fetch("https://clausebitbackendimg-834600606953.us-central1.run.app/chat", {
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
        appendMessage("ClauseBit", `Error contacting AI backend.`, true);
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

    // Get tab URL
    try {
      chrome.runtime.sendMessage({ type: "GET_CURRENT_TAB" }, (response) => {
        if (response?.url) {
          try {
            const urlObj = new URL(response.url);
            currentURL = urlObj.origin + "/";
          } catch (e) {
            console.warn("URL parse failed:", e);
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
      console.warn("Chrome API not available", e);
      loadSummaryFromBackend(""); // fallback
    }

    async function loadSummaryFromBackend(url) {
      try {
        const res = await fetch("https://clausebitbackendimg-834600606953.us-central1.run.app/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company_name: url })
        });

        const data = await res.json();
        chrome.storage.local.set({ [`summary_${url}`]: data });
        renderSummary(data);
      } catch (error) {
        document.querySelector(".summary-text").textContent = "Failed to load summary.";
        document.querySelector(".alert-text").textContent = "Risk summary unavailable.";
      }
    }

  function renderSummary(data) {
  document.querySelector(".alert-text").textContent = data.riskLevel ?? "Risk data unavailable";
  document.querySelector(".summary-text").textContent = data.summaryText ?? "No summary provided.";

  const cardsContainer = document.querySelector(".cards");
  cardsContainer.innerHTML = "";

  if (Array.isArray(data.clauses)) {
    data.clauses.forEach((clause) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="card-content">
          <div class="card-icon-text">
            <i data-lucide="${clause.icon || 'alert-triangle'}" class="card-icon ${clause.type || ''}"></i>
            <div class="card-text">
              <h3 class="card-title">${clause.title || 'Untitled Clause'}</h3>
              <p class="card-description">${clause.description || 'No description available.'}</p>
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
  } else {
    cardsContainer.innerHTML = `<p class="text-sm text-gray-500">No clause data available.</p>`;
  }

  lucide.createIcons();
  chrome.action.setBadgeText({ text: "" });
}


      lucide.createIcons();
      chrome.action.setBadgeText({ text: "" });
    }
});

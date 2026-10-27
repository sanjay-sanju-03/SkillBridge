async function getSession() {
    const response = await fetch("/api/session");
    return response.json();
}

async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "index.html";
}

async function loadNavigation() {
    const login = document.getElementById("loginLink");
    const register = document.getElementById("registerLink");
    const dashboard = document.getElementById("dashboardLink");
    const logoutLink = document.getElementById("logoutLink");

    const data = await getSession();

    if (!data.user) return;

    if (login) login.classList.add("hidden");
    if (register) register.classList.add("hidden");
    if (dashboard) {
        dashboard.classList.remove("hidden");
        dashboard.href = data.user.role === "admin" ? "admin.html" : "student.html";
    }
    if (logoutLink) {
        logoutLink.classList.remove("hidden");
        logoutLink.onclick = function (event) {
            event.preventDefault();
            logout();
        };
    }
}

async function loadOpportunities(search = "") {
    const list = document.getElementById("opportunityList");
    if (!list) return;

    const response = await fetch("/api/opportunities?search=" + encodeURIComponent(search));
    const opportunities = await response.json();
    list.innerHTML = "";

    if (!opportunities.length) {
        list.innerHTML = "<p>No opportunities found.</p>";
        return;
    }

    opportunities.forEach(opportunity => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<div class="opportunity-card-head"><span class="category-badge">${opportunity.category}</span></div><h3>${opportunity.title}</h3><p class="card-detail"><strong>Venue</strong><span>${opportunity.venue}</span></p><a class="button button-secondary card-link" href="opportunity.html?id=${opportunity._id}">View details</a>`;
        list.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadNavigation();
    const searchForm = document.getElementById("searchForm");
    if (searchForm) {
        searchForm.addEventListener("submit", event => {
            event.preventDefault();
            loadOpportunities(document.getElementById("search").value);
        });
        loadOpportunities();
    }
});

async function studentSession() {
    const response = await fetch("/api/session");
    const data = await response.json();
    if (!data.user || data.user.role !== "student") {
        window.location.href = "login.html";
        return null;
    }
    return data.user;
}

async function loadOpportunity() {
    const box = document.getElementById("opportunity");
    if (!box) return;

    const id = new URLSearchParams(location.search).get("id");
    if (!id) {
        box.textContent = "Opportunity not found.";
        return;
    }

    const response = await fetch("/api/opportunities/" + id);
    if (!response.ok) {
        box.textContent = "Opportunity not found.";
        return;
    }

    const opportunity = await response.json();
    box.innerHTML = `<div class="card"><h1>${opportunity.title}</h1><p><strong>Category:</strong> ${opportunity.category}</p><p>${opportunity.description}</p><p><strong>Date:</strong> ${new Date(opportunity.date).toDateString()}</p><p><strong>Deadline:</strong> ${new Date(opportunity.deadline).toDateString()}</p><p><strong>Venue:</strong> ${opportunity.venue}</p><button id="apply">Apply</button><p id="message"></p></div>`;

    // Only fetch session once
    const sessionRes = await fetch("/api/session");
    const sessionData = await sessionRes.json();
    const button = document.getElementById("apply");

    if (!sessionData.user) {
        button.textContent = "Login to Apply";
        button.onclick = () => location.href = "login.html";
        return;
    }

    if (sessionData.user.role !== "student") {
        button.remove();
        return;
    }

    // Check if already applied to disable button immediately on load
    const appsRes = await fetch("/api/student/applications");
    if (appsRes.ok) {
        const apps = await appsRes.json();
        const alreadyApplied = apps.some(app => app.opportunityId && app.opportunityId._id === id);
        if (alreadyApplied) {
            button.disabled = true;
            button.textContent = "Applied";
            document.getElementById("message").textContent = "You have already applied for this opportunity.";
        }
    }

    button.onclick = async () => {
        button.disabled = true; // Prevent double-clicks
        const result = await fetch("/api/student/apply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ opportunityId: id })
        });
        const data = await result.json();
        document.getElementById("message").textContent = data.message;
        if (result.ok) {
            button.textContent = "Applied";
        } else {
            button.disabled = false; // Re-enable if there was an error
        }
    };
}

async function loadStudent() {
    const welcome = document.getElementById("welcome");
    if (!welcome) return;
    const user = await studentSession();
    if (!user) return;
    welcome.textContent = "Welcome, " + user.name;
    document.getElementById("logout").onclick = async event => {
        event.preventDefault();
        await fetch("/api/auth/logout", { method: "POST" });
        location.href = "index.html";
    };
}

async function loadApplications() {
    const box = document.getElementById("applications");
    if (!box) return;
    const response = await fetch("/api/student/applications");
    
    // Only redirect if unauthorized. Other errors shouldn't boot the user.
    if (response.status === 401) {
        location.href = "login.html";
        return;
    }
    if (!response.ok) {
        box.innerHTML = "<p>Failed to load applications.</p>";
        return;
    }

    const applications = await response.json();
    box.innerHTML = ""; // Clear existing first
    if (!applications.length) {
        box.innerHTML = "<p>No applications found. <a href='opportunities.html'>Browse opportunities</a>.</p>";
        return;
    }
    applications.forEach(application => {
        const card = document.createElement("div");
        card.className = "card";
        const title = application.opportunityId ? application.opportunityId.title : "[Deleted Opportunity]";
        const category = application.opportunityId ? application.opportunityId.category : "N/A";
        const status = application.status || "pending";
        card.innerHTML = `<h3>${title}</h3><p>Category: ${category}</p><p>Applied: ${new Date(application.appliedAt).toDateString()}</p><p><strong>Status:</strong> ${status}</p>`;
        box.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadOpportunity();
    loadStudent();
    loadApplications();
});

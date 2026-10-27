async function checkAdmin() {
    const response = await fetch("/api/session");
    const data = await response.json();
    if (!data.user || data.user.role !== "admin") {
        location.href = "login.html";
        return false;
    }
    return true;
}

async function logoutAdmin() {
    await fetch("/api/auth/logout", { method: "POST" });
    location.href = "index.html";
}

// Bug fix #2: logout element may not exist on every admin page
function attachLogout() {
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.onclick = event => { event.preventDefault(); logoutAdmin(); };
    }
}

async function loadDashboard() {
    const box = document.getElementById("stats");
    if (!box || !await checkAdmin()) return;
    const response = await fetch("/api/admin/dashboard");
    if (!response.ok) { box.innerHTML = "<p>Failed to load dashboard.</p>"; return; }
    const data = await response.json();
    box.innerHTML = `<div class="card"><h2>${data.students}</h2><p>Students</p></div><div class="card"><h2>${data.opportunities}</h2><p>Opportunities</p></div><div class="card"><h2>${data.applications}</h2><p>Applications</p></div>`;
    attachLogout();
}

async function loadAdminOpportunities() {
    const box = document.getElementById("opportunityList");
    if (!box || !await checkAdmin()) return;
    const response = await fetch("/api/admin/opportunities");
    if (!response.ok) { box.innerHTML = "<p>Failed to load opportunities.</p>"; return; }
    const data = await response.json();
    // Bug fix #10: clear before render to prevent duplicates
    box.innerHTML = "";
    if (!data.length) { box.innerHTML = "<p>No opportunities found. <a href='opportunity-form.html'>Add one</a>.</p>"; return; }
    data.forEach(opportunity => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<h3>${opportunity.title}</h3><p class="card-meta">${opportunity.category}</p><p><strong>Date:</strong> ${new Date(opportunity.date).toDateString()}</p><p><strong>Deadline:</strong> ${new Date(opportunity.deadline).toDateString()}</p><div class="card-actions"><a class="button button-secondary" href="opportunity-form.html?id=${opportunity._id}">Edit</a><button class="button button-danger" onclick="deleteOpportunity('${opportunity._id}')">Delete</button></div>`;
        box.appendChild(card);
    });
}

async function deleteOpportunity(id) {
    if (!confirm("Delete this opportunity?")) return;
    const response = await fetch("/api/admin/opportunities/" + id, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) return alert(data.message);
    loadAdminOpportunities();
}

async function loadStudents() {
    const box = document.getElementById("students");
    if (!box || !await checkAdmin()) return;
    const response = await fetch("/api/admin/students");
    if (!response.ok) { box.innerHTML = "<p>Failed to load students.</p>"; return; }
    const data = await response.json();
    box.innerHTML = "";
    if (!data.length) {
        box.innerHTML = "<p>No students found.</p>";
        return;
    }
    data.forEach(student => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<h3>${student.name}</h3><p class="card-meta">${student.email}</p><p>Registered: ${new Date(student.createdAt).toDateString()}</p><div class="card-actions"><button class="button button-danger" onclick="deleteStudent('${student._id}')">Delete student</button></div>`;
        box.appendChild(card);
    });
}

async function deleteStudent(id) {
    if (!confirm("Delete this student and their applications?")) return;
    const response = await fetch("/api/admin/students/" + id, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) return alert(data.message);
    loadStudents();
}

async function loadForm() {
    const form = document.getElementById("opportunityForm");
    if (!form || !await checkAdmin()) return;

    const id = new URLSearchParams(location.search).get("id");

    if (id) {
        document.getElementById("formTitle").textContent = "Edit Opportunity";
        const response = await fetch("/api/opportunities/" + id);
        // Bug fix #1: guard response before accessing fields
        if (!response.ok) {
            document.getElementById("message").textContent = "Failed to load opportunity.";
            return;
        }
        const data = await response.json();
        document.getElementById("title").value = data.title || "";
        document.getElementById("description").value = data.description || "";
        document.getElementById("category").value = data.category || "";
        document.getElementById("date").value = data.date ? data.date.split("T")[0] : "";
        document.getElementById("deadline").value = data.deadline ? data.deadline.split("T")[0] : "";
        document.getElementById("venue").value = data.venue || "";
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();
        const msgEl = document.getElementById("message");
        msgEl.textContent = "";
        const data = {
            title: document.getElementById("title").value.trim(),
            description: document.getElementById("description").value.trim(),
            category: document.getElementById("category").value.trim(),
            date: document.getElementById("date").value,
            deadline: document.getElementById("deadline").value,
            venue: document.getElementById("venue").value.trim()
        };
        const response = await fetch(id ? "/api/admin/opportunities/" + id : "/api/admin/opportunities", {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (response.ok) location.href = "manage-opportunities.html";
        else msgEl.textContent = result.message;
    });
}

async function loadAdminApplications() {
    const box = document.getElementById("applications");
    if (!box || !await checkAdmin()) return;
    const response = await fetch("/api/admin/applications");
    if (!response.ok) { box.innerHTML = "<p>Failed to load applications.</p>"; return; }
    const data = await response.json();
    // Bug fix #10: clear before render
    box.innerHTML = "";
    if (!data.length) {
        box.innerHTML = "<p>No applications found.</p>";
        return;
    }
    data.forEach(application => {
        // Bug fix #1: opportunityId or studentId may be null if referenced doc was deleted
        const title = application.opportunityId ? application.opportunityId.title : "[Deleted Opportunity]";
        const name  = application.studentId    ? application.studentId.name    : "[Deleted User]";
        const email = application.studentId    ? application.studentId.email   : "";
        const status = application.status || "pending";
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<h3>${title}</h3><p>Student: ${name}</p>${email ? `<p class="card-meta">${email}</p>` : ""}<p>Applied: ${new Date(application.appliedAt).toDateString()}</p><p><strong>Status:</strong> <span class="status status-${status}">${status}</span></p><div class="card-actions"><button class="button button-success" onclick="updateApplicationStatus('${application._id}', 'approved')">Approve</button><button class="button button-warning" onclick="updateApplicationStatus('${application._id}', 'rejected')">Reject</button><button class="button button-danger" onclick="deleteApplication('${application._id}')">Delete</button></div>`;
        box.appendChild(card);
    });
}

async function updateApplicationStatus(id, status) {
    const response = await fetch("/api/admin/applications/" + id + "/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!response.ok) return alert(data.message);
    loadAdminApplications();
}

async function deleteApplication(id) {
    if (!confirm("Delete this application?")) return;
    const response = await fetch("/api/admin/applications/" + id, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) return alert(data.message);
    loadAdminApplications();
}

document.addEventListener("DOMContentLoaded", () => {
    attachLogout();
    loadDashboard();
    loadAdminOpportunities();
    loadForm();
    loadAdminApplications();
    loadStudents();
});

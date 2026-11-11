<<<<<<< HEAD
// Get all website sections
const loginSection = document.getElementById("loginSection");
const signupSection = document.getElementById("signupSection");
const dashboardSection = document.getElementById("dashboardSection");

// Switch between login and signup
document.getElementById("showSignup").addEventListener("click", () => {
    loginSection.classList.add("hidden");
    signupSection.classList.remove("hidden");
});

document.getElementById("showLogin").addEventListener("click", () => {
    signupSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
});

// Show or hide passwords
document.querySelectorAll(".show-btn").forEach(button => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.target);

        if (input.type === "password") {
            input.type = "text";
            button.textContent = "Hide";
        } else {
            input.type = "password";
            button.textContent = "Show";
        }
    });
});

// Get saved demo accounts
function getAccounts() {
    return JSON.parse(localStorage.getItem("astronautAccounts") || "[]");
}

// Create a new account
document.getElementById("signupForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const astronautId = document.getElementById("newAstronautId").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    if (password.length < 8) {
        alert("Password must contain at least 8 characters.");
        return;
    }

    const accounts = getAccounts();

    const alreadyExists = accounts.some(account =>
        account.astronautId.toLowerCase() === astronautId.toLowerCase() ||
        account.email === email
    );

    if (alreadyExists) {
        alert("Astronaut ID or Email already exists!");
        return;
    }

    const newAccount = {
        fullName: fullName,
        astronautId: astronautId,
        email: email,
        password: password
    };

    accounts.push(newAccount);

    localStorage.setItem("astronautAccounts", JSON.stringify(accounts));

    alert("Account created successfully! Welcome to Astronaut Academy 🚀");

    document.getElementById("signupForm").reset();

    signupSection.classList.add("hidden");
    loginSection.classList.remove("hidden");

    document.getElementById("loginId").value = astronautId;
});

// Login functionality
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const loginId = document.getElementById("loginId").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    const accounts = getAccounts();

    const user = accounts.find(account =>
        (account.astronautId.toLowerCase() === loginId ||
         account.email === loginId) &&
        account.password === password
    );

    if (!user) {
        alert("Invalid Astronaut ID, Email or Password!");
        return;
    }

    showDashboard(user);

    document.getElementById("loginForm").reset();
});

// Show dashboard
function showDashboard(user) {
    loginSection.classList.add("hidden");
    signupSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");

    document.getElementById("dashboardWelcome").textContent =
        "Welcome, " + user.fullName + "!";

    document.getElementById("displayName").textContent = user.fullName;
    document.getElementById("displayId").textContent = user.astronautId;
    document.getElementById("displayEmail").textContent = user.email;
}

// Forgot password demo
document.getElementById("forgotBtn").addEventListener("click", () => {
    const email = prompt("Enter your registered email address:");

    if (!email) return;

    const accounts = getAccounts();

    const user = accounts.find(account =>
        account.email === email.trim().toLowerCase()
    );

    if (user) {
        alert("Account found! For this demo, contact the site administrator to reset your password.");
    } else {
        alert("No account found with this email address.");
    }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    dashboardSection.classList.add("hidden");
    loginSection.classList.remove("hidden");

    alert("You have logged out successfully. 🚀");
});
=======
// Get all website sections
const loginSection = document.getElementById("loginSection");
const signupSection = document.getElementById("signupSection");
const dashboardSection = document.getElementById("dashboardSection");

// Switch between login and signup
document.getElementById("showSignup").addEventListener("click", () => {
    loginSection.classList.add("hidden");
    signupSection.classList.remove("hidden");
});

document.getElementById("showLogin").addEventListener("click", () => {
    signupSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
});

// Show or hide passwords
document.querySelectorAll(".show-btn").forEach(button => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.target);

        if (input.type === "password") {
            input.type = "text";
            button.textContent = "Hide";
        } else {
            input.type = "password";
            button.textContent = "Show";
        }
    });
});

// Get saved demo accounts
function getAccounts() {
    return JSON.parse(localStorage.getItem("astronautAccounts") || "[]");
}

// Create a new account
document.getElementById("signupForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const astronautId = document.getElementById("newAstronautId").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    if (password.length < 8) {
        alert("Password must contain at least 8 characters.");
        return;
    }

    const accounts = getAccounts();

    const alreadyExists = accounts.some(account =>
        account.astronautId.toLowerCase() === astronautId.toLowerCase() ||
        account.email === email
    );

    if (alreadyExists) {
        alert("Astronaut ID or Email already exists!");
        return;
    }

    const newAccount = {
        fullName: fullName,
        astronautId: astronautId,
        email: email,
        password: password
    };

    accounts.push(newAccount);

    localStorage.setItem("astronautAccounts", JSON.stringify(accounts));

    alert("Account created successfully! Welcome to Astronaut Academy 🚀");

    document.getElementById("signupForm").reset();

    signupSection.classList.add("hidden");
    loginSection.classList.remove("hidden");

    document.getElementById("loginId").value = astronautId;
});

// Login functionality
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const loginId = document.getElementById("loginId").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    const accounts = getAccounts();

    const user = accounts.find(account =>
        (account.astronautId.toLowerCase() === loginId ||
         account.email === loginId) &&
        account.password === password
    );

    if (!user) {
        alert("Invalid Astronaut ID, Email or Password!");
        return;
    }

    showDashboard(user);

    document.getElementById("loginForm").reset();
});

// Show dashboard
function showDashboard(user) {
    loginSection.classList.add("hidden");
    signupSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");

    document.getElementById("dashboardWelcome").textContent =
        "Welcome, " + user.fullName + "!";

    document.getElementById("displayName").textContent = user.fullName;
    document.getElementById("displayId").textContent = user.astronautId;
    document.getElementById("displayEmail").textContent = user.email;
}

// Forgot password demo
document.getElementById("forgotBtn").addEventListener("click", () => {
    const email = prompt("Enter your registered email address:");

    if (!email) return;

    const accounts = getAccounts();

    const user = accounts.find(account =>
        account.email === email.trim().toLowerCase()
    );

    if (user) {
        alert("Account found! For this demo, contact the site administrator to reset your password.");
    } else {
        alert("No account found with this email address.");
    }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    dashboardSection.classList.add("hidden");
    loginSection.classList.remove("hidden");

    alert("You have logged out successfully. 🚀");
});
>>>>>>> af2a90feca8998b033e0eabda6125ea13d592ca5

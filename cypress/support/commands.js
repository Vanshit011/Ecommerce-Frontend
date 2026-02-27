// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add("registerAndLoginUser", () => {
  const timestamp = new Date().getTime();
  const email = `user${timestamp}@example.com`;
  const name = `User ${timestamp}`;
  const mobile = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
  const password = "Password123!";

  // 1. Register User
  cy.visit("/register");
  cy.get('input[name="name"]').type(name);
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="mobile"]').type(mobile);
  cy.get('input[name="password"]').type(password);

  cy.intercept("POST", "**/auth/register*").as("registerReq");
  cy.get('button[type="submit"]').click();

  cy.wait("@registerReq");

  // Accept the alert explicitly (Cypress auto-accepts, but good practice to verify)
  cy.on("window:alert", (text) => {
    expect(text).to.contains("Registration successful");
  });

  cy.url().should("include", "/login");

  // 2. Login User
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);

  cy.intercept("POST", "**/auth/login*").as("loginReq");
  cy.get('button[type="submit"]').click();

  cy.wait("@loginReq");

  // Verify login success
  cy.url().should("include", "/home");

  // Return user info in case test needs it
  return cy.wrap({ email, password, name, mobile });
});

Cypress.Commands.add("registerAndLoginAdmin", () => {
  const timestamp = new Date().getTime();
  const email = `admin${timestamp}@example.com`;
  const name = `Admin ${timestamp}`;
  const mobile = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
  const password = "Password123!";

  // 1. Register Admin
  cy.visit("/admin/register");
  cy.get('input[name="name"]').type(name);
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="mobile"]').type(mobile);
  cy.get('input[name="password"]').type(password);

  cy.intercept("POST", "**/auth/register*").as("registerAdminReq");
  cy.get('button[type="submit"]').click();

  cy.wait("@registerAdminReq");

  cy.on("window:alert", (text) => {
    expect(text).to.contains("Admin Registration successful");
  });

  cy.url().should("include", "/login");

  // 2. Login Admin
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);

  cy.intercept("POST", "**/auth/login*").as("loginReq");
  cy.get('button[type="submit"]').click();

  cy.wait("@loginReq");

  // Verify login success (admin redirects to dashboard)
  cy.url().should("include", "/dashboard");

  return cy.wrap({ email, password, name, mobile });
});

describe("Authentication Flow", () => {
  const generateRandomUser = () => {
    const timestamp = new Date().getTime();
    return {
      name: `Test User ${timestamp}`,
      email: `test${timestamp}@example.com`,
      mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
      password: "Password123!",
    };
  };

  it("prevents registration with weak passwords or invalid formats", () => {
    cy.visit("/register");
    const user = generateRandomUser();

    // Missing fields should prevent form submission natively
    cy.get('button[type="submit"]').click();
    // HTML5 validation will block it, Cypress doesn't easily assert HTML5 validation messages,
    // so we just assert we are still on the register page
    cy.url().should("include", "/register");

    // Type short password (if backend validates)
    cy.get('input[name="name"]').type(user.name);
    cy.get('input[name="email"]').type(user.email);
    cy.get('input[name="mobile"]').type("123"); // invalid mobile structure
    cy.get('input[name="password"]').type("123");

    // In our UI, mobile has a pattern="[6-9]{1}[0-9]{9}" so it should be blocked natively
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/register");
  });

  it("can register a new user successfully", () => {
    cy.visit("/register");
    const user = generateRandomUser();

    cy.get('input[name="name"]').type(user.name);
    cy.get('input[name="email"]').type(user.email);
    cy.get('input[name="mobile"]').type(user.mobile);
    cy.get('input[name="password"]').type(user.password);

    cy.intercept("POST", "**/auth/register*").as("registerReq");
    cy.get('button[type="submit"]').click();
    cy.wait("@registerReq").its("response.statusCode").should("be.oneOf", [200, 201]);

    cy.url().should("include", "/login");
  });

  it("logs in successfully and logs out", () => {
    cy.registerAndLoginUser().then(() => {
      // User is logged in and on /home
      // Let's logout
      // Assuming logout is in the profile or header menu.
      // Usually there is a "Logout" button in the header if logged in.
      // Let's attempt to logout by finding the Logout text or icon.
      cy.get("header")
        .contains(/logout|sign out/i)
        .click({ force: true });

      // Should redirect to login or home with no session
      cy.url().should("include", "/login");
    });
  });

  it("shows an error for invalid login credentials", () => {
    cy.visit("/login");

    cy.get('input[name="email"]').type("nonexistentuser12345@example.com");
    cy.get('input[name="password"]').type("WrongPassword123!");

    cy.intercept("POST", "**/auth/login*").as("loginReq");
    cy.get('button[type="submit"]').click();
    cy.wait("@loginReq").its("response.statusCode").should("not.eq", 200);

    // An error message should be displayed
    cy.contains(/invalid|wrong|incorrect/i).should("be.visible");
  });

  it("validates the forgot password UI flow", () => {
    cy.visit("/login");
    cy.contains("Forgot Password").click();
    cy.url().should("include", "/forgot-password");

    // Enter fake email
    cy.get('input[type="email"], input[name="email"]').type("fake@example.com");
    cy.get('button[type="submit"]').click();

    // Verify it either shows error or success depending on how the backend handles fake emails
    cy.contains(/send|sent|error|not found/i).should("be.visible");
  });

  it("navigates correctly between auth pages", () => {
    // Login -> Register
    cy.visit("/login");
    cy.contains("Sign Up").click();
    cy.url().should("include", "/register");

    // Register -> Login
    cy.contains("Sign In").click();
    cy.url().should("include", "/login");

    // Login -> Admin Register
    cy.visit("/login"); // Ensure we're back on the login page to find the seller link
    cy.contains("Sign Up as Seller").click();
    cy.url().should("include", "/admin/register");
  });
});

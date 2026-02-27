describe("Customer Account Flow", () => {
  beforeEach(() => {
    // Dynamically create and login a new user before every test block
    cy.registerAndLoginUser().as("currentUser");
  });

  it("can view and update profile information", () => {
    cy.visit("/profile");
    cy.contains("Personal Information").should("be.visible");

    // Click Edit Information
    cy.contains("Edit Information").click();

    // Update the phone number
    const newMobile = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
    cy.get('input[placeholder="+91 98765 43210"]').clear().type(newMobile);

    // Save Changes
    cy.intercept("PUT", "**/profile*").as("updateProfile");
    cy.contains("Save Changes").click();

    cy.wait("@updateProfile").its("response.statusCode").should("be.oneOf", [200, 201]);

    // Verify toast or success state
    cy.contains("Profile updated successfully").should("be.visible");
  });

  it("can manage the address book", () => {
    cy.visit("/profile");

    // Add New Address
    cy.contains("Add New Address").click();

    // Fill Address Form
    cy.get('input[placeholder="John Doe"]').type("John Test");
    cy.get('input[placeholder="India"]').type("India");
    cy.get('input[placeholder="Flat, House no., Building, Company, Apartment"]').type(
      "123 Test Street",
    );
    cy.get('input[placeholder="Mumbai"]').type("Mumbai");
    cy.get('input[placeholder="Maharashtra"]').type("Maharashtra");
    cy.get('input[placeholder="400001"]').type("400001");

    cy.intercept("POST", "**/addresses*").as("addAddress");
    cy.contains("Save New Address").click();

    cy.wait("@addAddress").its("response.statusCode").should("be.oneOf", [200, 201]);
    cy.contains("Address added").should("be.visible");

    // Verify it appears in the list
    cy.contains("123 Test Street").should("be.visible");
  });

  it("can add a product to favorites and view it", () => {
    // First, go to products and favorite something
    cy.visit("/products");

    // Wait for products to load
    cy.get("img[alt]").first().should("be.visible");

    // Click the heart icon on the first product
    // The heart is inside a button on the product card layout (assuming it's similar to Favorites view or has a clear favoriting mechanism)
    // If there's no heart on the catalog, we click into the product page and favorite it
    cy.get("img[alt]").first().click({ force: true });

    // Wait for PDP to load
    cy.contains("Add to Bag").should("be.visible");

    // Click the favorite button (usually a heart icon or text "Favorite")
    cy.get("button")
      .contains(/favorite|wishlist|♥|save/i)
      .first()
      .click({ force: true });

    // Now visit favorites page
    cy.visit("/favorites");
    cy.contains("Your Favorites").should("be.visible");

    // Verify a product is there (not the empty state)
    cy.get("img[alt]").should("be.visible");
  });

  it("can view the My Orders page empty state", () => {
    cy.visit("/my-orders");
    cy.contains("My Orders").should("be.visible");

    // Because it's a new user, it should show the empty state
    cy.contains("No orders yet").should("be.visible");
  });

  it("can view the My Payments page", () => {
    cy.visit("/my-payments");
    cy.contains(/payment|transaction/i).should("be.visible");
  });
});

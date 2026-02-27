describe("Customer Checkout Flow", () => {
  beforeEach(() => {
    // 1. Create a fresh user session
    cy.registerAndLoginUser().as("currentUser");
  });

  it("can add items to cart, update quantities, and proceed to checkout", () => {
    // 2. Add an Address first so checkout doesn't get blocked
    cy.visit("/profile");
    cy.contains("Add New Address").click();
    cy.get('input[placeholder="John Doe"]').type("Checkout Tester");
    cy.get('input[placeholder="India"]').type("India");
    cy.get('input[placeholder="Flat, House no., Building, Company, Apartment"]').type(
      "123 Checkout St",
    );
    cy.get('input[placeholder="Mumbai"]').type("Mumbai");
    cy.get('input[placeholder="Maharashtra"]').type("Maharashtra");
    cy.get('input[placeholder="400001"]').type("400000");
    cy.intercept("POST", "**/addresses*").as("addAddress");
    cy.contains("Save New Address").click();
    cy.wait("@addAddress");

    // 3. Go to products and add to cart
    cy.visit("/products");

    // Assuming product card click navigates to PDP
    cy.contains("Featured Products").scrollIntoView();
    cy.contains("span", "Details").first().click({ force: true });

    // Wait for PDP and Add to Bag button
    cy.contains("button", "Add to Bag").should("be.visible").click();

    // The button might show "Adding..." so we wait for the toast
    cy.contains("Product added to cart", { timeout: 10000 }).should("exist");

    // Click cart icon in header
    cy.get("header").contains("Cart").click();

    // 4. Cart interactions
    cy.contains("Shopping Bag").should("be.visible");

    // Verify the added product is visible
    cy.get("img[alt]").should("be.visible");
    cy.contains("Order Summary").should("be.visible");

    // Increase quantity (button with '+')
    cy.intercept("PUT", "**/cart/item/*").as("updateQty");
    cy.contains("button", "+").click();
    cy.wait("@updateQty");

    // Select the address we just created before checking out
    cy.contains("Delivery Address").scrollIntoView();
    cy.contains("123 Checkout St").parent("label").click();

    // 5. Proceed to Checkout
    cy.intercept("POST", "**/orders*").as("createOrder");
    cy.contains("button", "Checkout Now").click();
    cy.wait("@createOrder");

    // Should redirect to /checkout/:id
    cy.url().should("include", "/checkout/");

    // 6. Verify Checkout Page loads (Stripe integration)
    cy.contains("Secure Checkout").should("be.visible");
    cy.contains("Order Total").should("be.visible");
    cy.contains(/Pay ₹/i).should("be.visible");
  });
});

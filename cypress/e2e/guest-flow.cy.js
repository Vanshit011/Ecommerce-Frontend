describe("E-Commerce Homepage", () => {
  it("successfully loads the homepage", () => {
    cy.visit("http://localhost:5173/");
    cy.url().should("include", "/home");
    cy.get("header").should("be.visible");
  });

  it("can type into the search bar", () => {
    cy.visit("http://localhost:5173/");

    // Find the search input, type something, and press Enter
    cy.get('input[placeholder="Search for products, brands and more"]').type("iphone 12{enter}");

    // Verify that the URL changed to the products search page
    // Using just "iphone" or the exact encoded string depending on how your router encodes it
    cy.url().should("include", "search=iphone");
  });

  it("can navigate to product categories", () => {
    cy.visit("http://localhost:5173/");

    // Let's click on the "Shop" link in the navigation
    cy.contains("a", "Shop").click();

    // Verify the URL changes to /products
    cy.url().should("include", "/products");

    // Let's check if the products page loaded successfully by looking for the sidebar title
    cy.contains("All Categories").should("be.visible");
  });

  it("can open product details from the homepage", () => {
    cy.visit("http://localhost:5173/home");

    // Wait for featured products to load
    cy.contains("Featured Products").should("be.visible");

    // Click on the 'Details' link of the first product card instead of a generic img tag
    // since the first img is the Flash Sale banner.
    cy.contains("Featured Products").scrollIntoView();
    cy.contains("span", "Details").first().click({ force: true });

    // Verify some generic elements on the product details page
    cy.contains("Add to Bag").should("be.visible");
  });

  it("can filter and sort products on the products page", () => {
    cy.visit("http://localhost:5173/products");

    // Wait for the page to load
    cy.contains("All Categories").should("be.visible");
    cy.contains("Price Range").should("be.visible");

    // 1. Test Category Selection
    // Wait for categories to load by ensuring at least one checkbox exists and is visible
    cy.get('input[type="checkbox"]').should("have.length.greaterThan", 0);
    // Click the label instead of the checkbox directly to ensure React's onChange fires correctly
    cy.get('input[type="checkbox"]').first().parent("label").click();

    // 2. Test Price Slider / Inputs
    // The frontend debounces the price but doesn't store maxPrice in the URL
    // So we just clear the max price to 5000 and wait for the loading skeleton
    cy.get('input[type="number"]').last().clear().type("5000");

    // Wait for debounce and skeleton to appear OR products to reload
    cy.wait(500);

    // 3. Test Sorting
    // Change the sort dropdown to Price High to Low
    cy.get("select").first().select("price_desc");

    // The URL should update with sort=price_desc
    cy.url().should("include", "sort=price_desc");

    // 4. Test Rows per Page (if pagination exists)
    // Only attempt to change row per page if the selector exists (it might not exist if < 9 products total)
    cy.get("body").then(($body) => {
      // The second select is the limit (Rows per page) if it exists
      if ($body.find("select").length > 1) {
        cy.get("select").last().select("24");
        cy.url().should("include", "limit=24");
      }
    });

    // 5. Test Reset Filters
    cy.contains("button", "Reset Filters").click();

    // URL should be back to base products route without params
    cy.url().should("not.include", "sort=price_desc");
    cy.url().should("not.include", "limit=24");
  });

  it("navigates correctly from header auth links", () => {
    cy.visit("http://localhost:5173/");

    // Check "Become a Seller" link
    cy.contains("a", "Become a Seller").click();
    cy.url().should("include", "/login");

    cy.visit("http://localhost:5173/");

    // Check "Login" button
    cy.contains("button", "Login").click();
    cy.url().should("include", "/login");
  });

  const protectedRoutes = [
    "/profile",
    "/cart",
    "/favorites",
    "/checkout/123",
    "/my-orders",
    "/my-payments",
  ];

  protectedRoutes.forEach((route) => {
    it(`redirects protected route ${route} to login`, () => {
      cy.clearLocalStorage();
      cy.visit(`http://localhost:5173${route}`);
      // ProtectedRoutes component redirects to /login
      cy.url().should("include", "/login");
    });
  });
});

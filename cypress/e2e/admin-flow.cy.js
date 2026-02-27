describe("Admin Management Flow", () => {
  beforeEach(() => {
    // Dynamically create and login a new admin before every test block
    cy.registerAndLoginAdmin().as("currentAdmin");
  });

  it("can view the admin dashboard overview", () => {
    cy.visit("/dashboard");
    cy.contains("Dashboard Overview").should("be.visible");
    cy.contains("Total Revenue").should("be.visible");
    cy.contains("Orders").should("be.visible");
    cy.contains("Top Category").should("be.visible");
    cy.get(".recharts-responsive-container").should("exist");
  });

  it("can manage categories", () => {
    cy.visit("/dashboard/categories");
    cy.contains("Product Categories").should("be.visible");

    // Add Category
    cy.contains("Create New Category").click();

    const catName = `Test Category ${Date.now()}`;
    cy.get('input[placeholder="e.g. Electronics, Clothing..."]').type(catName);

    cy.intercept("POST", "**/categories*").as("addCategory");
    cy.get("button").contains("Save Category").click();
    cy.wait("@addCategory");

    // Check if added
    cy.contains(catName).should("be.visible");

    // Edit Category
    cy.contains(catName).parents("tr").find("button").contains("Actions").click();
    cy.contains(catName).parents("tr").find("button").contains("Edit Category").click();

    const updatedName = `${catName} Updated`;
    cy.get('input[placeholder="e.g. Electronics, Clothing..."]').clear().type(updatedName);

    cy.intercept("PUT", "**/categories/*").as("updateCategory");
    cy.get("button").contains("Save Category").click();
    cy.wait("@updateCategory");

    cy.contains(updatedName).should("be.visible");

    // Delete Category
    cy.contains(updatedName).parents("tr").find("button").contains("Actions").click();

    cy.intercept("DELETE", "**/categories/*").as("deleteCategory");
    cy.contains(updatedName).parents("tr").find("button").contains("Delete").click();

    cy.on("window:confirm", () => true);
    cy.wait("@deleteCategory");
    cy.contains(updatedName).should("not.exist");
  });

  it("can manage products", () => {
    cy.visit("/dashboard/products");
    cy.contains("Inventory").should("be.visible");

    // Add Product
    cy.contains("Add Product").click();

    const productName = `Test Product ${Date.now()}`;
    cy.get('input[name="name"]').type(productName);
    cy.get('textarea[name="description"]').type("A great test product description.");
    cy.get('input[name="brand"]').type("TestBrand");
    cy.get('input[name="sku"]').type(`SKU-${Date.now()}`);

    // Add Variant Info
    cy.get('input[placeholder="Color (e.g., Red, Blue)"]').type("Blue");
    cy.get('input[placeholder="Size (e.g., M, L, XL)"]').type("M");
    cy.get('input[placeholder="Price"]').type("299");
    cy.get('input[placeholder="Stock"]').type("50");

    cy.intercept("POST", "**/products*").as("addProduct");
    cy.get("button").contains("Save Product").click();

    // We might have a category requirement or image requirement, assuming basic validation passes
    // If it fails due to category required, we would need to mock categories or select one.
    // For this test we assume it passes or we can just check if the modal tries to submit.
    cy.wait("@addProduct").its("response.statusCode").should("be.oneOf", [200, 201]);

    // Check if added
    cy.contains(productName).should("be.visible");

    // Delete Product via table row Actions
    cy.contains(productName).parents("tr").find("button").contains("Actions").click();

    cy.intercept("DELETE", "**/products/*").as("deleteProduct");
    cy.contains(productName).parents("tr").find("button").contains("Delete").click();

    cy.on("window:confirm", () => true);
    cy.wait("@deleteProduct");
    cy.contains(productName).should("not.exist");
  });

  it("can view orders and customers", () => {
    cy.visit("/dashboard/orders");
    cy.contains(/Orders|Transactions/i).should("be.visible");

    cy.visit("/dashboard/customers");
    cy.contains(/Customers|Users/i).should("be.visible");
  });
});

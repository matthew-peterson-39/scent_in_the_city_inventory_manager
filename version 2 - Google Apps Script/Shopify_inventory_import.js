function generateShopifyImport() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
  
    // Copy the 'Inventory_export' sheet
    const inventoryExport = ss.getSheetByName("Inventory_export");
    let shopifyInventoryImport = ss.getSheetByName("Shopify_inventory_import");
    if (shopifyInventoryImport) {
      ss.deleteSheet(shopifyInventoryImport); // Delete if it already exists
    }
    shopifyInventoryImport = inventoryExport.copyTo(ss).setName("Shopify_inventory_import");
  
    // Create SKU to Barcode mapping from 'Product_export'
    const productExport = ss.getSheetByName("Product_export");
    const productData = productExport.getDataRange().getValues();
    let skuToBarcode = {};
    productData.forEach(row => {
      const sku = row[14]; // Column 'O'
      const barcode = row[23]; // Column 'X'
      skuToBarcode[sku] = barcode;
    });
  
    // Update quantities in 'Shopify_inventory_import'
    const updatedInventory = ss.getSheetByName("Updated_inventory");
    const updatedData = updatedInventory.getDataRange().getValues();
    let barcodeToNewQuantity = {};
    updatedData.forEach(row => {
      const barcode = row[0]; // Column 'A'
      const quantity = row[3]; // Replace with the correct column index for quantity
      barcodeToNewQuantity[barcode] = quantity;
    });
  
    const shopifyData = shopifyInventoryImport.getDataRange().getValues();
    shopifyData.forEach((row, index) => {
      if (index === 0) return; // Skip header row
      const sku = row[8]; // Column 'I'
      const location = row[11]; // Column 'L'
      if (location !== 'Bosem Brigade LLC') return; // Skip if the location is not 'Bosem Brigade'
  
      const barcode = skuToBarcode[sku];
      if (barcode && barcodeToNewQuantity[barcode] !== undefined) {
        shopifyInventoryImport.getRange(index + 1, 16).setValue(barcodeToNewQuantity[barcode]); // Column 'P'
      }
    }
    );
  }
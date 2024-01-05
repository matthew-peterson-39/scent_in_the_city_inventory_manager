function updateImportQuantity() {
    let ss = SpreadsheetApp.getActiveSpreadsheet();
    let leeSheet = ss.getSheetByName('Lee_inventory');
    let supplierSheet = ss.getSheetByName('Supplier_inventory');
    let updatedInventorySheet = ss.getSheetByName('Updated_inventory');
  
    // If 'Updated_inventory' sheet exists, clear it, otherwise create it
    if (updatedInventorySheet !== null) {
      updatedInventorySheet.clear();
    } else {
      updatedInventorySheet = ss.insertSheet('Updated_inventory');
    }
  
    // Copy data from 'Lee_inventory' to 'Updated_inventory'
    let leeRange = leeSheet.getRange(2, 1, leeSheet.getLastRow() - 1, 5);
    let leeValues = leeRange.getValues();
    updatedInventorySheet.getRange(2, 1, leeValues.length, leeValues[0].length).setValues(leeValues);
  
    // Fetch data from 'Supplier_inventory'
    let supplierRange = supplierSheet.getRange(2, 1, supplierSheet.getLastRow() - 1, 5);
    let supplierValues = supplierRange.getValues();
  
    // Filter unique items and update their quantities
    let leeProductCodes = new Set(leeValues.map(function(row) { return row[0]; }));
    let uniqueSupplierItems = supplierValues.filter(function(row) { return !leeProductCodes.has(row[0]); });
    let updatedItems = uniqueSupplierItems.map(function(item) {
      let originalQty = parseInt(item[3]);
      let newQty = updateQuantity(originalQty);
      return item.slice(0, 3).concat([newQty, originalQty]);
    });
  
    // Append updated items to 'Updated_inventory'
    if (updatedItems.length > 0) {
      updatedInventorySheet.getRange(leeValues.length + 2, 1, updatedItems.length, updatedItems[0].length).setValues(updatedItems);
    }
  
    // Check if there are rows to format in 'Updated_inventory'
    let lastRow = updatedInventorySheet.getLastRow();
    if (lastRow > 1) {
      // Format column C (3rd column) as US currency
      let currencyRange = updatedInventorySheet.getRange(2, 3, lastRow - 1);
      currencyRange.setNumberFormat("$#,##0.00");
    }
  }
  
  function updateQuantity(qty) {
    if (qty >= 600) {
      return 8;
    } else if (qty >= 400) {
      return 4;
    } else if (qty >= 200) {
      return 3;
    } else if (qty >= 100) {
      return 2;
    } else if (qty >= 60) {
      return 1;
    } else {
      return 0;
    }
  }
  
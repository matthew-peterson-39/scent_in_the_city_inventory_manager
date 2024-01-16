function adjustInventory() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const leeSheet = ss.getSheetByName('Lee_inventory');
    const inventorySheet = ss.getSheetByName('Inventory_export');
    const productSheet = ss.getSheetByName('Product_export');
  
    // Get values from SKU to UPC mapping sheet
    const skuUpcRange = productSheet.getRange('O2:X' + productSheet.getLastRow()).getValues();
    const skuToUpc = {};
    skuUpcRange.forEach(row => skuToUpc[row[0]] = row[9]); // Assuming SKU is in column O and UPC in column X
    
    // Get inventory and commit quantities
    const leeData = leeSheet.getRange('A2:D' + leeSheet.getLastRow()).getValues();
    const commitData = inventorySheet.getRange('I2:O' + inventorySheet.getLastRow()).getValues();
  
    // Create an array to hold the adjusted quantities
    const adjustedQuantities = [];
  
    // Calculate adjusted quantities
    leeData.forEach((invRow) => {
      const upc = invRow[0]; // Assuming UPC is in column A
      let totalCommit = 0;
      commitData.forEach(commitRow => {
        const sku = commitRow[0]; // Assuming SKU is in column I
        if (skuToUpc[sku] === upc) {
          if (commitRow[6] != "not stocked" && !isNaN(commitRow[6])) {
            totalCommit += parseFloat(commitRow[6]); // Aggregate commit quantity
          }
        }
      });
      const adjustedQty = parseFloat(invRow[3]) - totalCommit; // Calculate adjusted qty
      adjustedQuantities.push([adjustedQty]);
  
      // Detailed logging for debugging
      Logger.log('UPC: ' + upc + ', Lee Qty: ' + invRow[3] + ', Total Commit: ' + totalCommit + ', Adjusted Qty: ' + adjustedQty);
  
      if (adjustedQty <= 0) {
        Logger.log('WARNING - Low or Negative Quantity: UPC: ' + upc + ', Total Commit: ' + totalCommit + ', Lee Qty: ' + invRow[3] + ', Adjusted Qty: ' + adjustedQty);
      }
    });
  
    // Write the adjusted quantities to overwrite column (D)
    leeSheet.insertColumns(5, 1); // Insert 1 new column after column 4 (D)
    const rangeToSet = leeSheet.getRange(2, 4, adjustedQuantities.length, 1);
    rangeToSet.setValues(adjustedQuantities);
    rangeToSet.setNumberFormat("0"); // Whole number format
  }
  
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
    // I = sku, O = commited ... P = Available, Q = On-Hand
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
          if (commitRow[6] != "not stocked") {
            totalCommit = commitRow[6]; // Assuming commit quantity is in column O
          }
        }
      });
      const adjustedQty = invRow[3] - totalCommit; // Calculate adjusted qty
      adjustedQuantities.push([adjustedQty]);
      if (adjustedQty <= 0) {
        Logger.log('UPC: ' + upc + '\n Total Commit: ' + totalCommit + '\n Lee Qty: ' + invRow[3] + '\n Adjusted Qty: ' + adjustedQty);
      }
    });
    // Write the adjusted quantities to a new column (E)
    leeSheet.insertColumns(5, 1); // Insert 1 new column after column 4 (D)
    const rangeToSet = leeSheet.getRange(2, 5, adjustedQuantities.length, 1);
    rangeToSet.setValues(adjustedQuantities);
    rangeToSet.setNumberFormat("0"); // Whole number format
}
  
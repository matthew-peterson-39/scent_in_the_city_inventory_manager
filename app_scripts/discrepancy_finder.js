function identifyDiscrepancies() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const updatedInventorySheet = ss.getSheetByName('Updated_inventory');
    const discrepanciesSheet = ss.getSheetByName('Discrepancies');
  
    // Create the 'Discrepancies' sheet if it doesn't exist, or clear it if it does
    if (discrepanciesSheet !== null) {
      discrepanciesSheet.clear();
    } else {
      discrepanciesSheet = ss.insertSheet('Discrepancies');
    }
  
    // Get data from 'Updated_inventory'
    const dataRange = updatedInventorySheet.getDataRange();
    const dataValues = dataRange.getValues();
  
    // Find rows with missing data
    const discrepancies = dataValues.filter(row => row.some(cell => cell === ''));
  
    // Copy discrepancies to the 'Discrepancies' sheet
    if (discrepancies.length > 0) {
      discrepanciesSheet.getRange(2, 1, discrepancies.length, discrepancies[0].length).setValues(discrepancies);
    }
    applyConditionalFormatting(discrepanciesSheet);
  }
  
  function applyConditionalFormatting(discrepanciesSheet) {
    // Define headers for the 'Discrepancies' sheet
    const headers = ['UPC', 'NAME', 'COST', 'UPDATED_QTY', 'ORIGINAL_QTY'];
  
    // Set headers in the first row
    discrepanciesSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
    const numColumns = discrepanciesSheet.getLastColumn();
    const colors = ['#FFC7CE', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#CFE2F3', '#D9D2E9', '#EAD1DC'];
  
    // Apply conditional formatting and auto-resize columns
    for (let i = 1; i <= numColumns; i++) {
      // Conditional formatting rule
      const rule = SpreadsheetApp.newConditionalFormatRule()
        .whenCellEmpty()
        .setBackground(colors[(i - 1) % colors.length])
        .setRanges([discrepanciesSheet.getRange(2, i, discrepanciesSheet.getMaxRows(), 1)])
        .build();
  
      const rules = discrepanciesSheet.getConditionalFormatRules();
      rules.push(rule);
      discrepanciesSheet.setConditionalFormatRules(rules);
  
      // Auto-resize column for content fit
      discrepanciesSheet.autoResizeColumn(i);
    }
  
    // Format Column C (COST) as US currency
    const lastRow = discrepanciesSheet.getLastRow();
    if (lastRow > 1) {
      const currencyRange = discrepanciesSheet.getRange(2, 3, lastRow - 1);
      currencyRange.setNumberFormat("$#,##0.00");
    }
  }
  
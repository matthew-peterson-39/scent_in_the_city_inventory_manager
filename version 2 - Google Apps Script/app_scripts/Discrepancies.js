function identifyDiscrepancies() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let updatedInventorySheet = ss.getSheetByName('Updated_inventory');
  let discrepanciesSheet = ss.getSheetByName('Discrepancies');

  // Create the 'Discrepancies' sheet if it doesn't exist, or clear it if it does
  if (discrepanciesSheet !== null) {
    discrepanciesSheet.clear();
  } else {
    discrepanciesSheet = ss.insertSheet('Discrepancies');
  }

  // Get data from 'Updated_inventory'
  let dataRange = updatedInventorySheet.getDataRange();
  let dataValues = dataRange.getValues();

  // Find rows with missing data
  let discrepancies = dataValues.filter(function(row) {
    return row.some(function(cell) { return cell === ''; }); // Check if any cell in the row is empty
  });

  // Copy discrepancies to the 'Discrepancies' sheet
  if (discrepancies.length > 0) {
    discrepanciesSheet.getRange(2, 1, discrepancies.length, discrepancies[0].length).setValues(discrepancies);
  }
    applyConditionalFormatting(discrepanciesSheet);
}

function applyConditionalFormatting(discrepanciesSheet) {
  // Define headers for the 'Discrepancies' sheet
  let headers = ['UPC', 'NAME', 'COST', 'UPDATED_QTY', 'ORIGINAL_QTY'];

  // Set headers in the first row
  discrepanciesSheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  let numColumns = discrepanciesSheet.getLastColumn();
  let colors = ['#FFC7CE', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#CFE2F3', '#D9D2E9', '#EAD1DC'];
  
  // Apply conditional formatting and auto-resize columns
  for (let i = 1; i <= numColumns; i++) {
    // Conditional formatting rule
    let rule = SpreadsheetApp.newConditionalFormatRule()
      .whenCellEmpty()
      .setBackground(colors[(i - 1) % colors.length])
      .setRanges([discrepanciesSheet.getRange(2, i, discrepanciesSheet.getMaxRows(), 1)])
      .build();

    let rules = discrepanciesSheet.getConditionalFormatRules();
    rules.push(rule);
    discrepanciesSheet.setConditionalFormatRules(rules);

    // Auto-resize column for content fit
    discrepanciesSheet.autoResizeColumn(i);
  }

  // Format Column C (COST) as US currency
  let lastRow = discrepanciesSheet.getLastRow();
  if (lastRow > 1) {
    let currencyRange = discrepanciesSheet.getRange(2, 3, lastRow - 1);
    currencyRange.setNumberFormat("$#,##0.00");
  }
}


# Problem Statement:
>Small business is experiencing back-order issues due to inventory management practices. Ontop of the backorder issues, the business wastes many hours manually updating inventory for their e-commerce store.

>The merchant recieves an updated inventory (excel sheet) from supplier periodically throughout the month. The merchant keeps a local inventory of the biggest sellers. For other scents that are not as frequently sold, he purchases-to-order. However, the supplier does business with other companies as well, and the inconsistent supplier inventory updates led to back-orders. (IE: Supplier has a stock of 100. The merchant store can make orders against this number, but that number is also being manipulated by other businesses.) 
        
```START
For example:
    The supplier has 100 of a product
    -------------------------
    My client store buys 30
    Supplier's other merchants buys 90 
    -------------------------
    120 of a product are purchased though only 100 are in stock.

    Result: 20 backordered products. 
```

# Client Asks (features):
1. A combined sheet of his inventory and UNIQUE supplier inv. AFTER qty adjustment
    - Provide visual before/after of the qty changes for peace of mind

2. Wants data of the items with 0 qty and does not exist anymore on supplier/merchant sheet
    - (Filter out the products that still exist on the store but cannot be pruchased from supplier anymore)
    
3. Product cost for Updated_inventory
    - Extract 'Product Cost' from supplier inventory and include it in the Updated_inventory. (Helps account for changes in Supplier cost per item ie. loss of revenue)
    
4. Automate the Shopify inventory adjustment/updates

# Program Design/Planning/Thoughts:

## Work out of single csv type ie. sheets or excel
>Google Sheets - [YES]


# What are the ways of updating shopify inventory?    
### Admin REST framework - [NO]
### **Reasoning**
>Added complexity and time
            - Due to requiring access/permissions/cordinating with client on the Shopify account.
            - Required more udnerstanding of how his store was setup ie: productIds, names, etc.
            - (autho credentials... Would he need to add me as an employee? What permissions? Testing concerns)
    
## Bulk-edit via csv - [YES]
### **Reasoning**
>Simple, native to Shopify
Templates for export and import avail, giving critical insight into csv data format

# Solution:
>Provide client with an updated inventory csv saved as a new sheet in his Google Sheet document. This Updated_inventory a simple, clean and formatted version of his Shopify proucts empahsizing the change of supplier QTY to combat back-orders.

 >The quantity amount from the Updated_inventory will then be used to update the Inventory_export sheet's qty. This inventory_export sheet matches the format Shopify expects when doing bulk-edits via CSV, greatly reducing the potential for formatting errors.

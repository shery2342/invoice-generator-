document.addEventListener("DOMContentLoaded", function () {
    const invoiceForm = document.getElementById("invoiceForm");
    const addItemBtn = document.getElementById("addItem");
    const itemsTable = document.querySelector("#itemsTable tbody");
    const subtotalSpan = document.getElementById("subtotal");
    const taxSpan = document.getElementById("tax");
    const totalSpan = document.getElementById("total");
    const invoiceTableBody = document.getElementById("invoiceTableBody");

    let invoices = [];
    let invoiceCount = 1;

    // Function to add a new item row
    addItemBtn.addEventListener("click", function () {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td><input type="text" class="description" placeholder="Item Description" required></td>
            <td><input type="number" class="quantity" value="1" min="1" required></td>
            <td><input type="number" class="price" value="0" min="0" step="0.01" required></td>
            <td class="item-total">0.00</td>
            <td><button type="button" class="remove-item">Remove</button></td>
        `;

        itemsTable.appendChild(row);

        row.querySelector(".quantity").addEventListener("input", updateTotals);
        row.querySelector(".price").addEventListener("input", updateTotals);
        row.querySelector(".remove-item").addEventListener("click", function () {
            row.remove();
            updateTotals();
        });

        updateTotals();
    });

    // Function to update subtotal, tax, and total
    function updateTotals() {
        let subtotal = 0;
        document.querySelectorAll("#itemsTable tbody tr").forEach(row => {
            const quantity = parseFloat(row.querySelector(".quantity").value) || 0;
            const price = parseFloat(row.querySelector(".price").value) || 0;
            const total = quantity * price;
            row.querySelector(".item-total").textContent = total.toFixed(2);
            subtotal += total;
        });

        let tax = subtotal * 0.10; // Assuming 10% tax
        let total = subtotal + tax;

        subtotalSpan.textContent = subtotal.toFixed(2);
        taxSpan.textContent = tax.toFixed(2);
        totalSpan.textContent = total.toFixed(2);
    }

    // Handle form submission to save invoice
    invoiceForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const customerName = document.getElementById("customerName").value;
        const customerEmail = document.getElementById("customerEmail").value;
        const customerAddress = document.getElementById("customerAddress").value;
        const customerContact = document.getElementById("customerContact").value;
        const invoiceDate = document.getElementById("invoiceDate").value;
        const dueDate = document.getElementById("dueDate").value;
        const subtotal = parseFloat(subtotalSpan.textContent);
        const tax = parseFloat(taxSpan.textContent);
        const total = parseFloat(totalSpan.textContent);

        if (!customerName || !customerEmail || !customerAddress || !customerContact || !invoiceDate || !dueDate || subtotal <= 0) {
            alert("Please fill all fields and add items.");
            return;
        }

        const invoice = {
            id: invoiceCount++,
            customerName,
            customerEmail,
            customerAddress,
            customerContact,
            invoiceDate,
            dueDate,
            subtotal,
            tax,
            total
        };

        invoices.push(invoice);
        displayInvoices();
        invoiceForm.reset();
        itemsTable.innerHTML = ""; // Clear items
        subtotalSpan.textContent = "0.00";
        taxSpan.textContent = "0.00";
        totalSpan.textContent = "0.00";
    });

    // Function to display saved invoices
    function displayInvoices() {
        invoiceTableBody.innerHTML = "";
        invoices.forEach(invoice => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${invoice.id}</td>
                <td>${invoice.customerName}</td>
                <td>${invoice.invoiceDate}</td>
                <td>$${invoice.total.toFixed(2)}</td>
                <td>
                    <button type="button" class="print-invoice" data-id="${invoice.id}">Print Invoice</button>
                    <button type="button" class="delete-invoice" data-id="${invoice.id}">Delete</button>
                </td>
            `;

            invoiceTableBody.appendChild(row);
        });

        document.querySelectorAll(".delete-invoice").forEach(button => {
            button.addEventListener("click", function () {
                const id = parseInt(this.dataset.id);
                invoices = invoices.filter(inv => inv.id !== id);
                displayInvoices();
            });
        });

        document.querySelectorAll(".print-invoice").forEach(button => {
            button.addEventListener("click", function () {
                const id = parseInt(this.dataset.id);
                printInvoice(id);
            });
        });
    }

    // Function to print the invoice
    function printInvoice(invoiceId) {
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (!invoice) return;

        // Create a printable HTML template for the invoice
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice #${invoice.id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #007bff; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #007bff; color: white; }
                        .totals { margin-top: 20px; font-size: 1.2em; }
                        .customer-details { margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <h1>Invoice #${invoice.id}</h1>
                    <div class="customer-details">
                        <p><strong>Customer Name:</strong> ${invoice.customerName}</p>
                        <p><strong>Email:</strong> ${invoice.customerEmail}</p>
                        <p><strong>Address:</strong> ${invoice.customerAddress}</p>
                        <p><strong>Contact:</strong> ${invoice.customerContact}</p>
                        <p><strong>Invoice Date:</strong> ${invoice.invoiceDate}</p>
                        <p><strong>Due Date:</strong> ${invoice.dueDate}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Items will be added dynamically -->
                        </tbody>
                    </table>
                    <div class="totals">
                        <p><strong>Subtotal:</strong> $${invoice.subtotal.toFixed(2)}</p>
                        <p><strong>Tax (10%):</strong> $${invoice.tax.toFixed(2)}</p>
                        <p><strong>Total:</strong> $${invoice.total.toFixed(2)}</p>
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    }
});
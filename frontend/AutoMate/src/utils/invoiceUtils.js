/**
 * Utility functions for invoice generation and formatting
 */

/**
 * Generate HTML for invoice printing
 * @param {Object} invoice - The invoice/maintenance log object
 * @param {Object} vehicle - The associated vehicle object
 * @returns {string} - HTML string for printing
 */
export const generateInvoiceHTML = (invoice, vehicle) => {
  const invoiceDate = new Date(invoice.created_at);
  const paidDate = invoice.paid_at ? new Date(invoice.paid_at) : null;

  // Handle description that might be an object
  const description = typeof invoice.description === 'string' ? invoice.description :
    typeof invoice.description === 'object' && invoice.description?.custom_description ?
      invoice.description.custom_description : 'Maintenance Service';

  // Get services breakdown
  const services = getServicesBreakdown(invoice.description);
  const hasServices = services.length > 0;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice #${invoice.log_id}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6;
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px; 
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
          }
          .invoice-title {
            font-size: 20px;
            color: #666;
          }
          .invoice-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .invoice-details, .customer-details {
            flex: 1;
          }
          .invoice-details h3, .customer-details h3 {
            color: #3b82f6;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          .service-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
          }
          .service-table th {
            background-color: #f3f4f6;
            padding: 12px;
            text-align: left;
            border: 1px solid #d1d5db;
            font-weight: bold;
          }
          .service-table td {
            padding: 12px;
            border: 1px solid #d1d5db;
          }
          .total-section {
            text-align: right;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #3b82f6;
          }
          .total-amount {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
          }
          .status-paid {
            color: #10b981;
            font-weight: bold;
            font-size: 18px;
          }
          .status-unpaid {
            color: #f59e0b;
            font-weight: bold;
            font-size: 18px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">AutoMate Service Center</div>
          <div class="invoice-title">Service Invoice</div>
        </div>
        
        <div class="invoice-info">
          <div class="invoice-details">
            <h3>Invoice Details</h3>
            <p><strong>Invoice Number:</strong> #${invoice.log_id}</p>
            <p><strong>Service Date:</strong> ${invoiceDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}</p>
            <p><strong>Technician:</strong> ${invoice.user_name}</p>
          </div>
          
          <div class="customer-details">
            <h3>Vehicle Information</h3>
            <p><strong>Vehicle:</strong> ${vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}</p>
            <p><strong>License Plate:</strong> ${vehicle ? vehicle.plate_no : 'N/A'}</p>
            <p><strong>Vehicle Type:</strong> ${vehicle ? vehicle.vehicle_type : 'N/A'}</p>
          </div>
        </div>
        
        <table class="service-table">
          <thead>
            <tr>
              <th>Service Description</th>
              <th>Date Performed</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div>
                  <div style="font-weight: bold; margin-bottom: 8px;">${description}</div>
                  ${hasServices ? `
                    <div style="font-size: 14px; color: #666;">
                      <div style="font-weight: bold; margin-bottom: 4px;">Service Breakdown:</div>
                      ${services.map(service => `
                        <div style="display: flex; justify-content: space-between; padding-left: 8px; margin-bottom: 2px;">
                          <span>• ${service.service_name}</span>
                          <span>$${parseFloat(service.price || 0).toFixed(2)}</span>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              </td>
              <td>${invoiceDate.toLocaleDateString()}</td>
              <td>$${parseFloat(invoice.cost).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="total-section">
          <p><strong>Subtotal:</strong> $${parseFloat(invoice.cost).toFixed(2)}</p>
          <p><strong>Tax:</strong> $0.00</p>
          <p class="total-amount">Total Amount: $${parseFloat(invoice.cost).toFixed(2)}</p>
          
          <div style="margin-top: 20px;">
            <p class="${invoice.paid_at ? 'status-paid' : 'status-unpaid'}">
              Status: ${invoice.paid_at ? 'PAID' : 'UNPAID'}
            </p>
            ${invoice.paid_at ? `
              <p><strong>Payment Date:</strong> ${paidDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}</p>
            ` : ''}
            ${invoice.paid_using ? `
              <p><strong>Payment Method:</strong> ${invoice.paid_using.replace('_', ' ').toUpperCase()}</p>
            ` : ''}
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing AutoMate Service Center!</p>
          <p>For questions about this invoice, please contact our service department.</p>
        </div>
      </body>
    </html>
  `;
};

/**
 * Print invoice using the generated HTML
 * @param {Object} invoice - The invoice/maintenance log object
 * @param {Object} vehicle - The associated vehicle object
 */
export const printInvoice = (invoice, vehicle) => {
  const printWindow = window.open('', '_blank');
  const invoiceHTML = generateInvoiceHTML(invoice, vehicle);

  printWindow.document.write(invoiceHTML);
  printWindow.document.close();
  printWindow.print();
};

/**
 * Format invoice description safely
 * @param {string|Object} description - The description field from the invoice
 * @returns {string} - Formatted description string
 */
export const formatInvoiceDescription = (description) => {
  if (typeof description === 'string') {
    return description;
  }
  if (typeof description === 'object' && description?.custom_description) {
    return description.custom_description;
  }
  return 'Maintenance Service';
};

/**
 * Get services breakdown from description
 * @param {string|Object} description - The description field from the invoice
 * @returns {Array} - Array of services or empty array
 */
export const getServicesBreakdown = (description) => {
  if (typeof description === 'object' && description?.services && Array.isArray(description.services)) {
    return description.services;
  }
  return [];
};

/**
 * Format service list for display
 * @param {Array} services - Array of service objects
 * @returns {string} - Formatted service list
 */
export const formatServicesList = (services) => {
  if (!services || services.length === 0) {
    return '';
  }
  return services.map(service => service.service_name).join(', ');
};

/**
 * Calculate total from services
 * @param {Array} services - Array of service objects
 * @returns {number} - Total price from services
 */
export const calculateServicesTotal = (services) => {
  if (!services || services.length === 0) {
    return 0;
  }
  return services.reduce((total, service) => total + (parseFloat(service.price) || 0), 0);
};
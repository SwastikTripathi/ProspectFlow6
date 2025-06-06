
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { InvoiceData } from './types';
import { format } from 'date-fns';

export function generateInvoicePdf(invoiceData: InvoiceData) {
  const doc = new jsPDF();

  // --- Document Settings & Placeholders ---
  const FONT_SIZE_NORMAL = 10;
  const FONT_SIZE_LARGE = 16;
  const FONT_SIZE_SMALL = 8;
  const MARGIN = 15;
  const LINE_HEIGHT = 7;
  // Placeholder for your company logo - replace with actual image loading if needed
  // const logoUrl = "https://your-company.com/logo.png"; 
  // Example: doc.addImage(logoUrl, 'PNG', MARGIN, MARGIN, 40, 15);

  // --- Header ---
  // Company Name (Your Company)
  doc.setFontSize(FONT_SIZE_LARGE);
  doc.setFont('helvetica', 'bold');
  doc.text(invoiceData.companyName || "ProspectFlow Inc.", MARGIN, MARGIN + 5);

  doc.setFontSize(FONT_SIZE_SMALL);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.companyAddress || "123 Innovation Drive, Tech City, ST 54321", MARGIN, MARGIN + 10);
  doc.text(invoiceData.companyContact || "contact@prospectflow.com | (555) 123-4567", MARGIN, MARGIN + 14);

  // Invoice Title
  doc.setFontSize(FONT_SIZE_LARGE);
  doc.setFont('helvetica', 'bold');
  doc.text("INVOICE", doc.internal.pageSize.getWidth() - MARGIN, MARGIN + 5, { align: 'right' });

  // Invoice Details (Number, Date)
  doc.setFontSize(FONT_SIZE_NORMAL);
  doc.setFont('helvetica', 'normal');
  let detailsY = MARGIN + 12;
  doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, doc.internal.pageSize.getWidth() - MARGIN, detailsY, { align: 'right' });
  detailsY += LINE_HEIGHT / 2;
  doc.text(`Date: ${invoiceData.invoiceDate}`, doc.internal.pageSize.getWidth() - MARGIN, detailsY, { align: 'right' });
  detailsY += LINE_HEIGHT / 2;
  doc.text(`Payment ID: ${invoiceData.paymentId}`, doc.internal.pageSize.getWidth() - MARGIN, detailsY, { align: 'right' });


  // --- Bill To Section ---
  let billToY = MARGIN + 30;
  doc.setFontSize(FONT_SIZE_NORMAL);
  doc.setFont('helvetica', 'bold');
  doc.text("Bill To:", MARGIN, billToY);
  billToY += LINE_HEIGHT / 2;
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.userName, MARGIN, billToY); // User's name or email
  billToY += LINE_HEIGHT / 2;
  doc.text(invoiceData.userEmail, MARGIN, billToY);
  // Add user address here if collected and available

  // --- Line Items Table ---
  const tableStartY = billToY + LINE_HEIGHT * 2;
  autoTable(doc, {
    startY: tableStartY,
    head: [['Description', 'Quantity', 'Unit Price', 'Amount (INR)']],
    body: [
      [
        invoiceData.planName,
        1,
        invoiceData.planPrice.toFixed(2),
        invoiceData.planPrice.toFixed(2)
      ],
    ],
    theme: 'striped',
    headStyles: { fillColor: [63, 81, 181] }, // Example: Primary color
    styles: { fontSize: FONT_SIZE_NORMAL -1, cellPadding: 2.5 },
    columnStyles: {
        3: { halign: 'right' },
        1: { halign: 'center'},
        2: { halign: 'right'},
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY;

  // --- Totals ---
  const totalsX = doc.internal.pageSize.getWidth() - MARGIN - 60; // Align right
  let totalsY = finalY + LINE_HEIGHT * 1.5;

  doc.setFontSize(FONT_SIZE_NORMAL);
  doc.setFont('helvetica', 'bold');
  doc.text("Subtotal:", totalsX, totalsY);
  doc.text(`${invoiceData.planPrice.toFixed(2)}`, doc.internal.pageSize.getWidth() - MARGIN, totalsY, { align: 'right'});
  totalsY += LINE_HEIGHT;

  // Example Tax - adjust if needed
  // const taxRate = 0.18; // 18%
  // const taxAmount = invoiceData.planPrice * taxRate;
  // doc.text("Tax (18%):", totalsX, totalsY);
  // doc.text(`${taxAmount.toFixed(2)}`, doc.internal.pageSize.getWidth() - MARGIN, totalsY, { align: 'right'});
  // totalsY += LINE_HEIGHT;
  // const totalAmount = invoiceData.planPrice + taxAmount;

  doc.setFont('helvetica', 'bold');
  doc.text("Total Amount:", totalsX, totalsY);
  doc.text(`₹${invoiceData.planPrice.toFixed(2)}`, doc.internal.pageSize.getWidth() - MARGIN, totalsY, { align: 'right'});

  // --- Footer Notes & Signature ---
  let footerY = doc.internal.pageSize.getHeight() - MARGIN - 20;
  doc.setFontSize(FONT_SIZE_SMALL);
  doc.setFont('helvetica', 'italic');
  doc.text("Thank you for your business!", MARGIN, footerY);
  footerY += LINE_HEIGHT / 2;
  doc.text("This is a computer-generated invoice and does not require a physical signature.", MARGIN, footerY);
  
  // Placeholder for signature line (if needed for manual print & sign)
  // const signatureX = doc.internal.pageSize.getWidth() - MARGIN - 70;
  // doc.line(signatureX, footerY - 5, signatureX + 60, footerY - 5); // Signature line
  // doc.text("Authorized Signature", signatureX, footerY);

  // --- Save PDF ---
  doc.save(`Invoice-${invoiceData.invoiceNumber}.pdf`);
}

import jsPDF from "jspdf";

interface FlightTicket {
  airline: string;
  flightCode: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departure: string;
  arrival: string;
  passengers: string;
  bookingRef: string;
  seatClass: string;
}

interface HotelTicket {
  name: string;
  location: string;
  checkIn: string;
  checkOut: string;
  confirmationPin: string;
  stars: number;
}

interface ActivityTicket {
  name: string;
  date: string;
  timeSlot: string;
  ticketId: string;
  quantity: string;
}

// ── Colour palette ──────────────────────────────────────────────
const BRAND_BLUE  = [37, 99, 235]   as [number, number, number];
const BRAND_DARK  = [17, 24, 39]    as [number, number, number];
const GREY_LIGHT  = [249, 250, 251] as [number, number, number];
const GREY_MID    = [229, 231, 235] as [number, number, number];
const GREEN       = [22, 163, 74]   as [number, number, number];
const WHITE       = [255, 255, 255] as [number, number, number];

function addHeader(doc: jsPDF, title: string, subtitle: string) {
  // Blue header band
  doc.setFillColor(...BRAND_BLUE);
  doc.rect(0, 0, 210, 40, "F");

  // Logo text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...WHITE);
  doc.text("WanderWise ✈", 14, 18);

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 220, 255);
  doc.text("Your AI Travel Concierge", 14, 26);

  // Ticket type title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...WHITE);
  doc.text(title, 14, 36);

  // Subtitle (right-aligned)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 220, 255);
  doc.text(subtitle, 210 - 14, 36, { align: "right" });
}

function addConfirmedBadge(doc: jsPDF, y: number) {
  doc.setFillColor(...GREEN);
  doc.roundedRect(14, y, 38, 8, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...WHITE);
  doc.text("✓  CONFIRMED", 33, y + 5.5, { align: "center" });
}

function addField(doc: jsPDF, label: string, value: string, x: number, y: number, width = 80) {
  doc.setFillColor(...GREY_LIGHT);
  doc.roundedRect(x, y, width, 16, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);
  doc.text(label.toUpperCase(), x + 4, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND_DARK);
  doc.text(value, x + 4, y + 13);
}

function addDivider(doc: jsPDF, y: number) {
  doc.setDrawColor(...GREY_MID);
  doc.setLineWidth(0.3);
  doc.line(14, y, 196, y);
}

function addFooter(doc: jsPDF) {
  const pageH = doc.internal.pageSize.height;
  doc.setFillColor(...GREY_LIGHT);
  doc.rect(0, pageH - 18, 210, 18, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text("WanderWise AI  •  wanderwise.ai  •  Generated on " + new Date().toLocaleDateString(), 14, pageH - 7);
  doc.text("This document is your official e-ticket. Present at check-in.", 210 - 14, pageH - 7, { align: "right" });
}

// ── FLIGHT PDF ──────────────────────────────────────────────────
export function downloadFlightTicketPDF(ticket: FlightTicket) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  addHeader(doc, "Flight E-Ticket", `Booking Ref: ${ticket.bookingRef}`);
  addConfirmedBadge(doc, 48);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...BRAND_DARK);
  doc.text(ticket.airline, 14, 72);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Flight ${ticket.flightCode}  •  ${ticket.seatClass}`, 14, 79);

  // Route block
  doc.setFillColor(...BRAND_BLUE);
  doc.roundedRect(14, 85, 182, 28, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...WHITE);
  doc.text(ticket.fromCode, 28, 103);
  doc.text(ticket.toCode, 172, 103, { align: "right" });

  doc.setFontSize(9);
  doc.setTextColor(200, 220, 255);
  doc.text(ticket.from, 28, 109);
  doc.text(ticket.to, 172, 109, { align: "right" });

  // Arrow
  doc.setTextColor(...WHITE);
  doc.setFontSize(14);
  doc.text("──────  ✈  ──────", 105, 103, { align: "center" });

  // Fields
  addField(doc, "Departure", ticket.departure, 14, 120, 88);
  addField(doc, "Arrival", ticket.arrival, 108, 120, 88);
  addField(doc, "Passengers", ticket.passengers, 14, 142, 88);
  addField(doc, "Booking Reference", ticket.bookingRef, 108, 142, 88);

  addDivider(doc, 166);

  // Barcode placeholder (visual)
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(14, 170, 182, 24, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(180, 180, 180);
  doc.text("▌▊▌▌▊▊▌▊▌▌▊▌▊▊▌▊▌▌▊▌▊▊▌", 105, 184, { align: "center" });
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text(`${ticket.bookingRef} — SHOW AT CHECK-IN`, 105, 191, { align: "center" });

  addFooter(doc);
  doc.save(`WanderWise_Flight_${ticket.bookingRef}.pdf`);
}

// ── HOTEL PDF ───────────────────────────────────────────────────
export function downloadHotelTicketPDF(ticket: HotelTicket) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  addHeader(doc, "Hotel Reservation Voucher", `PIN: ${ticket.confirmationPin}`);
  addConfirmedBadge(doc, 48);

  const stars = "★".repeat(ticket.stars);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(251, 191, 36);
  doc.text(stars, 14, 72);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...BRAND_DARK);
  doc.text(ticket.name, 14, 82);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`📍 ${ticket.location}`, 14, 90);

  addDivider(doc, 96);

  addField(doc, "Check-in", ticket.checkIn, 14, 102, 88);
  addField(doc, "Check-out", ticket.checkOut, 108, 102, 88);
  addField(doc, "Confirmation PIN", ticket.confirmationPin, 14, 124, 182);

  // Note box
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(14, 148, 182, 20, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235);
  doc.text("ℹ  IMPORTANT", 20, 157);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 64, 175);
  doc.text("Please present this voucher and a valid photo ID at check-in. Early check-in subject to availability.", 20, 164);

  addFooter(doc);
  doc.save(`WanderWise_Hotel_${ticket.confirmationPin}.pdf`);
}

// ── ACTIVITY PDF ────────────────────────────────────────────────
export function downloadActivityTicketPDF(ticket: ActivityTicket) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  addHeader(doc, "Activity Admission Ticket", `ID: ${ticket.ticketId}`);
  addConfirmedBadge(doc, 48);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...BRAND_DARK);
  doc.text(ticket.name, 14, 72);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Qty: ${ticket.quantity}`, 14, 80);

  addDivider(doc, 87);

  addField(doc, "Date", ticket.date, 14, 93, 88);
  addField(doc, "Time Slot", ticket.timeSlot, 108, 93, 88);
  addField(doc, "Ticket ID", ticket.ticketId, 14, 115, 182);

  // QR code placeholder
  doc.setFillColor(...GREY_LIGHT);
  doc.roundedRect(70, 135, 70, 70, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(40);
  doc.setTextColor(180, 180, 180);
  doc.text("⬛", 105, 178, { align: "center" });
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text("QR CODE — SCAN AT ENTRY", 105, 210, { align: "center" });

  addFooter(doc);
  doc.save(`WanderWise_Ticket_${ticket.ticketId}.pdf`);
}

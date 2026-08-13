import { CONTACT } from "./site-data";

export type WhatsAppDetails = {
  name?: string;
  country?: string;
  city?: string;
  phone?: string;
  email?: string;
  service?: string;
  date?: string;
  time?: string;
  message?: string;
};

export function buildWhatsAppMessage(d: WhatsAppDetails = {}): string {
  if (!d.service) {
    return [
      "Hello NRI360 Team,",
      "",
      "I would like to know more about your NRI services.",
      "",
      "Please contact me.",
      "",
      "Thank you.",
    ].join("\n");
  }

  return [
    "Hello NRI360 Team,",
    "",
    "I would like assistance with the following service.",
    "",
    `Name: ${d.name ?? ""}`,
    `Country: ${d.country ?? ""}`,
    `Current City: ${d.city ?? ""}`,
    `Phone: ${d.phone ?? ""}`,
    `Email: ${d.email ?? ""}`,
    "",
    `Selected Service: ${d.service}`,
    `Preferred Date: ${d.date ?? ""}`,
    `Preferred Time: ${d.time ?? ""}`,
    "",
    `Message: ${d.message ?? ""}`,
    "",
    "Please contact me at your earliest convenience.",
    "",
    "Thank you.",
  ].join("\n");
}

export function whatsappLink(details?: WhatsAppDetails): string {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(buildWhatsAppMessage(details))}`;
}

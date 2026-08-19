export const site = {
  name: "CAAT Powerbot LLP",
  email: "caat.powerbot@gmail.com",
  phoneDisplay: "+91 98208 97343",
  phoneRaw: "919820897343",
  whatsapp: (message?: string) =>
    `https://wa.me/919820897343${message ? `?text=${encodeURIComponent(message)}` : ""}`,
};

export const defaultWhatsappMessage =
  "Hi CAAT Powerbot, I'd like an online consultation for rooftop solar.";

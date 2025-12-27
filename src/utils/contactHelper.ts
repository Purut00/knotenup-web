export const getContactLink = (doc: any, organizer: any) => {
  // 1. Check Document Specific WhatsApp
  if (doc.whatsapp) {
    const phone = formatPhone(doc.whatsapp);
    const msg = encodeURIComponent(generateMessage(doc));
    return {
      href: `https://wa.me/${phone}?text=${msg}`,
      label: 'WhatsApp (Rasmi)',
      icon: 'fab fa-whatsapp',
      color: 'bg-green-600 hover:bg-green-700'
    };
  }

  // 2. Check Organizer Profile WhatsApp
  if (organizer && organizer.whatsapp) {
    const phone = formatPhone(organizer.whatsapp);
    const msg = encodeURIComponent(generateMessage(doc));
    return {
      href: `https://wa.me/${phone}?text=${msg}`,
      label: 'Hubungi Organizer (WhatsApp)',
      icon: 'fab fa-whatsapp',
      color: 'bg-green-600 hover:bg-green-700'
    };
  }

  // 3. Fallback to Email
  const email = (organizer && organizer.email) || doc.organizerEmail; // Fallback
  if (email) {
    return {
      href: `mailto:${email}?subject=${encodeURIComponent(doc.title || 'Inquiry')}&body=${encodeURIComponent(generateMessage(doc))}`,
      label: 'Hubungi Organizer (Email)',
      icon: 'fas fa-envelope',
      color: 'bg-blue-600 hover:bg-blue-700'
    };
  }

  return { href: '#', label: 'Tiada Contact Info', icon: 'fas fa-ban', color: 'bg-gray-500' };
};

const formatPhone = (phone: string) => {
  // Basic sanitization: remove non-digits
  let p = phone.toString().replace(/\D/g, '');

  // Malaysian Format Handling
  // If starts with '01' (e.g., 0123456789), replace '0' with '60' -> 60123456789
  if (p.startsWith('01')) {
    p = '6' + p;
  }
  // If starts with '1' (e.g., 123456789), add '60' -> 60123456789
  else if (p.startsWith('1')) {
    p = '60' + p;
  }
  // If user typed 601... it remains 601...

  return p;
};

const generateMessage = (doc: any) => {
  // Auto-message based on context
  // Trip: Hi, saya berminat untuk join trip "Title" pada Date.
  if (doc.startDate) {
    const date = new Date(doc.startDate).toLocaleDateString('ms-MY');
    return `Hi, saya berminat untuk menyertai trip "${doc.title}" pada tarikh ${date}.`;
  }
  // Generic
  return `Hi, saya berminat dengan "${doc.title}". Boleh saya tahu lebih lanjut?`;
};
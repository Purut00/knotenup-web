// src/utils/contactHelper.ts

// Interface ringkas untuk elak error TS (ikut structure anda)
interface TripData {
  title: string;
  contactPhone?: string;
  organizerEmail?: string;
  groupLink?: string; // Support existing field
}

interface UserData {
  phoneNumber?: string;
  phone?: string; // Support naming convention lain
  email?: string;
}

const generateWaLink = (phone: string, message: string) => {
  // Buang karakter bukan nombor
  let cleanNumber = phone.replace(/\D/g, '');
  
  // Auto tambah 60 jika mula dengan 01
  if (cleanNumber.startsWith('01')) {
    cleanNumber = '6' + cleanNumber;
  }

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};

export const getContactLink = (trip: TripData, organizer: UserData | null) => {
  const defaultMessage = `Hi, saya berminat dengan trip "${trip.title}" di KnotenUp. Masih ada kekosongan?`;

  // 1. Check Trip Specific Contact (Paling Utama)
  // Kalau organizer ada letak link group terus (legacy support)
  if (trip.groupLink && trip.groupLink.includes('chat.whatsapp.com')) {
    return {
      href: trip.groupLink,
      label: 'Join WhatsApp Group',
      icon: 'fab fa-whatsapp',
      color: 'bg-green-600 hover:bg-green-700' // Ikut warna asal btn-join
    };
  }

  // Kalau ada phone number spesifik untuk trip
  if (trip.contactPhone && trip.contactPhone.length > 5) {
    return {
      href: generateWaLink(trip.contactPhone, defaultMessage),
      label: 'WhatsApp Admin Trip',
      icon: 'fab fa-whatsapp',
      color: 'bg-green-600 hover:bg-green-700'
    };
  }

  // 2. Check Organizer Profile Phone
  const orgPhone = organizer?.phoneNumber || organizer?.phone;
  if (orgPhone && orgPhone.length > 5) {
    return {
      href: generateWaLink(orgPhone, defaultMessage),
      label: 'WhatsApp Organizer',
      icon: 'fab fa-whatsapp',
      color: 'bg-green-600 hover:bg-green-700'
    };
  }

  // 3. Email Organizer (Fallback)
  const email = organizer?.email || trip.organizerEmail;
  if (email) {
    return {
      href: `mailto:${email}?subject=Pertanyaan Trip: ${trip.title}`,
      label: 'Email Organizer',
      icon: 'fas fa-envelope',
      color: 'bg-blue-600 hover:bg-blue-700'
    };
  }

  // 4. Dead End (Tiada contact)
  return {
    href: '#',
    label: 'Contact Info Hidden',
    icon: 'fas fa-eye-slash',
    color: 'bg-gray-500 cursor-not-allowed opacity-70'
  };
};
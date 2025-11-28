import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
    const phoneNumber = '1234567890'; // Replace with actual number
    const message = encodeURIComponent('Hola, me gustaría obtener más información sobre sus productos.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-12 h-12 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#128C7E] transition-all duration-300 hover:scale-110 z-50"
            aria-label="Contactar por WhatsApp"
        >
            <MessageCircle size={24} />
        </a>
    );
}

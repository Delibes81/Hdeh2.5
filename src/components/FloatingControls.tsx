import WhatsAppButton from './WhatsAppButton';
import ScrollToTopButton from './ScrollToTopButton';

export default function FloatingControls() {
    return (
        <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
            <ScrollToTopButton />
            <WhatsAppButton />
        </div>
    );
}

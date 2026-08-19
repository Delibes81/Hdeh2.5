
interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
}

export default function SEO({
    title,
    description = "Zapatos de piel artesanales. Descubre nuestra colección exclusiva de calzado hecho a mano.",
    image = "/images/logo.png",
    url = "https://hdehelena.com"
}: SEOProps) {
    const siteTitle = title ? `${title} | H de Helena` : 'H de Helena | Zapatos de Piel';
    const fullUrl = url.startsWith('http') ? url : `https://hdehelena.com${url}`;
    const fullImage = image.startsWith('http') ? image : `https://hdehelena.com${image}`;

    return (
        <>
            {/* Basic Metadata */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={fullUrl} />
            <meta property="twitter:title" content={siteTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={fullImage} />

            {/* Canonical */}
            <link rel="canonical" href={fullUrl} />
        </>
    );
}

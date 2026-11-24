import { faqs, services, site } from "@/lib/site";

export function JsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Physiotherapy", "MedicalBusiness", "LocalBusiness"],
        "@id": `${site.url}/#negocio`,
        name: "TANFIP · Fisioterapia & Pilates",
        alternateName: "TANFIP",
        url: site.url,
        logo: `${site.url}/brand/logo-vertical-color.png`,
        image: `${site.url}/opengraph-image`,
        description:
          "Fisioterapia y Pilates en Mat a domicilio en toda Lima, con atención personalizada a cargo de Tania Castro.",
        founder: { "@id": `${site.url}/#tania` },
        telephone: site.phone,
        inLanguage: "es",
        medicalSpecialty: "Physiotherapy",
        knowsAbout: ["Fisioterapia", "Rehabilitación", "Pilates en Mat", "Dolor de espalda", "Postura"],
        areaServed: { "@type": "City", name: "Lima", containedInPlace: { "@type": "Country", name: "Perú" } },
        contactPoint: { "@type": "ContactPoint", telephone: site.phone, contactType: "reservas", availableLanguage: "es" },
        address: {
          "@type": "PostalAddress",
          addressCountry: site.country,
          ...(site.city ? { addressLocality: site.city } : {}),
          ...(site.region ? { addressRegion: site.region } : {}),
          ...(site.address ? { streetAddress: site.address } : {}),
        },
        ...(site.lat && site.lng ? { geo: { "@type": "GeoCoordinates", latitude: site.lat, longitude: site.lng } } : {}),
        ...(site.email ? { email: site.email } : {}),
        ...(site.instagram ? { sameAs: [site.instagram] } : {}),
        potentialAction: { "@type": "ReserveAction", target: `${site.url}/#agenda`, name: "Solicitar cita" },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Servicios",
          itemListElement: services.map((s) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: s.title, description: s.lead },
          })),
        },
      },
      {
        "@type": "Person",
        "@id": `${site.url}/#tania`,
        name: site.owner,
        jobTitle: "Fisioterapeuta",
        worksFor: { "@id": `${site.url}/#negocio` },
        url: `${site.url}/#tania`,
        ...(site.instagram ? { sameAs: [site.instagram] } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#web`,
        url: site.url,
        name: "TANFIP",
        inLanguage: "es",
        publisher: { "@id": `${site.url}/#negocio` },
      },
      {
        "@type": "FAQPage",
        "@id": `${site.url}/#faq`,
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
    />
  );
}

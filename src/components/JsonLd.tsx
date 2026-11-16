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
          "Fisioterapia y Pilates en Mat con atención personalizada, a cargo de Tania Castro.",
        founder: { "@type": "Person", name: site.owner, jobTitle: "Fisioterapeuta" },
        ...(site.address ? { address: { "@type": "PostalAddress", streetAddress: site.address } } : {}),
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
        "@type": "WebSite",
        "@id": `${site.url}/#web`,
        url: site.url,
        name: "TANFIP",
        inLanguage: "es",
        publisher: { "@id": `${site.url}/#negocio` },
      },
      {
        "@type": "FAQPage",
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

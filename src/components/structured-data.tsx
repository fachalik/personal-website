import { DATA } from "@/data/resume";
import { absoluteUrl, SITE_URL, SOCIAL_PROFILES } from "@/lib/seo";

const currentRoles = DATA.work.filter((job) => job.end === "Present");

/**
 * schema.org graph for the home page: who the site is about, and what the site
 * itself is. Helps search engines build a knowledge panel and pick a site name.
 */
export function PersonStructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: DATA.name,
        url: SITE_URL,
        image: absoluteUrl(DATA.avatarUrl),
        jobTitle: "Frontend Developer",
        description: DATA.summary,
        email: `mailto:${DATA.contact.email}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: "South Jakarta",
          addressCountry: "ID",
        },
        knowsAbout: DATA.skills,
        sameAs: SOCIAL_PROFILES,
        worksFor: currentRoles.map((job) => ({
          "@type": "Organization",
          name: job.company,
          url: job.href,
        })),
        alumniOf: DATA.education.map((school) => ({
          "@type": "CollegeOrUniversity",
          name: school.school,
          url: school.href,
        })),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: DATA.name,
        description: DATA.description,
        inLanguage: "en-US",
        publisher: { "@id": `${SITE_URL}/#person` },
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: `${DATA.name} — Frontend Developer`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#person` },
        inLanguage: "en-US",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be inlined as a script body.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

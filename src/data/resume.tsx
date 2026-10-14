import { HomeIcon, NotebookIcon } from "lucide-react";
import { Icons } from "@/components/icons";

const professionalStart = 2021;
const totalYearsExperience = new Date().getFullYear() - professionalStart;

export const DATA = {
  name: "FA Chalik",
  initials: "FAC",
  url: "https://www.fachalik.my.id/",
  location: "South Jakarta, Indonesia",
  locationLink: "https://www.google.com/maps/place/south+jakarta",
  description:
    "Frontend-focused Fullstack Developer building production web apps with React, Next.js, TypeScript and Node.js.",
  yearsOfExperience: totalYearsExperience,
  avatarUrl: "/me.jpeg",
  cvUrl: "/cv-fachalik.pdf",
  // Shows the "open to work" badge in the hero; flip off once hired.
  openToWork: true,
  publicationUrl: "https://ieeexplore.ieee.org/document/9650199",
  // Every GitHub identity to merge into one contribution graph.
  githubAccounts: ["fachalik", "chalikfa", "fachalikA"],
  skills: [
    "React",
    "Next.js",
    "Nest.js",
    "RemixJS",
    "JavaScript",
    "Typescript",
    "Node.js",
    "Python",
    "MySQL",
    "Postgres",
    "Docker",
    "Jenkins",
  ],
  // `label` is a key in the "Nav" message namespace.
  navbar: [
    { href: "/", icon: HomeIcon, label: "home" },
    { href: "/blog", icon: NotebookIcon, label: "blog" },
  ],
  contact: {
    email: "fachalik@gmail.com",
    tel: "",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/fachalik",
        icon: Icons.github,

        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/fachalik",
        icon: Icons.linkedin,

        navbar: true,
      },
      email: {
        name: "Send Email",
        url: "mailto:fachalik@gmail.com",
        icon: Icons.email,

        navbar: false,
      },
    },
  },

  // Titles, descriptions and degrees live in the "Resume" message namespace,
  // looked up by `key`. Dates are ISO (YYYY, YYYY-MM or YYYY-MM-DD) so they can
  // be formatted per locale; a missing `end` means "Present".
  work: [
    {
      // Current employer is deliberately not named on the site; the card shows
      // the "Work.confidential" label instead of `company`.
      key: "current",
      company: "",
      confidential: true,
      badges: [],
      href: "",
      logoUrl: "",
      start: "2025-10",
      end: undefined,
    },
    {
      key: "medira",
      company: "Medira Talenta Asia",
      badges: [],
      href: "https://www.medira.id",
      logoUrl: "",
      start: "2025-06",
      end: undefined,
    },
    {
      key: "infomedia",
      company: "Infomedia Nusantara",
      href: "https://www.infomedia.co.id",
      badges: [],
      logoUrl: "/infomedia.webp",
      start: "2022-10",
      end: "2025-10",
    },
    {
      key: "puti",
      company: "PUTI Telkom University",
      badges: [],
      href: "https://it.telkomuniversity.ac.id",
      logoUrl: "/puti.png",
      start: "2022-03",
      end: "2022-10",
    },
    {
      key: "upana",
      company: "Upana Studio",
      badges: [],
      href: "",
      logoUrl: "",
      start: "2022-02",
      end: "2023-02",
    },
    {
      key: "amoeba",
      company: "Kampus Merdeka x Amoeba Telkom",
      badges: [],
      href: "https://digitalamoeba.id/",
      logoUrl: "/amoeba.png",
      start: "2021-09",
      end: "2022-02",
    },
    {
      key: "vutura",
      company: "Vutura.io",
      badges: [],
      href: "https://vutura.io",
      logoUrl: "",
      start: "2020-06",
      end: "2020-08",
    },
  ],
  education: [
    {
      key: "telkom",
      school: "Telkom University",
      href: "https://telkomuniversity.ac.id",
      logoUrl: "/telu.png",
      start: "2017",
      end: "2021",
    },
  ],
  projects: [
    {
      key: "gitSwitcher",
      title: "Git Switcher",
      href: "https://github.com/fachalik/git-switch",
      start: "2026-09",
      active: true,
      technologies: [
        "Tauri v2",
        "Rust",
        "React",
        "Typescript",
        "TailwindCSS",
        "Shadcn UI",
      ],
      links: [
        {
          type: "source",
          href: "https://github.com/fachalik/git-switch",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "/git-switch-demo.mp4",
    },
    {
      key: "aliran",
      title: "Aliran App",
      href: "https://aliran.app",
      start: "2026-05",
      active: true,
      technologies: ["Next.js", "Typescript", "TailwindCSS", "Shadcn UI"],
      links: [],
      image: "/aliran.png",
      video: "",
    },
    {
      key: "ppgSerdik",
      title: "PPG Serdik",
      href: "https://ppg-serdik.solong.tech/",
      start: "2026-01",
      active: true,
      technologies: [
        "Next.js",
        "Typescript",
        "TailwindCSS",
        "Shadcn UI",
        "Drizzle",
      ],
      links: [],
      image: "/ppg-serdik.png",
      video: "",
    },
    {
      key: "creditScoring",
      title: "Credit Scoring",
      href: "",
      start: "2025-11",
      ongoing: true,
      active: true,
      technologies: ["Next.js", "Typescript", "TailwindCSS", "Shadcn UI"],
      links: [],
      image: "/credit-scoring.png",
      video: "",
    },
    {
      key: "idp",
      title: "Intelligent Document Processing",
      href: "",
      start: "2025-10",
      ongoing: true,
      active: true,
      technologies: ["Next.js", "Typescript", "TailwindCSS", "Shadcn UI"],
      links: [],
      image: "/idp.png",
      video: "",
    },
    {
      key: "idpCms",
      title: "Intelligent Document Processing CMS",
      href: "",
      start: "2025-10",
      ongoing: true,
      active: true,
      technologies: ["React Router", "Typescript", "TailwindCSS", "Shadcn UI"],
      links: [],
      image: "/idp-cms.png",
      video: "",
    },
    {
      key: "clovePaper",
      // Published paper title; kept in English everywhere.
      title:
        "Classification of Dried Clove Flower Quality using Convolutional Neural Network",
      href: "https://ieeexplore.ieee.org/document/9650199",
      start: "2021-11-11",
      active: true,
      technologies: ["Python", "Keras", "TensorFlow", "OpenCV"],
      links: [
        {
          type: "paper",
          href: "https://ieeexplore.ieee.org/document/9650199",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "/paper.png",
      video: "",
    },
    {
      key: "orthophysio",
      title: "Orthophysio Brace - Company Profile",
      href: "https://orthophysiobrace.com",
      start: "2021",
      active: true,
      technologies: ["React", "React Router", "Chakra UI"],
      links: [],
      image: "/orthophysio.png",
      video: "",
    },
  ],
} as const;

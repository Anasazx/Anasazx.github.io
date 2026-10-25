// All site content lives here. Edit this file to update the portfolio —
// no component changes needed.

import { SpriteName } from '../pixel/sprites';

export interface Experience {
  company: string;
  role: string;
  period: string;
  location: string;
  highlights: string[];
  tech: string[];
  icon: SpriteName;
  tint?: string;
}

export interface Project {
  title: string;
  type: string;
  year: string;
  summary: string;
  highlights: string[];
  tech: string[];
  awards?: string[];
  status?: 'In progress';
  featured?: boolean;
  icon: SpriteName;
  tint?: string;
  /** Path relative to /public, e.g. 'projects/awa.jpg'. Replaces the pixel icon in the frame. */
  image?: string;
  repoUrl?: string;
  liveUrl?: string;
}

export interface Award {
  place: string;
  event: string;
  year: string;
  project: string;
  /** 'challenge' is the rare purple tier — used for first place. */
  tier: 'challenge' | 'advancement';
}

export interface Skill {
  name: string;
  color: string;
}

export interface SkillGroup {
  name: string;
  icon: SpriteName;
  items: Skill[];
}

export const profile = {
  name: 'Anas Riadh Azizi',
  handle: 'Anasazx',
  role: 'Software Engineering Student',
  tagline: 'Full-stack developer · Backend systems · Applied AI',
  location: 'Manzah 1, Tunisia',
  email: 'anasriad.azizi@gmail.com',
  github: 'https://github.com/Anasazx',
  linkedin: 'https://www.linkedin.com/in/anas-riadh-azizi-298b88345',
  availability: 'Open to internships & junior roles',
  about: [
    'I’m a final-year Computer Science student (graduating 2027) specializing in Information Systems Development at the Higher Institute of Technological Studies of Médenine.',
    'I work across the stack — Java, Spring Boot and PostgreSQL on the backend, Angular and React on the frontend — and I like pairing that with applied AI, from local LLMs to computer vision.',
    'Outside class I compete in hackathons, where my teams have placed 1st and 3rd nationally, and I lead INNOVA LAB, a university robotics club. I’m looking for software engineering opportunities and advanced studies in Computer Science.',
  ],
};

export const splashes = [
  'Hackathon winner!',
  'Spring Boot powered!',
  'Now with JWT!',
  'Made in Tunisia!',
  'Class of 2027!',
  'Also try INNOVA LAB!',
  'Java EE → Spring Boot!',
  'PrimeFaces → Angular!',
  'Every pixel hand-placed!',
  'Open to work!',
  'Runs on local LLMs!',
  'Three podium finishes!',
  'Hold click to mine!',
  'Fluent in 3 languages!',
  'Press F3!',
];

export const stats: { label: string; value: string; icon: SpriteName }[] = [
  { label: 'Internships completed', value: '2', icon: 'pickaxe' },
  { label: 'Hackathon podiums', value: '3', icon: 'trophy' },
  { label: 'Projects built', value: '5+', icon: 'chest' },
  { label: 'Club members recruited', value: '30+', icon: 'robot' },
];

export const education = {
  degree: 'Bachelor’s Degree in Computer Systems Development',
  school: 'ISET Médenine',
  period: '2024 – 2027',
  start: '2024-09-15',
  end: '2027-06-30',
  coursework: [
    'Web Development',
    'AI & ML',
    'Computer Networks',
    'Database Systems',
    'OOP',
    'Algorithms & Data Structures',
    'UML Design',
    'Computer Architecture',
    'Applied Mathematics',
  ],
};

export const languages = [
  { name: 'Arabic', level: 'Native' },
  { name: 'English', level: 'Fluent (C1)' },
  { name: 'French', level: 'Fluent (C1)' },
];

export const experience: Experience[] = [
  {
    company: 'Customer Centricity Solutions',
    role: 'Full-Stack Software Engineering Intern',
    period: 'Dec 2025 – Feb 2026',
    location: 'Tunis',
    highlights: [
      'Migrated the legacy backend from Java EE to Spring Boot, refactoring business logic, database operations, and REST APIs.',
      'Implemented JWT authentication from scratch with Spring Security, including token validation and endpoint protection.',
    ],
    tech: ['Java', 'Spring Boot', 'Spring Security', 'Hibernate', 'JPA', 'PostgreSQL', 'JWT'],
    icon: 'pickaxe',
    tint: '#4ee6e6',
  },
  {
    company: 'Customer Centricity Solutions',
    role: 'Software Engineering Intern',
    period: 'Dec 2024 – Feb 2025',
    location: 'Tunis',
    highlights: [
      'Migrated the entire legacy ticketing system frontend from PrimeFaces to Angular, integrating REST APIs to modernize data exchange and improve maintainability.',
    ],
    tech: ['Angular', 'TypeScript', 'REST APIs'],
    icon: 'brush',
    tint: '#dd0031',
  },
];

export const projects: Project[] = [
  {
    title: 'AWA – Atmospheric Water Arboretum',
    type: 'IoT & Full Stack',
    year: '2026',
    summary: 'A connected system that monitors an atmospheric water-harvesting structure and tracks its operational data.',
    highlights: ['Developed the connected system on Raspberry Pi with Python, with an Angular interface for monitoring.'],
    tech: ['Raspberry Pi', 'Python', 'Angular', 'IoT'],
    awards: ['1st Place — National Hackathon on Sustainable Development & CSR', '3rd Place — National Engineering Hackathon'],
    featured: true,
    icon: 'sapling',
  },
  {
    title: 'AI-Powered Learning Platform',
    type: 'Full Stack & AI',
    year: '2026',
    summary: 'A learning platform that generates quizzes and assessments with AI to evaluate learner progress.',
    highlights: ['Integrated locally hosted LLMs through LM Studio to generate assessments on demand.'],
    tech: ['Django', 'Python', 'Angular', 'React', 'LM Studio'],
    awards: ['3rd Place — MED’INNOVA Regional Hackathon'],
    featured: true,
    icon: 'book',
    tint: '#7f52ff',
  },
  {
    title: 'AI-Powered Timetable Digitization',
    type: 'Full Stack & AI',
    year: '2026',
    summary: 'Turns timetable images into structured, usable schedules using a local vision LLM.',
    highlights: ['Three features end to end: vision-LLM extraction, automated scheduling, and calendar export.'],
    tech: ['Local Vision LLM', 'Computer Vision', 'Scheduling'],
    icon: 'clock',
  },
  {
    title: 'ReviewHood',
    type: 'Full Stack',
    year: '2026',
    summary: 'A product discovery and review platform with search and user feedback management.',
    highlights: ['Building search, reviews, and user interaction features.'],
    tech: [],
    status: 'In progress',
    icon: 'star',
  },
  {
    title: 'Bus Ticket Reservation Platform',
    type: 'Full Stack',
    year: '2025',
    summary: 'A web application for booking bus tickets.',
    highlights: ['Designed and implemented the backend that manages users, routes, and bookings.'],
    tech: [],
    icon: 'minecart',
  },
];

export const awards: Award[] = [
  {
    place: '1st Place',
    event: 'National Hackathon on Sustainable Development & CSR',
    year: '2025',
    project: 'AWA',
    tier: 'challenge',
  },
  {
    place: '3rd Place',
    event: 'National Engineering Hackathon — French Institute of Tunisia',
    year: '2026',
    project: 'AWA',
    tier: 'advancement',
  },
  {
    place: '3rd Place',
    event: 'MED’INNOVA Regional Hackathon',
    year: '2026',
    project: 'AI-Powered Learning Platform',
    tier: 'advancement',
  },
];

export const leadership = {
  org: 'INNOVA LAB Robotics Club',
  role: 'Founder & President',
  period: '2025 – Present',
  members: 30,
  description:
    'Founded and lead a university robotics club, building a community of 30+ members focused on robotics, engineering, and technological innovation.',
};

export const skills: SkillGroup[] = [
  {
    name: 'Languages',
    icon: 'book',
    items: [
      { name: 'Java', color: '#e76f00' },
      { name: 'Python', color: '#3776ab' },
      { name: 'TypeScript', color: '#3178c6' },
      { name: 'JavaScript', color: '#f7df1e' },
      { name: 'SQL', color: '#b0b0b0' },
      { name: 'C', color: '#5c6bc0' },
      { name: 'Kotlin', color: '#7f52ff' },
    ],
  },
  {
    name: 'Backend',
    icon: 'ingot',
    items: [
      { name: 'Spring Boot', color: '#6db33f' },
      { name: 'Spring Data JPA', color: '#5a9e3a' },
      { name: 'Spring Security', color: '#4e8f35' },
      { name: 'Hibernate', color: '#bcae79' },
      { name: 'Django', color: '#44b78b' },
      { name: 'FastAPI', color: '#009688' },
      { name: 'Node.js', color: '#5fa04e' },
      { name: 'Express.js', color: '#c8c8c8' },
    ],
  },
  {
    name: 'Frontend',
    icon: 'brush',
    items: [
      { name: 'Angular', color: '#dd0031' },
      { name: 'React', color: '#61dafb' },
      { name: 'React Native', color: '#4fc3f7' },
      { name: 'Tailwind CSS', color: '#38bdf8' },
      { name: 'Bootstrap', color: '#7952b3' },
    ],
  },
  {
    name: 'Databases',
    icon: 'chest',
    items: [
      { name: 'PostgreSQL', color: '#4a8bc2' },
      { name: 'MySQL', color: '#f29111' },
      { name: 'SQLite', color: '#57a8d8' },
      { name: 'MongoDB', color: '#4faa41' },
    ],
  },
  {
    name: 'AI & ML',
    icon: 'orb',
    items: [
      { name: 'LLM Integration', color: '#2fbfa5' },
      { name: 'Local LLMs (LM Studio)', color: '#a78bfa' },
      { name: 'Computer Vision', color: '#e05ad6' },
      { name: 'AI-Powered Apps', color: '#55c94a' },
    ],
  },
  {
    name: 'Tools',
    icon: 'pickaxe',
    items: [
      { name: 'Git', color: '#f05032' },
      { name: 'GitHub', color: '#d0d0d0' },
      { name: 'Docker', color: '#2496ed' },
      { name: 'Postman', color: '#ff6c37' },
      { name: 'Maven', color: '#c71a36' },
      { name: 'Linux', color: '#fcc624' },
      { name: 'REST APIs', color: '#55ffff' },
      { name: 'JWT', color: '#d63aff' },
    ],
  },
  {
    name: 'Concepts',
    icon: 'dust',
    items: [
      { name: 'OOP', color: '#ff3b3b' },
      { name: 'MVC Architecture', color: '#ffaa00' },
      { name: 'Data Structures & Algorithms', color: '#55ff55' },
      { name: 'Database Design', color: '#55ffff' },
      { name: 'API Design & Integration', color: '#ff55ff' },
    ],
  },
];

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Linking, Platform } from "react-native";
import { Asset } from "expo-asset";
import { API_BASE_URL, toApiAssetUrl, toStoredAssetPath } from "../config/api";
import { COLORS } from "../constants/colors";
import {
  formatServiceStatusMessage,
  getServiceCopy,
} from "../constants/localization";

export const MatrimonyContext = createContext(null);

const img = (imageFile) => Asset.fromModule(imageFile).uri;

/*
  IMPORTANT:
  Mee images folder:
  assets/Images/

  Ippudu anni images anjali.avif ki set chesanu.
  Later meeru prati id ki separate image pettali ante,
  only below PROFILE_IMAGES / SERVICE_IMAGES lo require file name change cheyyandi.

  Example:
  b1: img(require("../../assets/Images/anjali.avif")),
  b2: img(require("../../assets/Images/priya.avif")),
  g1: img(require("../../assets/Images/rahul.avif")),
  s1: img(require("../../assets/Images/functionhall.avif")),
*/

const PROFILE_IMAGES = {
  // Brides
  b1: img(require("../../assets/Images/anjali-varghese.avif")),
  b2: img(require("../../assets/Images/priya-sharma.avif")),
  b3: img(require("../../assets/Images/fathima-rahman.avif")),
  b4: img(require("../../assets/Images/sneha-reddy.avif")),
  b5: img(require("../../assets/Images/maria-thomas.avif")),
  b6: img(require("../../assets/Images/ayesha-khan.avif")),
  b7: img(require("../../assets/Images/kavya-nair.avif")),
  b8: img(require("../../assets/Images/neha-patel.avif")),
  b9: img(require("../../assets/Images/divya-menon.avif")),
  b10: img(require("../../assets/Images/rachel-mathew.avif")),
  b11: img(require("../../assets/Images/sana-shaikh.avif")),
  b12: img(require("../../assets/Images/meera-iyer.avif")),
  b13: img(require("../../assets/Images/christina-joseph.avif")),
  b14: img(require("../../assets/Images/lakshmi-rao.avif")),
  b15: img(require("../../assets/Images/nimisha-george.avif")),

  // Grooms
  g1: img(require("../../assets/Images/rahul-nair.avif")),
  g2: img(require("../../assets/Images/arjun-reddy.avif")),
  g3: img(require("../../assets/Images/mohammed-sameer.avif")),
  g4: img(require("../../assets/Images/kevin-thomas.avif")),
  g5: img(require("../../assets/Images/vishnu-menon.avif")),
  g6: img(require("../../assets/Images/imran-khan.avif")),
  g7: img(require("../../assets/Images/mathew-kurian.avif")),
  g8: img(require("../../assets/Images/nikhil-sharma.avif")),
  g9: img(require("../../assets/Images/aditya-rao.avif")),
  g10: img(require("../../assets/Images/joel-joseph.avif")),
  g11: img(require("../../assets/Images/faizal-ahmed.avif")),
  g12: img(require("../../assets/Images/sandeep-patel.avif")),
  g13: img(require("../../assets/Images/alan-george.avif")),
  g14: img(require("../../assets/Images/kiran-kumar.avif")),
  g15: img(require("../../assets/Images/rohit-verma.avif")),

  defaultProfile: img(require("../../assets/Images/all-hero.png")),
};

const SERVICE_IMAGES = {
  // s1: Royal Function Hall
  s1: img(require("../../assets/Images/functionhall.avif")),

  // s2: Dream Wedding Photography
  s2: img(require("../../assets/Images/weddingphotography.avif")),

  // s3: Traditional Wedding Cooking
  s3: img(require("../../assets/Images/cooking.avif")),

  // s4: Bridal Glow Makeup
  s4: img(require("../../assets/Images/bridalmakeup.avif")),

  // s5: Elegant Wedding Decor
  s5: img(require("../../assets/Images/decor.avif")),

  // s6: Elite Event Planners
  s6: img(require("../../assets/Images/eventplanner.avif")),

  // s7: Melody Wedding Arkestra
  s7: img(require("../../assets/Images/arkestra.webp")),

  // s8: Grand Arkestra Night
  s8: img(require("../../assets/Images/arkestranight.jpg")),

  // s9: Royal Wedding Cooking Team
  s9: img(require("../../assets/Images/cookingteam.jpg")),

  // s10: Wedding Cleaning Support
  s10: img(require("../../assets/Images/cleaningteam.avif")),

  // s11: Premium Event Cleaning Team
  s11: img(require("../../assets/Images/eventclanteam.avif")),

  // s12: Sri Lakshmi Function Hall
  s12: img(require("../../assets/Images/functionhall-wed.avif")),

  // s13: Bride Luxury Car Service
  s13: img(require("../../assets/Images/bridecar.avif")),

  // s14: Groom Premium Car Service
  s14: img(require("../../assets/Images/groomcar.avif")),

  defaultService: img(require("../../assets/Images/all-hero.png")),
};

const SERVICE_IMAGE_BY_CATEGORY = {
  "function hall": SERVICE_IMAGES.s1,
  "church wedding hall": SERVICE_IMAGES.s1,
  "wedding hall": SERVICE_IMAGES.s12,
  hall: SERVICE_IMAGES.s1,
  photography: SERVICE_IMAGES.s2,
  "wedding photography": SERVICE_IMAGES.s2,
  cooking: SERVICE_IMAGES.s3,
  catering: SERVICE_IMAGES.s3,
  "christian catering": SERVICE_IMAGES.s9,
  makeup: SERVICE_IMAGES.s4,
  "bridal makeup": SERVICE_IMAGES.s4,
  decoration: SERVICE_IMAGES.s5,
  "church decoration": SERVICE_IMAGES.s5,
  "event planner": SERVICE_IMAGES.s6,
  "event planning": SERVICE_IMAGES.s6,
  arkestra: SERVICE_IMAGES.s7,
  orchestra: SERVICE_IMAGES.s7,
  "wedding orchestra": SERVICE_IMAGES.s7,
  music: SERVICE_IMAGES.s8,
  "bride and groom car services": SERVICE_IMAGES.s13,
  "wedding cars": SERVICE_IMAGES.s13,
  "car services": SERVICE_IMAGES.s13,
  cleaning: SERVICE_IMAGES.s10,
  "cleaning services": SERVICE_IMAGES.s10,
  "sound & lighting": SERVICE_IMAGES.s8,
  "wedding cake": SERVICE_IMAGES.s5,
  "honeymoon planning": SERVICE_IMAGES.s6,
  "wedding invitation design": SERVICE_IMAGES.s5,
  "pastor booking": SERVICE_IMAGES.s12,
};

const normalizeServiceCategoryKey = (value = "") =>
  String(value || "").trim().toLowerCase();

const getServiceCategoryImage = (category = "") =>
  SERVICE_IMAGE_BY_CATEGORY[normalizeServiceCategoryKey(category)] ||
  SERVICE_IMAGES.defaultService;

const demoProfiles = [
  {
    id: "b1",
    name: "Anjali Varghese",
    gender: "Bride",
    age: 25,
    community: "Christian",
    religion: "Christian",
    location: "Kochi, Kerala",
    education: "M.Tech",
    job: "Software Engineer",
    income: "₹12 LPA",
    height: "5'4",
    image: PROFILE_IMAGES.b1,
    photos: [PROFILE_IMAGES.b1],
    about:
      "Family oriented and career focused. Looking for a caring, educated and respectful life partner.",
  },
  {
    id: "b2",
    name: "Priya Sharma",
    gender: "Bride",
    age: 24,
    community: "Hindu",
    religion: "Hindu",
    location: "Hyderabad, Telangana",
    education: "B.Tech",
    job: "UI Designer",
    income: "₹8 LPA",
    height: "5'3",
    image: PROFILE_IMAGES.b2,
    photos: [PROFILE_IMAGES.b2],
    about:
      "Creative, simple and family loving person. Interested in design, travel and cultural values.",
  },
  {
    id: "b3",
    name: "Fathima Rahman",
    gender: "Bride",
    age: 24,
    community: "Muslim",
    religion: "Muslim",
    location: "Calicut, Kerala",
    education: "BDS",
    job: "Dentist",
    income: "₹9 LPA",
    height: "5'3",
    image: PROFILE_IMAGES.b3,
    photos: [PROFILE_IMAGES.b3],
    about:
      "Dentist from Calicut. Looking for a respectful, well settled and family-oriented groom.",
  },
  {
    id: "b4",
    name: "Sneha Reddy",
    gender: "Bride",
    age: 26,
    community: "Hindu",
    religion: "Hindu",
    location: "Bengaluru, Karnataka",
    education: "MBA",
    job: "HR Manager",
    income: "₹10 LPA",
    height: "5'5",
    image: PROFILE_IMAGES.b4,
    photos: [PROFILE_IMAGES.b4],
    about:
      "Warm, responsible and ambitious. Looking for a partner with good values and positive mindset.",
  },
  {
    id: "b5",
    name: "Maria Thomas",
    gender: "Bride",
    age: 27,
    community: "Christian",
    religion: "Christian",
    location: "Kottayam, Kerala",
    education: "M.Sc Nursing",
    job: "Nurse",
    income: "₹7 LPA",
    height: "5'4",
    image: PROFILE_IMAGES.b5,
    photos: [PROFILE_IMAGES.b5],
    about:
      "Caring and soft-spoken person. Believes in family bonding, faith and mutual respect.",
  },
  {
    id: "b6",
    name: "Ayesha Khan",
    gender: "Bride",
    age: 25,
    community: "Muslim",
    religion: "Muslim",
    location: "Mumbai, Maharashtra",
    education: "B.Com",
    job: "Bank Executive",
    income: "₹6 LPA",
    height: "5'2",
    image: PROFILE_IMAGES.b6,
    photos: [PROFILE_IMAGES.b6],
    about:
      "Simple, educated and family oriented. Looking for a supportive and settled partner.",
  },
  {
    id: "b7",
    name: "Kavya Nair",
    gender: "Bride",
    age: 23,
    community: "Hindu",
    religion: "Hindu",
    location: "Thrissur, Kerala",
    education: "B.Arch",
    job: "Architect",
    income: "₹8.5 LPA",
    height: "5'6",
    image: PROFILE_IMAGES.b7,
    photos: [PROFILE_IMAGES.b7],
    about:
      "Passionate about architecture, arts and family life. Looking for a mature and kind partner.",
  },
  {
    id: "b8",
    name: "Neha Patel",
    gender: "Bride",
    age: 26,
    community: "Hindu",
    religion: "Hindu",
    location: "Ahmedabad, Gujarat",
    education: "CA",
    job: "Chartered Accountant",
    income: "₹14 LPA",
    height: "5'4",
    image: PROFILE_IMAGES.b8,
    photos: [PROFILE_IMAGES.b8],
    about:
      "Professionally qualified and family loving. Looking for an understanding and responsible groom.",
  },
  {
    id: "b9",
    name: "Divya Menon",
    gender: "Bride",
    age: 28,
    community: "Hindu",
    religion: "Hindu",
    location: "Chennai, Tamil Nadu",
    education: "MCA",
    job: "Software Developer",
    income: "₹13 LPA",
    height: "5'5",
    image: PROFILE_IMAGES.b9,
    photos: [PROFILE_IMAGES.b9],
    about:
      "Calm, confident and career focused. Values honesty, respect and family traditions.",
  },
  {
    id: "b10",
    name: "Rachel Mathew",
    gender: "Bride",
    age: 25,
    community: "Christian",
    religion: "Christian",
    location: "Ernakulam, Kerala",
    education: "B.Pharm",
    job: "Pharmacist",
    income: "₹6.5 LPA",
    height: "5'3",
    image: PROFILE_IMAGES.b10,
    photos: [PROFILE_IMAGES.b10],
    about:
      "Kind-hearted and family attached. Looking for a caring groom with good education and values.",
  },
  {
    id: "b11",
    name: "Sana Shaikh",
    gender: "Bride",
    age: 24,
    community: "Muslim",
    religion: "Muslim",
    location: "Pune, Maharashtra",
    education: "MBA",
    job: "Marketing Executive",
    income: "₹7.5 LPA",
    height: "5'4",
    image: PROFILE_IMAGES.b11,
    photos: [PROFILE_IMAGES.b11],
    about:
      "Modern yet traditional. Interested in family, career growth and meaningful relationships.",
  },
  {
    id: "b12",
    name: "Meera Iyer",
    gender: "Bride",
    age: 27,
    community: "Hindu",
    religion: "Hindu",
    location: "Coimbatore, Tamil Nadu",
    education: "M.A English",
    job: "Teacher",
    income: "₹5.5 LPA",
    height: "5'2",
    image: PROFILE_IMAGES.b12,
    photos: [PROFILE_IMAGES.b12],
    about:
      "Teacher by profession. Loves reading, family gatherings and simple living.",
  },
  {
    id: "b13",
    name: "Christina Joseph",
    gender: "Bride",
    age: 26,
    community: "Christian",
    religion: "Christian",
    location: "Trivandrum, Kerala",
    education: "B.Tech",
    job: "QA Engineer",
    income: "₹9 LPA",
    height: "5'6",
    image: PROFILE_IMAGES.b13,
    photos: [PROFILE_IMAGES.b13],
    about:
      "Positive, practical and family focused. Looking for a loyal and supportive life partner.",
  },
  {
    id: "b14",
    name: "Lakshmi Rao",
    gender: "Bride",
    age: 23,
    community: "Hindu",
    religion: "Hindu",
    location: "Mysuru, Karnataka",
    education: "B.Sc",
    job: "Lab Technician",
    income: "₹4.8 LPA",
    height: "5'1",
    image: PROFILE_IMAGES.b14,
    photos: [PROFILE_IMAGES.b14],
    about:
      "Simple and caring person. Looking for a groom who respects family and relationships.",
  },
  {
    id: "b15",
    name: "Nimisha George",
    gender: "Bride",
    age: 29,
    community: "Christian",
    religion: "Christian",
    location: "Alappuzha, Kerala",
    education: "MBA Finance",
    job: "Finance Analyst",
    income: "₹11 LPA",
    height: "5'5",
    image: PROFILE_IMAGES.b15,
    photos: [PROFILE_IMAGES.b15],
    about:
      "Finance professional with strong family values. Looking for a mature and caring partner.",
  },

  {
    id: "g1",
    name: "Rahul Nair",
    gender: "Groom",
    age: 29,
    community: "Hindu",
    religion: "Hindu",
    location: "Trivandrum, Kerala",
    education: "MBA",
    job: "Business Consultant",
    income: "₹18 LPA",
    height: "5'9",
    image: PROFILE_IMAGES.g1,
    photos: [PROFILE_IMAGES.g1],
    about:
      "MBA graduate and business consultant. Looking for an educated and family-oriented bride.",
  },
  {
    id: "g2",
    name: "Arjun Reddy",
    gender: "Groom",
    age: 30,
    community: "Hindu",
    religion: "Hindu",
    location: "Hyderabad, Telangana",
    education: "B.Tech",
    job: "Software Engineer",
    income: "₹20 LPA",
    height: "5'10",
    image: PROFILE_IMAGES.g2,
    photos: [PROFILE_IMAGES.g2],
    about:
      "Software engineer working in Hyderabad. Values family, career and mutual understanding.",
  },
  {
    id: "g3",
    name: "Mohammed Sameer",
    gender: "Groom",
    age: 28,
    community: "Muslim",
    religion: "Muslim",
    location: "Kochi, Kerala",
    education: "B.Com",
    job: "Entrepreneur",
    income: "₹15 LPA",
    height: "5'8",
    image: PROFILE_IMAGES.g3,
    photos: [PROFILE_IMAGES.g3],
    about:
      "Running own business. Looking for a kind, educated and family-loving bride.",
  },
  {
    id: "g4",
    name: "Kevin Thomas",
    gender: "Groom",
    age: 31,
    community: "Christian",
    religion: "Christian",
    location: "Bengaluru, Karnataka",
    education: "M.Tech",
    job: "Tech Lead",
    income: "₹28 LPA",
    height: "5'11",
    image: PROFILE_IMAGES.g4,
    photos: [PROFILE_IMAGES.g4],
    about:
      "Tech lead in Bengaluru. Looking for a caring bride with strong family values.",
  },
  {
    id: "g5",
    name: "Vishnu Menon",
    gender: "Groom",
    age: 27,
    community: "Hindu",
    religion: "Hindu",
    location: "Thrissur, Kerala",
    education: "BBA",
    job: "Family Business",
    income: "₹16 LPA",
    height: "5'9",
    image: PROFILE_IMAGES.g5,
    photos: [PROFILE_IMAGES.g5],
    about:
      "Involved in family business. Friendly, responsible and family attached.",
  },
  {
    id: "g6",
    name: "Imran Khan",
    gender: "Groom",
    age: 29,
    community: "Muslim",
    religion: "Muslim",
    location: "Mumbai, Maharashtra",
    education: "MBA",
    job: "Sales Manager",
    income: "₹14 LPA",
    height: "5'10",
    image: PROFILE_IMAGES.g6,
    photos: [PROFILE_IMAGES.g6],
    about:
      "Sales manager in Mumbai. Looking for a simple, educated and understanding bride.",
  },
  {
    id: "g7",
    name: "Mathew Kurian",
    gender: "Groom",
    age: 32,
    community: "Christian",
    religion: "Christian",
    location: "Kottayam, Kerala",
    education: "MBBS",
    job: "Doctor",
    income: "₹30 LPA",
    height: "5'11",
    image: PROFILE_IMAGES.g7,
    photos: [PROFILE_IMAGES.g7],
    about:
      "Doctor by profession. Looking for a caring, educated and family-oriented bride.",
  },
  {
    id: "g8",
    name: "Nikhil Sharma",
    gender: "Groom",
    age: 28,
    community: "Hindu",
    religion: "Hindu",
    location: "Delhi",
    education: "CA",
    job: "Finance Consultant",
    income: "₹22 LPA",
    height: "5'8",
    image: PROFILE_IMAGES.g8,
    photos: [PROFILE_IMAGES.g8],
    about:
      "Finance consultant with modern outlook and traditional values. Looking for a compatible partner.",
  },
  {
    id: "g9",
    name: "Aditya Rao",
    gender: "Groom",
    age: 30,
    community: "Hindu",
    religion: "Hindu",
    location: "Chennai, Tamil Nadu",
    education: "MCA",
    job: "Product Manager",
    income: "₹24 LPA",
    height: "5'10",
    image: PROFILE_IMAGES.g9,
    photos: [PROFILE_IMAGES.g9],
    about:
      "Product manager working in tech industry. Believes in respect, honesty and shared goals.",
  },
  {
    id: "g10",
    name: "Joel Joseph",
    gender: "Groom",
    age: 28,
    community: "Christian",
    religion: "Christian",
    location: "Ernakulam, Kerala",
    education: "B.Tech",
    job: "Civil Engineer",
    income: "₹10 LPA",
    height: "5'9",
    image: PROFILE_IMAGES.g10,
    photos: [PROFILE_IMAGES.g10],
    about:
      "Civil engineer from Ernakulam. Looking for a simple, caring and supportive bride.",
  },
  {
    id: "g11",
    name: "Faizal Ahmed",
    gender: "Groom",
    age: 31,
    community: "Muslim",
    religion: "Muslim",
    location: "Calicut, Kerala",
    education: "B.Tech",
    job: "Project Engineer",
    income: "₹13 LPA",
    height: "5'10",
    image: PROFILE_IMAGES.g11,
    photos: [PROFILE_IMAGES.g11],
    about:
      "Project engineer with stable career. Looking for a bride who values family and respect.",
  },
  {
    id: "g12",
    name: "Sandeep Patel",
    gender: "Groom",
    age: 29,
    community: "Hindu",
    religion: "Hindu",
    location: "Ahmedabad, Gujarat",
    education: "MBA",
    job: "Business Owner",
    income: "₹25 LPA",
    height: "5'9",
    image: PROFILE_IMAGES.g12,
    photos: [PROFILE_IMAGES.g12],
    about:
      "Business owner from Ahmedabad. Looking for an educated and family-loving partner.",
  },
  {
    id: "g13",
    name: "Alan George",
    gender: "Groom",
    age: 27,
    community: "Christian",
    religion: "Christian",
    location: "Pune, Maharashtra",
    education: "B.Sc IT",
    job: "System Analyst",
    income: "₹12 LPA",
    height: "5'8",
    image: PROFILE_IMAGES.g13,
    photos: [PROFILE_IMAGES.g13],
    about:
      "System analyst working in Pune. Calm, responsible and family focused.",
  },
  {
    id: "g14",
    name: "Kiran Kumar",
    gender: "Groom",
    age: 33,
    community: "Hindu",
    religion: "Hindu",
    location: "Mysuru, Karnataka",
    education: "M.Com",
    job: "Bank Manager",
    income: "₹17 LPA",
    height: "5'7",
    image: PROFILE_IMAGES.g14,
    photos: [PROFILE_IMAGES.g14],
    about:
      "Bank manager with stable career. Looking for a mature and caring bride.",
  },
  {
    id: "g15",
    name: "Rohit Verma",
    gender: "Groom",
    age: 26,
    community: "Hindu",
    religion: "Hindu",
    location: "Bhopal, Madhya Pradesh",
    education: "B.Tech",
    job: "Data Analyst",
    income: "₹9 LPA",
    height: "5'9",
    image: PROFILE_IMAGES.g15,
    photos: [PROFILE_IMAGES.g15],
    about:
      "Data analyst with positive mindset. Looking for an understanding and supportive life partner.",
  },
];

const demoServices = [
  {
    id: "s1",
    title: "Royal Function Hall",
    category: "Function Hall",
    location: "Kochi",
    price: "₹1,50,000 onwards",
    rating: 4.8,
    image: SERVICE_IMAGES.s1,
    description:
      "Premium AC function hall with 1000 seating capacity, parking, grand stage, dining area and decoration support.",
  },
  {
    id: "s2",
    title: "Dream Wedding Photography",
    category: "Photography",
    location: "Kerala",
    price: "₹75,000 onwards",
    rating: 4.7,
    image: SERVICE_IMAGES.s2,
    description:
      "Wedding photography, candid shoot, pre-wedding shoot and cinematic video coverage.",
  },
  {
    id: "s3",
    title: "Traditional Wedding Cooking",
    category: "Cooking",
    location: "Thrissur",
    price: "₹350 per plate",
    rating: 4.6,
    image: SERVICE_IMAGES.s3,
    description:
      "Traditional wedding cooking, Kerala sadya, biriyani, buffet, live counters and custom wedding menu.",
  },
  {
    id: "s4",
    title: "Bridal Glow Makeup",
    category: "Makeup",
    location: "Kottayam",
    price: "₹25,000 onwards",
    rating: 4.9,
    image: SERVICE_IMAGES.s4,
    description:
      "Professional bridal makeup, engagement makeup and family makeup packages.",
  },
  {
    id: "s5",
    title: "Elegant Wedding Decor",
    category: "Decoration",
    location: "Hyderabad",
    price: "₹85,000 onwards",
    rating: 4.7,
    image: SERVICE_IMAGES.s5,
    description:
      "Stage decoration, floral decor, mandap setup, reception theme and lighting design.",
  },
  {
    id: "s6",
    title: "Elite Event Planners",
    category: "Event Planner",
    location: "Bengaluru",
    price: "₹1,20,000 onwards",
    rating: 4.8,
    image: SERVICE_IMAGES.s6,
    description:
      "Complete wedding planning, guest management, vendor coordination and event execution.",
  },
  {
    id: "s7",
    title: "Melody Wedding Arkestra",
    category: "Arkestra",
    location: "Vijayawada",
    price: "₹45,000 onwards",
    rating: 4.6,
    image: SERVICE_IMAGES.s7,
    description:
      "Live arkestra, wedding music band, singers, sound system, devotional songs and reception music setup.",
  },
  {
    id: "s8",
    title: "Grand Arkestra Night",
    category: "Arkestra",
    location: "Hyderabad",
    price: "₹65,000 onwards",
    rating: 4.8,
    image: SERVICE_IMAGES.s8,
    description:
      "Professional stage arkestra with singers, keyboard, drums, lights, DJ support and full sound setup.",
  },
  {
    id: "s9",
    title: "Royal Wedding Cooking Team",
    category: "Cooking",
    location: "Rajahmundry",
    price: "₹300 per plate",
    rating: 4.7,
    image: SERVICE_IMAGES.s9,
    description:
      "Expert cooking team for marriage functions, breakfast, lunch, dinner, sweets and special traditional menus.",
  },
  {
    id: "s10",
    title: "Wedding Cleaning Support",
    category: "Cleaning",
    location: "Kochi",
    price: "₹18,000 onwards",
    rating: 4.5,
    image: SERVICE_IMAGES.s10,
    description:
      "Pre-function and post-function cleaning, hall cleaning, dining area cleaning, waste management and support staff.",
  },
  {
    id: "s11",
    title: "Premium Event Cleaning Team",
    category: "Cleaning",
    location: "Bengaluru",
    price: "₹25,000 onwards",
    rating: 4.7,
    image: SERVICE_IMAGES.s11,
    description:
      "Professional cleaning team for large marriage events, stage area, kitchen area, guest area and after-event cleanup.",
  },
  {
    id: "s12",
    title: "Sri Lakshmi Function Hall",
    category: "Function Hall",
    location: "Hyderabad",
    price: "₹2,00,000 onwards",
    rating: 4.8,
    image: SERVICE_IMAGES.s12,
    description:
      "Spacious function hall with AC, stage, dining hall, parking, rooms, decoration support and power backup.",
  },
  {
    id: "s13",
    title: "Bride Luxury Car Service",
    category: "Bride And Groom Car Services",
    location: "Kochi",
    price: "₹18,000 onwards",
    rating: 4.7,
    image: SERVICE_IMAGES.s13,
    description:
      "Luxury bride entry car, decorated wedding car, pickup and drop service with professional driver.",
  },
  {
    id: "s14",
    title: "Groom Premium Car Service",
    category: "Bride And Groom Car Services",
    location: "Hyderabad",
    price: "₹22,000 onwards",
    rating: 4.8,
    image: SERVICE_IMAGES.s14,
    description:
      "Premium decorated groom car, luxury sedan/SUV options, driver service and wedding day transport support.",
  },
];

const LIGHT_THEME = {
  mode: "light",
  bg: COLORS.bg,
  card: COLORS.white,
  text: COLORS.text,
  muted: COLORS.muted,
  border: COLORS.border,
  soft: COLORS.softOrange,
  softAlt: COLORS.bg2,
  headerGradient: [COLORS.primaryDark, COLORS.maroon, COLORS.primary],
  tabBar: COLORS.white,
  input: COLORS.white,
};

const DARK_THEME = {
  mode: "dark",
  bg: "#050505",
  card: "#111111",
  text: "#FFFFFF",
  muted: "#D1D5DB",
  border: "#2A2A2A",
  soft: "#171717",
  softAlt: "#1F1F1F",
  headerGradient: ["#000000", "#121212", "#2A2A2A"],
  tabBar: "#0B0B0B",
  input: "#151515",
};

const defaultMyProfile = {
  name: "My Matrimony Profile",
  profileCreatedFor: "Self",
  gender: "Groom",
  age: "",
  dob: "",
  phone: "",
  email: "",
  community: "",
  religion: "",
  caste: "",
  location: "",
  education: "",
  job: "",
  income: "",
  height: "",
  maritalStatus: "Never Married",
  familyType: "",
  fatherName: "",
  motherName: "",
  siblings: "",
  about: "",
  partnerAge: "",
  partnerCommunity: "",
  partnerLocation: "",
  partnerEducation: "",
  habits: "",
  image: PROFILE_IMAGES.defaultProfile,
  photos: [PROFILE_IMAGES.defaultProfile],
  profileCompletion: 25,
  approvalStatus: "Not Submitted",
  verificationStatus: "Not Submitted",
  premiumPlan: "FREE",
  premiumStatus: "ACTIVE",
  premiumActivatedAt: "",
};

const normalizeImage = (value, fallback = PROFILE_IMAGES.defaultProfile) =>
  toApiAssetUrl(value || fallback);

const isTransientAsset = (value = "") =>
  typeof value === "string" && /^(blob:|data:|file:|content:)/i.test(value);

const getStableAsset = (value, fallback = "") =>
  isTransientAsset(value) ? fallback : value || fallback;

const getStableGalleryPhotos = (photos = []) =>
  Array.isArray(photos)
    ? photos.filter((photo) => !isTransientAsset(photo?.uri || photo?.image || photo?.url))
    : [];

const normalizeProofAsset = (value) => {
  if (!value || typeof value !== "string") {
    return value || "";
  }

  if (
    value.startsWith("/uploads/") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return toApiAssetUrl(value);
  }

  return value;
};

const buildEnglishServiceAdminMessage = (request = {}) => {
  const serviceTitle = request?.serviceTitle || "wedding service";
  const normalizedStatus = String(request?.status || "").toUpperCase();

  if (normalizedStatus === "APPROVED") {
    return `Your ${serviceTitle} booking request is approved. Vendor will contact you soon.`;
  }

  if (normalizedStatus === "REJECTED") {
    return `Your ${serviceTitle} booking request is rejected. Please contact support for details.`;
  }

  if (normalizedStatus === "PENDING") {
    return `Your ${serviceTitle} booking request has been sent to the vendor for approval.`;
  }

  return request?.adminMessage || "";
};

const normalizeServiceAdminMessage = (request = {}) => {
  const message = String(request?.adminMessage || "").trim();

  if (!message) {
    return buildEnglishServiceAdminMessage(request);
  }

  const lowerMessage = message.toLowerCase();
  const hasLegacyMixedText =
    lowerMessage.includes("mee ") ||
    lowerMessage.includes("chesaru") ||
    lowerMessage.includes("pampaaru") ||
    lowerMessage.includes("ki send ayindi");

  return hasLegacyMixedText ? buildEnglishServiceAdminMessage(request) : message;
};

export function MatrimonyProvider({ children }) {
  const [profiles, setProfiles] = useState(demoProfiles);
  const [allUsers, setAllUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [wishlistProfiles, setWishlistProfiles] = useState([]);
  const [myProfile, setMyProfile] = useState(defaultMyProfile);
  const [currentUser, setCurrentUser] = useState(null);
  const [interests, setInterests] = useState([]);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [vendorApprovalRequests, setVendorApprovalRequests] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [adminServiceRequests, setAdminServiceRequests] = useState([]);
  const [serviceCustomerState, setServiceCustomerState] = useState({
    registered: false,
    approved: false,
    customerId: null,
    fullName: "",
    phone: "",
    message: "",
  });
  const [notifications, setNotifications] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");
  const [vendors, setVendors] = useState([]);
  const [currentVendor, setCurrentVendor] = useState(null);
  const [vendorServices, setVendorServices] = useState(() => {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return {};
      }

      const rawValue = window.localStorage.getItem("vendorServices");
      return rawValue ? JSON.parse(rawValue) || {} : {};
    } catch (error) {
      return {};
    }
  });

  const appTheme = useMemo(
    () => (isDarkMode ? DARK_THEME : LIGHT_THEME),
    [isDarkMode]
  );
  const serviceCopy = getServiceCopy(language);

  useEffect(() => {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return;
      }

      window.localStorage.setItem("vendorServices", JSON.stringify(vendorServices || {}));
    } catch (error) {
      // ignore storage failures
    }
  }, [vendorServices]);

  const getWishlistStorageKey = (userId) => `wishlistProfileIds:${String(userId || "guest")}`;

  const normalizeWishlistProfiles = (profileItems = []) =>
    (Array.isArray(profileItems) ? profileItems : [])
      .filter(Boolean)
      .map((profile) => ({
        ...profile,
        id: profile?.id != null ? String(profile.id) : profile?.id,
      }))
      .filter((profile, index, array) => {
        const profileId = String(profile?.id || "");
        return profileId && array.findIndex((item) => String(item?.id || "") === profileId) === index;
      });

  const readStoredWishlistProfiles = (userId) => {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return [];
      }

      const rawValue = window.localStorage.getItem(getWishlistStorageKey(userId));

      if (!rawValue) {
        return [];
      }

      const parsedValue = JSON.parse(rawValue);
      return normalizeWishlistProfiles(parsedValue);
    } catch (error) {
      return [];
    }
  };

  const writeStoredWishlistProfiles = (userId, profileItems) => {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return;
      }

      window.localStorage.setItem(
        getWishlistStorageKey(userId),
        JSON.stringify(normalizeWishlistProfiles(profileItems))
      );
    } catch (error) {
      // ignore storage failures
    }
  };

  const wishlist = useMemo(
    () => normalizeWishlistProfiles(wishlistProfiles),
    [wishlistProfiles]
  );

  const wishlistProfileIds = useMemo(
    () => wishlist.map((item) => String(item?.id)),
    [wishlist]
  );

  const wishlistProfileSet = useMemo(
    () => new Set(wishlistProfileIds),
    [wishlistProfileIds]
  );

  const hasWishlistedProfile = (profileId) => wishlistProfileSet.has(String(profileId));

  const resolveWishlistProfile = (profileId, fallbackProfile = null) => {
    const normalizedId = String(profileId);
    return (
      wishlist.find((item) => String(item?.id) === normalizedId) ||
      profiles.find((item) => String(item?.id) === normalizedId) ||
      allUsers.find((item) => String(item?.id) === normalizedId) ||
      fallbackProfile ||
      null
    );
  };

  const fetchJson = async (url, options = {}) => {
    const requestHeaders = {
      ...(options.headers || {}),
    };

    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;

    if (options.body != null && !isFormData && !requestHeaders["Content-Type"]) {
      requestHeaders["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      headers: requestHeaders,
      ...options,
    });

    const rawText = await response.text();
    let data = null;

    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch (error) {
      throw new Error(`Request failed with ${response.status}. Backend returned an invalid response.`);
    }

    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || "Request failed.");
    }

    return data;
  };

  const uploadVendorAsset = async (uri, documentType = "vendor-image") => {
    if (!uri || typeof uri !== "string") {
      return "";
    }

    if (uri.startsWith("/uploads/")) {
      return uri;
    }

    if (uri.startsWith("http://") || uri.startsWith("https://")) {
      try {
        const parsed = new URL(uri);
        if (parsed.pathname.startsWith("/uploads/")) {
          return parsed.pathname;
        }
      } catch (error) {
        return uri;
      }
    }

    const formData = new FormData();

    if (typeof window !== "undefined" && (uri.startsWith("blob:") || uri.startsWith("data:"))) {
      const blob = await fetch(uri)
        .then((response) => response.blob())
        .catch(() => null);

      if (!blob) {
        return "";
      }

      const extension = blob.type?.includes("png")
        ? "png"
        : blob.type?.includes("webp")
        ? "webp"
        : "jpg";
      formData.append("file", blob, `${documentType}.${extension}`);
    } else {
      formData.append("file", {
        uri,
        name: `${documentType}.jpg`,
        type: "image/jpeg",
      });
    }

    formData.append("documentType", documentType);

    const response = await fetchJson(`${API_BASE_URL}/api/uploads/vendor-document`, {
      method: "POST",
      body: formData,
    });

    return response?.data?.filePath || response?.data?.fileUrl || uri;
  };

  const mapUserToProfile = (user = {}) => ({
    ...defaultMyProfile,
    ...user,
    image: normalizeImage(user?.image, defaultMyProfile.image),
    photos: [normalizeImage(user?.image, defaultMyProfile.image)],
    profileCompletion:
      typeof user?.profileCompletion === "number"
        ? user.profileCompletion
        : defaultMyProfile.profileCompletion,
    approvalStatus: user?.approvalStatus || defaultMyProfile.approvalStatus,
    verificationStatus:
      user?.verificationStatus || defaultMyProfile.verificationStatus,
    premiumPlan: user?.premiumPlan || defaultMyProfile.premiumPlan,
    premiumStatus: user?.premiumStatus || defaultMyProfile.premiumStatus,
    premiumActivatedAt: user?.premiumActivatedAt || defaultMyProfile.premiumActivatedAt,
    habits: user?.habits || "",
  });

  const mapApprovalRequest = (request = {}) => ({
    ...request,
    image: normalizeImage(request?.image),
  });

  const mapVerificationRequest = (request = {}) => ({
    ...request,
    image: normalizeImage(request?.image),
    address: normalizeProofAsset(request?.address),
    educationProof: normalizeProofAsset(request?.educationProof),
    jobProof: normalizeProofAsset(request?.jobProof),
    maritalProof: normalizeProofAsset(request?.maritalProof),
  });

  const mapInterestRequest = (request = {}) => ({
    ...request,
    profile: {
      ...(request?.profile || {}),
      image: normalizeImage(request?.profile?.image),
    },
  });

  const mapVendorPhoto = (photo = {}) => ({
    ...photo,
    uri: normalizeProofAsset(photo?.uri || photo?.image || photo?.url || ""),
  });

  const getServiceProfileKey = (category = "") =>
    String(category || "default").trim().toLowerCase();

  const getServiceProfileForCategory = (svc = {}, category = "") => {
    const profile = svc.serviceProfiles?.[getServiceProfileKey(category)] || {};

    return {
      photos: Array.isArray(profile.photos) ? profile.photos : svc.photos || [],
      serviceDescription: profile.serviceDescription ?? svc.serviceDescription ?? "",
      packages: Array.isArray(profile.packages) ? profile.packages : svc.packages || [],
      serviceDetails:
        profile.serviceDetails && Object.keys(profile.serviceDetails).length
          ? profile.serviceDetails
          : svc.serviceDetails || {},
    };
  };

  const getPrimaryServiceProfile = (svc = {}) => {
    const profiles = Object.values(svc.serviceProfiles || {}).filter(
      (profile) => profile && Object.keys(profile).length > 0
    );
    return profiles[0] || {};
  };

  const getVendorServiceProfile = (vendorId, category = "") => {
    const svc = vendorId ? getVendorService(vendorId) : {};
    return getServiceProfileForCategory(svc, category);
  };

  const mapServiceRequest = (request = {}) => ({
    ...request,
    status: String(request?.status || "").toUpperCase(),
    vendorId: request?.vendorId ?? request?.service?.vendorId ?? null,
    adminMessage: normalizeServiceAdminMessage(request),
    service: request?.service
      ? {
          ...request.service,
          image: normalizeImage(
            request?.service?.image,
            SERVICE_IMAGES.defaultService
          ),
        }
      : request?.service,
    submittedAt:
      request?.submittedAt || request?.createdAt || request?.requestedAt || "Now",
    approvedAt: request?.approvedAt || "",
    rejectedAt: request?.rejectedAt || "",
    bookingDate: request?.bookingDate || request?.fromDate || "",
    bookingEndDate: request?.bookingEndDate || request?.toDate || "",
    bookingTime: request?.bookingTime || request?.timeSlot || "",
    packageName: request?.packageName || request?.servicePackageName || "",
    packagePrice: request?.packagePrice || request?.servicePackagePrice || "",
    paymentStatus: String(request?.paymentStatus || "").toUpperCase(),
    paymentAmount: request?.paymentAmount || 0,
    paymentCurrency: request?.paymentCurrency || "INR",
    razorpayOrderId: request?.razorpayOrderId || "",
    razorpayPaymentId: request?.razorpayPaymentId || "",
    razorpaySignature: request?.razorpaySignature || "",
    paymentVerifiedAt: request?.paymentVerifiedAt || "",
    invoiceNumber: request?.invoiceNumber || `INV-${String(request?.id || "").padStart(6, "0")}`,
    invoiceDate: request?.invoiceDate || request?.paymentVerifiedAt || request?.requestedAt || "",
    invoiceAmount: request?.invoiceAmount ?? formatPaidAmount(request),
    invoiceStatus: request?.invoiceStatus || String(request?.status || "").toUpperCase(),
    invoiceReference: request?.invoiceReference || request?.razorpayPaymentId || request?.razorpayOrderId || "",
  });

  const mapWeddingService = (service = {}) => {
    const fallbackImage =
      SERVICE_IMAGES[service?.id] || getServiceCategoryImage(service?.category);
    const serviceImage = getStableAsset(service?.image || service?.imageName, fallbackImage);

    return {
      ...service,
      image: normalizeImage(serviceImage, fallbackImage),
      price: service?.price || service?.startingPrice || "Contact vendor",
      rating: service?.rating || 4.5,
      updatedAt: service?.updatedAt || "",
      galleryPhotos: getStableGalleryPhotos(service?.galleryPhotos).map((photo) => ({
        ...photo,
        uri: normalizeImage(photo?.uri || photo?.image || photo?.url, serviceImage),
      })),
      packages: Array.isArray(service?.packages) ? service.packages : [],
      serviceDetails: service?.serviceDetails || {},
    };
  };

  const createPublishedVendorServices = () =>
    vendors
      .filter((vendor) =>
        ["approved", "live"].includes(
          String(vendor?.approvalStatus || vendor?.status || "").toLowerCase()
        )
      )
      .flatMap((vendor) => {
        const svc = getVendorService(vendor.id);
        const coverPhoto = (svc.photos || []).find((photo) => photo?.isCover) || {};
        const packages = Array.isArray(svc.packages) ? svc.packages : [];
        const prices = packages
          .map((pkg) => Number(String(pkg?.price || "").replace(/[^\d.]/g, "")))
          .filter((price) => Number.isFinite(price) && price > 0);
        const price = prices.length
          ? `₹${Math.min(...prices)} onwards`
          : vendor.startingPrice || "Contact vendor";
        const categories = Array.isArray(vendor.services) && vendor.services.length
          ? vendor.services
          : vendor.category
          ? [vendor.category]
          : [];

        return categories.map((category) => {
          const categoryProfile = getServiceProfileForCategory(svc, category);
          const categoryCoverPhoto =
            (categoryProfile.photos || []).find((photo) => photo?.isCover) || {};
          const fallbackImage = getServiceCategoryImage(category);
          const categoryServiceImage = getStableAsset(
            categoryCoverPhoto.uri || coverPhoto.uri || vendor.imageName,
            fallbackImage
          );

          return mapWeddingService({
            id: `vendor-${vendor.id}-${String(category).replace(/\s+/g, "-").toLowerCase()}`,
            title: vendor.businessName,
            category,
            location: vendor.location || vendor.city || "",
            price,
            image: categoryServiceImage,
            imageName: categoryServiceImage,
            rating: 4.5,
            description: categoryProfile.serviceDescription || vendor.description,
            vendorId: vendor.id,
            vendorName: vendor.businessName,
            vendorPhone: vendor.phone || vendor.mobile,
            vendorEmail: vendor.email,
            galleryPhotos: getStableGalleryPhotos(categoryProfile.photos),
            packages: categoryProfile.packages,
            serviceDetails: categoryProfile.serviceDetails || {},
            updatedAt: categoryProfile.updatedAt || vendor.approvedAt || "",
          });
        });
      });

  const mapVendor = (vendor = {}) => ({
    ...vendor,
    avatar: normalizeImage(vendor?.avatar || vendor?.imageName || ""),
    mobile: vendor?.mobile || vendor?.phone || "",
    phone: vendor?.phone || vendor?.mobile || "",
    category:
      vendor?.category ||
      (Array.isArray(vendor?.services) ? vendor.services[0] : "") ||
      "",
    services: Array.isArray(vendor?.services)
      ? vendor.services
      : vendor?.category
      ? [vendor.category]
      : [],
    status: vendor?.status || vendor?.approvalStatus || "Registered",
    approvalStatus: vendor?.approvalStatus || vendor?.status || "Registered",
    servicePhotos: Array.isArray(vendor?.servicePhotos)
      ? vendor.servicePhotos.map(mapVendorPhoto)
      : [],
    serviceProfiles: vendor?.serviceProfiles || {},
    servicePackages: Array.isArray(vendor?.servicePackages) ? vendor.servicePackages : [],
    serviceDetails: vendor?.serviceDetails || {},
    serviceDescription: vendor?.serviceDescription || vendor?.description || "",
  });

  const mapServiceCustomerState = (payload = {}) => ({
    registered: Boolean(payload?.registered),
    approved: Boolean(payload?.approved),
    customerId: payload?.customerId ?? null,
    fullName: payload?.fullName || "",
    phone: payload?.phone || "",
    message: payload?.message || "",
  });

  const normalizeWishlistProfileIds = (profileIds = []) =>
    [...new Set(
      (Array.isArray(profileIds) ? profileIds : [])
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0)
    )];

  const hydrateUserSession = async (userData) => {
    if (!userData?.id) {
      return;
    }

    setCurrentUser(userData);
    setMyProfile(mapUserToProfile(userData));
    setWishlistProfiles(readStoredWishlistProfiles(userData.id));

    // Treat session hydration as best-effort so a flaky secondary endpoint
    // does not block a successful login from completing.
    await Promise.allSettled([
      loadApprovedProfiles(),
      loadWeddingServices(),
      loadCurrentUserData(userData.id),
      loadAdminData(),
    ]);
  };

  const clearUserSession = () => {
    setCurrentUser(null);
    setCurrentVendor(null);
    setMyProfile(defaultMyProfile);
    setWishlistProfiles([]);
    setInterests([]);
    setVerificationRequests([]);
    setApprovalRequests([]);
    setServiceRequests([]);
    setAdminServiceRequests([]);
    setServiceCustomerState({
      registered: false,
      approved: false,
      customerId: null,
      fullName: "",
      phone: "",
      message: "",
    });
    setNotifications([]);
    setProfiles([]);
    setAllUsers([]);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const loadApprovedProfiles = async (filters = {}) => {
    try {
      const searchParams = new URLSearchParams();

      if (filters.gender && filters.gender !== "All") {
        searchParams.append("gender", filters.gender);
      }

      if (filters.name?.trim()) {
        searchParams.append("name", filters.name.trim());
      }

      if (filters.minAge) {
        searchParams.append("minAge", String(filters.minAge));
      }

      if (filters.maxAge) {
        searchParams.append("maxAge", String(filters.maxAge));
      }

      if (filters.region?.trim()) {
        searchParams.append("region", filters.region.trim());
      }

      if (filters.location?.trim()) {
        searchParams.append("location", filters.location.trim());
      }

      if (filters.education?.trim()) {
        searchParams.append("education", filters.education.trim());
      }

      if (filters.job?.trim()) {
        searchParams.append("job", filters.job.trim());
      }

      const query = searchParams.toString();
      const data = await fetchJson(
        `${API_BASE_URL}/api/users/approved-profiles${query ? `?${query}` : ""}`
      );
      const serverProfiles = Array.isArray(data.data) ? data.data : [];
      const currentUserId = currentUser?.id != null ? String(currentUser.id) : "";
      const visibleProfiles = currentUserId
        ? serverProfiles.filter((item) => String(item?.id) !== currentUserId)
        : serverProfiles;

      setProfiles(
        visibleProfiles.map((item) => ({
          ...item,
          image: normalizeImage(item?.image),
          photos: [normalizeImage(item?.image)],
        }))
      );
    } catch (error) {
      setProfiles(demoProfiles);
    }
  };

  const loadWeddingServices = async () => {
    try {
      const response = await fetchJson(`${API_BASE_URL}/api/wedding-services`);
      const serverServices = Array.isArray(response?.data) ? response.data.map(mapWeddingService) : [];
      setServices(serverServices);
    } catch (error) {
      setServices([]);
    }
  };

  const loadAllUsers = async () => {
    try {
      const data = await fetchJson(`${API_BASE_URL}/api/admin/users`);
      setAllUsers(
        Array.isArray(data.data)
          ? data.data.map((item) => ({
              ...item,
              image: normalizeImage(item?.image),
            }))
          : []
      );
    } catch (error) {
      setAllUsers([]);
    }
  };

  const loadCurrentUserData = async (userId = currentUser?.id) => {
    if (!userId) return;

    try {
      const [
      profileData,
      notificationData,
      verificationData,
      serviceRequestData,
      serviceCustomerData,
      ] =
        await Promise.allSettled([
        fetchJson(`${API_BASE_URL}/api/users/${userId}/profile`),
        fetchJson(`${API_BASE_URL}/api/users/${userId}/notifications`),
        fetchJson(`${API_BASE_URL}/api/users/${userId}/verification-requests`),
        fetchJson(`${API_BASE_URL}/api/users/${userId}/service-requests`),
        fetchJson(`${API_BASE_URL}/api/service-customers/status?userKey=${userId}`),
      ]);
      const interestData = await fetchJson(`${API_BASE_URL}/api/users/${userId}/interests`).catch(
        () => null
      );

      if (profileData.status === "fulfilled" && profileData.value?.data) {
        setMyProfile(mapUserToProfile(profileData.value.data));
        setCurrentUser(profileData.value.data);
        setWishlistProfiles(readStoredWishlistProfiles(userId));
      }

      if (notificationData.status === "fulfilled") {
        setNotifications(
          Array.isArray(notificationData.value?.data) ? notificationData.value.data : []
        );
      }

      if (verificationData.status === "fulfilled") {
        setVerificationRequests(
          Array.isArray(verificationData.value?.data)
            ? verificationData.value.data.map(mapVerificationRequest)
            : []
        );
      }

      if (serviceRequestData.status === "fulfilled") {
        setServiceRequests(
          Array.isArray(serviceRequestData.value?.data)
            ? serviceRequestData.value.data.map(mapServiceRequest)
            : []
        );
      }

      if (serviceCustomerData.status === "fulfilled") {
        setServiceCustomerState(
          mapServiceCustomerState(serviceCustomerData.value?.data || serviceCustomerData.value)
        );
      } else {
        setServiceCustomerState({
          registered: false,
          approved: false,
          customerId: null,
          fullName: "",
          phone: "",
          message: "",
        });
      }

      if (interestData?.data) {
        setInterests(
          Array.isArray(interestData.data)
            ? interestData.data.map(mapInterestRequest)
            : []
        );
      }
    } catch (error) {
      // keep local state as fallback
    }
  };

  const loadAdminData = async () => {
    try {
      const [
        approvalData,
        verificationData,
        adminNotificationData,
        allUsersData,
        vendorApprovalData,
      ] = await Promise.allSettled([
        fetchJson(`${API_BASE_URL}/api/admin/approval-requests`),
        fetchJson(`${API_BASE_URL}/api/admin/verification-requests`),
        fetchJson(`${API_BASE_URL}/api/admin/notifications`),
        fetchJson(`${API_BASE_URL}/api/admin/users`),
        fetchJson(`${API_BASE_URL}/api/admin/vendor-approvals`),
      ]);

      if (approvalData.status === "fulfilled") {
        setApprovalRequests(
          Array.isArray(approvalData.value?.data)
            ? approvalData.value.data.map(mapApprovalRequest)
            : []
        );
      }

      if (verificationData.status === "fulfilled") {
        setVerificationRequests(
          Array.isArray(verificationData.value?.data)
            ? verificationData.value.data.map(mapVerificationRequest)
            : []
        );
      }

      if (adminNotificationData.status === "fulfilled") {
        const adminNotifications = Array.isArray(adminNotificationData.value?.data)
          ? adminNotificationData.value.data
          : [];

        setNotifications((prev) => {
          const userNotifications = prev.filter((item) => item.to !== "admin");
          return [...adminNotifications, ...userNotifications];
        });
      }

      if (allUsersData.status === "fulfilled") {
        setAllUsers(
          Array.isArray(allUsersData.value?.data)
            ? allUsersData.value.data.map((item) => ({
                ...item,
                image: normalizeImage(item?.image),
              }))
            : []
        );
      }

      if (vendorApprovalData.status === "fulfilled") {
        setVendorApprovalRequests(
          Array.isArray(vendorApprovalData.value?.data)
            ? vendorApprovalData.value.data.map(mapVendor)
            : []
        );
      }
    } catch (error) {
      // no-op
    }
  };

  const loadServiceRequests = async (userId = currentUser?.id) => {
    if (!userId) return;
    await loadCurrentUserData(userId);
  };

  const loadAdminServiceRequests = async () => {
    try {
      const response = await fetchJson(`${API_BASE_URL}/api/service-requests`);
      setAdminServiceRequests(
        Array.isArray(response?.data) ? response.data.map(mapServiceRequest) : []
      );
    } catch (error) {
      setAdminServiceRequests([]);
    }
  };

  const createId = (prefix = "ID") =>
    `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

  const getCurrentUserId = () =>
    currentUser?.id || myProfile?.id || "current-user";

  const addNotification = (title, message, options = {}) => {
    const newNotification = {
      id: createId("NOTI"),
      to: options.to || "user",
      userId: options.userId || getCurrentUserId(),
      type: options.type || "GENERAL",
      requestId: options.requestId || null,
      title,
      message,
      time: options.time || "Now",
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => [newNotification, ...prev]);

    if (newNotification.to === "vendor" && newNotification.userId != null) {
      const vendorId = String(newNotification.userId);
      setVendorServices((prev) => {
        const current = prev[vendorId] || { notifications: [] };
        const nextNotifications = [
          {
            ...newNotification,
            to: "vendor",
            userId: newNotification.userId,
          },
          ...(Array.isArray(current.notifications) ? current.notifications : []),
        ];

        return {
          ...prev,
          [vendorId]: {
            ...current,
            notifications: nextNotifications,
          },
        };
      });
    }

    return newNotification;
  };

  useEffect(() => {
    loadApprovedProfiles();
    loadWeddingServices();
  }, []);

  const getUserNotifications = () =>
    notifications.filter((item) => item.to !== "admin");

  const getAdminNotifications = () =>
    notifications.filter((item) => item.to === "admin");

  const getAdminVendorNotifications = () =>
    getAdminNotifications().filter((item) => item.type === "VENDOR_APPROVAL_REQUEST");

  const getUnreadUserNotificationCount = () =>
    getUserNotifications().filter((item) => !item.read).length;

  const getUnreadAdminNotificationCount = () =>
    getAdminNotifications().filter((item) => !item.read).length;

  const markNotificationRead = async (notificationId) => {
    try {
      await fetchJson(
        `${API_BASE_URL}/api/users/notifications/${notificationId}/read`,
        { method: "POST" }
      );
    } catch (error) {
      // fallback to local update
    }

    setNotifications((prev) =>
      prev.map((item) =>
        String(item.id) === String(notificationId) ? { ...item, read: true } : item
      )
    );
  };

  const submitProfileForApproval = async (profileData = myProfile) => {
    return saveMyProfile(profileData);
  };

  const approveProfile = async (
    requestId,
    adminMessage = "Congratulations! Your profile has been approved by admin."
  ) => {
    try {
      const data = await fetchJson(
        `${API_BASE_URL}/api/admin/approval-requests/${requestId}/approve`,
        {
          method: "POST",
          body: JSON.stringify({ adminMessage }),
        }
      );

      await Promise.all([loadApprovedProfiles(), loadAdminData(), loadCurrentUserData()]);

      return {
        success: true,
        message: data.message,
        request: data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const rejectProfile = async (
    requestId,
    reason = "Your profile was rejected by admin. Please correct the details and submit again."
  ) => {
    try {
      const data = await fetchJson(
        `${API_BASE_URL}/api/admin/approval-requests/${requestId}/reject`,
        {
          method: "POST",
          body: JSON.stringify({ adminMessage: reason }),
        }
      );

      await Promise.all([loadAdminData(), loadCurrentUserData()]);

      return {
        success: true,
        message: data.message,
        request: data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const getPendingApprovalRequests = () =>
    approvalRequests.filter((item) => item.status === "Pending");

  const getApprovedApprovalRequests = () =>
    approvalRequests.filter((item) => item.status === "Approved");

  const getRejectedApprovalRequests = () =>
    approvalRequests.filter((item) => item.status === "Rejected");

  const addToWishlist = async (profile) => {
    if (!profile?.id) {
      return {
        success: false,
        message: "Profile not found.",
      };
    }

    if (!currentUser?.id && !myProfile?.id) {
      return {
        success: false,
        message:
          language === "te"
            ? "వాచ్‌లిస్ట్‌ను అప్‌డేట్ చేయడానికి మళ్లీ లాగిన్ అవ్వండి."
            : "Please login again before updating wishlist.",
      };
    }

    const profileId = String(profile.id);
    const previousWishlist = wishlistProfiles;

    if (previousWishlist.some((item) => String(item?.id) === profileId)) {
      return {
        success: true,
        message:
          language === "te"
            ? "ప్రొఫైల్ ఇప్పటికే వాచ్‌లిస్ట్‌లో ఉంది."
            : "Profile is already in wishlist.",
      };
    }

    const nextWishlist = normalizeWishlistProfiles([...previousWishlist, profile]);
    setWishlistProfiles(nextWishlist);
    writeStoredWishlistProfiles(currentUser?.id || myProfile?.id, nextWishlist);
    addNotification(
      language === "te" ? "ప్రొఫైల్ షార్ట్‌లిస్ట్ అయింది" : "Profile Shortlisted",
      language === "te"
        ? `${profile.name} మీ వాచ్‌లిస్ట్‌కు జోడించబడింది.`
        : `${profile.name} added to wishlist.`
    );
    return {
      success: true,
      message:
        language === "te"
          ? `${profile.name} మీ వాచ్‌లిస్ట్‌కు జోడించబడింది.`
          : `${profile.name} added to wishlist.`,
    };
  };

  const removeFromWishlist = async (id) => {
    if (!currentUser?.id && !myProfile?.id) {
      return {
        success: false,
        message: "Please login again before updating wishlist.",
      };
    }

    const profileId = String(id);
    const previousWishlist = wishlistProfiles;
    const nextWishlist = normalizeWishlistProfiles(
      previousWishlist.filter((item) => String(item?.id) !== profileId)
    );

    setWishlistProfiles(nextWishlist);
    writeStoredWishlistProfiles(currentUser?.id || myProfile?.id, nextWishlist);

    return {
      success: true,
      message:
        language === "te"
          ? "ప్రొఫైల్ వాచ్‌లిస్ట్‌ నుంచి తీసివేయబడింది."
          : "Profile removed from wishlist.",
    };
  };

  const getServiceCustomerFromSource = (source = {}) => {
    const name = String(source?.name || "").trim();
    const phone = String(source?.phone || "").trim();
    const email = String(source?.email || "").trim();
    const location = String(source?.location || "").trim();

    return {
      name,
      phone,
      email,
      location,
      registered: Boolean(name && phone && email && location),
    };
  };

  const buildLocalServiceRequest = (
    service,
    bookingDetails = {},
    customerDetails = getServiceCustomerFromSource(myProfile)
  ) => {
    const userId = getCurrentUserId();

    return mapServiceRequest({
      id: createId("SERVICE_REQ"),
      serviceId: service?.id || "",
      serviceTitle: service?.title || "Wedding Service",
      category: service?.category || "",
      location: service?.location || "",
      price: service?.price || "",
      userId,
      userName: customerDetails?.name || myProfile?.name || "User",
      phone: customerDetails?.phone || myProfile?.phone || "",
      email: customerDetails?.email || myProfile?.email || "",
      customerLocation: customerDetails?.location || myProfile?.location || "",
      status: "Pending",
      submittedAt: "Now",
      approvedAt: "",
      rejectedAt: "",
      adminMessage: "",
      bookingDate: bookingDetails?.bookingDate || "",
      bookingEndDate: bookingDetails?.bookingEndDate || "",
      bookingTime: bookingDetails?.bookingTime || "",
      service,
    });
  };

  const buildServiceRequestPayload = (
    service,
    bookingDetails = {},
    paymentAmount = null,
    packageDetails = null
  ) => ({
    userId: getCurrentUserId(),
    serviceId: service?.id || "",
    vendorId: service?.vendorId || null,
    serviceTitle: service?.title || "Wedding Service",
    category: service?.category || "",
    location: service?.location || "",
    price: service?.price || "",
    paymentAmount,
    packageName: packageDetails?.name || "",
    packagePrice: packageDetails?.price || "",
    bookingDate: bookingDetails?.bookingDate || "",
    bookingEndDate: bookingDetails?.bookingEndDate || "",
    bookingTime: bookingDetails?.bookingTime || "",
  });

  const buildServiceBookingOrderPayload = (
    service,
    bookingDetails = {},
    customerDetails = getServiceCustomerFromSource(myProfile),
    paymentAmount = null,
    packageDetails = null
  ) => ({
    ...buildServiceRequestPayload(service, bookingDetails, paymentAmount, packageDetails),
    customerName: customerDetails?.name || myProfile?.name || "",
    phone: customerDetails?.phone || myProfile?.phone || "",
    email: customerDetails?.email || myProfile?.email || "",
    customerLocation: customerDetails?.location || myProfile?.location || "",
  });

  const buildInvoiceFromRequest = (request = {}) => ({
    number: request?.invoiceNumber || `INV-${String(request?.id || "").padStart(6, "0")}`,
    amount: request?.invoiceAmount || request?.paymentAmount || formatPaidAmount(request),
    status: request?.invoiceStatus || String(request?.status || "").toUpperCase(),
    date: request?.invoiceDate || request?.paymentVerifiedAt || request?.requestedAt || "",
    reference: request?.invoiceReference || request?.razorpayPaymentId || request?.razorpayOrderId || "",
  });

  const buildInvoiceDownloadPayload = (request = {}, extras = {}) => {
    const invoice = buildInvoiceFromRequest(request);
    const paymentStatus = String(request?.paymentStatus || request?.invoiceStatus || invoice.status || "").toUpperCase();
    const amount = Number(request?.invoiceAmount ?? request?.paymentAmount ?? invoice.amount ?? formatPaidAmount(request) ?? 0) || 0;

    return {
      appName: extras.appName || "All Matrimony",
      matrimonyName: extras.matrimonyName || "All Matrimony",
      invoiceTitle: extras.invoiceTitle || "Service Booking Invoice",
      invoiceNumber: invoice.number,
      invoiceDate: invoice.date || new Date().toISOString(),
      invoiceStatus: invoice.status || paymentStatus || "PAID",
      invoiceReference: invoice.reference || "",
      paidAt: request?.paymentVerifiedAt || request?.paidAt || extras.paidAt || "",
      customerName: request?.userName || request?.customerName || extras.customerName || "Customer",
      customerPhone: request?.phone || request?.customerPhone || extras.customerPhone || "",
      customerEmail: request?.email || request?.customerEmail || extras.customerEmail || "",
      customerLocation: request?.customerLocation || request?.location || extras.customerLocation || "",
      vendorName: request?.vendorName || request?.service?.vendorName || extras.vendorName || "",
      vendorPhone: request?.vendorPhone || request?.service?.vendorPhone || extras.vendorPhone || "",
      serviceTitle: request?.serviceTitle || request?.service?.title || request?.category || extras.serviceTitle || "Wedding Service",
      packageName: request?.packageName || request?.servicePackageName || extras.packageName || "",
      bookingDate: request?.bookingDate || request?.fromDate || extras.bookingDate || "",
      bookingEndDate: request?.bookingEndDate || request?.toDate || extras.bookingEndDate || "",
      bookingTime: request?.bookingTime || request?.timeSlot || extras.bookingTime || "",
      paymentStatus,
      paymentMode: request?.paymentMethod || extras.paymentMode || (paymentStatus === "PAID" ? "Razorpay" : "Online"),
      transactionId: request?.razorpayPaymentId || request?.transactionId || extras.transactionId || "",
      orderId: request?.razorpayOrderId || extras.orderId || "",
      amount,
      currency: request?.paymentCurrency || extras.currency || "INR",
      notes: request?.adminMessage || extras.notes || "",
    };
  };

  const getInvoiceDownloadUrl = (request = {}, extras = {}) => {
    const payload = buildInvoiceDownloadPayload(request, extras);
    return `${API_BASE_URL}/api/invoices/service-booking/pdf?payload=${encodeURIComponent(JSON.stringify(payload))}`;
  };

  const downloadInvoice = async (request = {}, extras = {}) => {
    const url = getInvoiceDownloadUrl(request, extras);

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && typeof window.open === "function") {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      return { success: true, url };
    }

    await Linking.openURL(url);
    return { success: true, url };
  };

  const registerServiceCustomer = async (formData = {}) => {
    const userId = getCurrentUserId();
    const mergedCustomer = getServiceCustomerFromSource({ ...formData });

    setMyProfile((prev) => ({
      ...prev,
      name: formData?.name || prev.name,
      phone: formData?.phone || prev.phone,
      email: formData?.email || prev.email,
      location: formData?.location || prev.location,
    }));

    if (currentUser?.id) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              name: formData?.name || prev.name,
              phone: formData?.phone || prev.phone,
              email: formData?.email || prev.email,
              location: formData?.location || prev.location,
            }
          : prev
      );
    }

    try {
      const response = await fetchJson(`${API_BASE_URL}/api/service-customers/register`, {
        method: "POST",
        body: JSON.stringify({
          userKey: String(userId),
          fullName: mergedCustomer.name,
          phone: mergedCustomer.phone,
          email: mergedCustomer.email,
          address: mergedCustomer.location,
          city: mergedCustomer.location,
        }),
      });

      await loadCurrentUserData(userId);

      return {
        success: true,
        message: response?.message || "Customer registered successfully.",
        data: response?.data || response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Unable to register service customer.",
      };
    }
  };

  const createServiceBookingOrder = async (
    service,
    bookingDetails = {},
    customerDetails = null,
    paymentAmount = null,
    packageDetails = null
  ) => {
    const userId = getCurrentUserId();

    try {
      const response = await fetchJson(
        `${API_BASE_URL}/api/users/${userId}/service-booking-orders`,
        {
          method: "POST",
          body: JSON.stringify(
            buildServiceBookingOrderPayload(
              service,
              bookingDetails,
              customerDetails,
              paymentAmount,
              packageDetails
            )
          ),
        }
      );

      return {
        success: true,
        message: response?.message || "Booking payment order created.",
        data: response?.data || response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Unable to create booking payment order.",
      };
    }
  };

  const verifyServiceBookingPayment = async (payload = {}) => {
    const userId = getCurrentUserId();

    try {
      const response = await fetchJson(
        `${API_BASE_URL}/api/users/${userId}/service-booking-orders/verify`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      await loadCurrentUserData(userId);

      return {
        success: true,
        message: response?.message || "Booking payment verified.",
        data: response?.data || response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Unable to verify booking payment.",
      };
    }
  };

  const createLocalServiceRequest = (
    service,
    bookingDetails = {},
    customerDetails = getServiceCustomerFromSource(myProfile)
  ) => {
    const request = buildLocalServiceRequest(service, bookingDetails, customerDetails);
    const userId = getCurrentUserId();

    setServiceRequests((prev) => [request, ...prev]);

    addNotification(
      serviceCopy.requestSentTitle,
      `${formatServiceStatusMessage(language, "PENDING", request.serviceTitle)}`,
      {
        to: "user",
        userId,
        type: "SERVICE_REQUEST_SENT",
        requestId: request.id,
      }
    );

    addNotification(
      serviceCopy.newBookingTitle,
      language === "te"
        ? `${request.userName} ${request.serviceTitle} కోసం బుకింగ్ అభ్యర్థన పంపారు.`
        : `${request.userName} submitted a booking request for ${request.serviceTitle}.`,
      {
        to: "admin",
        userId: "admin",
        type: "SERVICE_BOOKING_REQUEST",
        requestId: request.id,
      }
    );

    return request;
  };

  const sendServiceRequest = async (service, bookingDetails = {}) => {
    const userId = getCurrentUserId();

    try {
      const response = await fetchJson(
        `${API_BASE_URL}/api/users/${userId}/service-requests`,
        {
          method: "POST",
          body: JSON.stringify(buildServiceRequestPayload(service, bookingDetails)),
        }
      );

      await loadCurrentUserData(userId);

      const request = mapServiceRequest(response?.data?.request || response?.data || {});

      return {
        success: true,
        message: response?.message || serviceCopy.requestSent,
        request,
        directConfirmed: String(request?.status || "").toUpperCase() === "APPROVED",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || serviceCopy.requestFailed,
      };
    }
  };

  const registerServiceCustomerAndSendRequest = async (
    formData = {},
    service,
    bookingDetails = {}
  ) => {
    const userId = getCurrentUserId();
    const mergedCustomer = getServiceCustomerFromSource({ ...formData });

    setMyProfile((prev) => ({
      ...prev,
      name: formData?.name || prev.name,
      phone: formData?.phone || prev.phone,
      email: formData?.email || prev.email,
      location: formData?.location || prev.location,
    }));

    if (currentUser?.id) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              name: formData?.name || prev.name,
              phone: formData?.phone || prev.phone,
              email: formData?.email || prev.email,
              location: formData?.location || prev.location,
            }
          : prev
      );
    }

    try {
      await fetchJson(`${API_BASE_URL}/api/service-customers/register`, {
        method: "POST",
        body: JSON.stringify({
          userKey: String(userId),
          fullName: mergedCustomer.name,
          phone: mergedCustomer.phone,
          email: mergedCustomer.email,
          address: mergedCustomer.location,
          city: mergedCustomer.location,
        }),
      });

      const response = await fetchJson(
        `${API_BASE_URL}/api/users/${userId}/service-requests`,
        {
          method: "POST",
          body: JSON.stringify(buildServiceRequestPayload(service, bookingDetails)),
        }
      );

      await loadCurrentUserData(userId);

      const request = mapServiceRequest(response?.data?.request || response?.data || {});

      return {
        success: true,
        message: response?.message || serviceCopy.registrationCompletedSent,
        request,
        directConfirmed: String(request?.status || "").toUpperCase() === "APPROVED",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || serviceCopy.registrationCompletedFailed,
      };
    }
  };

  const updateServiceRequestStatus = async (
    requestId,
    status,
    adminMessage = ""
  ) => {
    const request =
      adminServiceRequests.find((item) => String(item.id) === String(requestId)) ||
      serviceRequests.find((item) => String(item.id) === String(requestId));

    if (!request) {
      return {
        success: false,
        message: serviceCopy.requestNotFound,
      };
    }

    const finalMessage =
      adminMessage || formatServiceStatusMessage(language, status, request.serviceTitle);

    try {
      const response = await fetchJson(
        `${API_BASE_URL}/api/admin/service-requests/${requestId}/status`,
        {
          method: "POST",
          body: JSON.stringify({ status, adminMessage: finalMessage }),
        }
      );

      await loadCurrentUserData(request.userId).catch(() => null);

      const updatedRequest = mapServiceRequest(
        response?.data || {
          ...request,
          status,
          approvedAt: status === "Approved" ? "Now" : "",
          rejectedAt: status === "Rejected" ? "Now" : "",
          adminMessage: finalMessage,
        }
      );

      setServiceRequests((prev) =>
        prev.map((item) => (item.id === requestId ? updatedRequest : item))
      );
      setAdminServiceRequests((prev) =>
        prev.map((item) => (item.id === requestId ? updatedRequest : item))
      );

      return {
        success: true,
        message: response?.message || serviceCopy.bookingStatus(status),
        request: updatedRequest,
      };
    } catch (error) {
      const updatedRequest = {
        ...request,
        status,
        approvedAt: status === "Approved" ? "Now" : "",
        rejectedAt: status === "Rejected" ? "Now" : "",
        adminMessage: finalMessage,
      };

      setServiceRequests((prev) =>
        prev.map((item) => (item.id === requestId ? updatedRequest : item))
      );
      setAdminServiceRequests((prev) =>
        prev.map((item) => (item.id === requestId ? updatedRequest : item))
      );

      addNotification(
        serviceCopy.serviceBookingTitle,
        finalMessage,
        {
          to: "user",
          userId: request.userId || "current-user",
          type:
            status === "Approved"
              ? "SERVICE_BOOKING_APPROVED"
              : "SERVICE_BOOKING_REJECTED",
          requestId,
        }
      );

      return {
        success: true,
        message: serviceCopy.bookingStatus(status),
        request: updatedRequest,
      };
    }
  };

  const getPendingServiceRequests = () =>
    serviceRequests.filter((item) => item.status === "PENDING");

  const getApprovedServiceRequests = () =>
    serviceRequests.filter((item) => item.status === "APPROVED");

  const getRejectedServiceRequests = () =>
    serviceRequests.filter((item) => item.status === "REJECTED");

  const getLatestServiceRequest = (serviceId) =>
    [...serviceRequests]
      .filter((item) => !serviceId || String(item?.serviceId) === String(serviceId))
      .sort((a, b) => {
        const aTime = new Date(a?.submittedAt || a?.requestedAt || 0).getTime();
        const bTime = new Date(b?.submittedAt || b?.requestedAt || 0).getTime();
        return bTime - aTime;
      })[0] || null;

  const getLatestServiceBookingDecision = (serviceId) =>
    [...serviceRequests]
      .filter((item) => !serviceId || String(item?.serviceId) === String(serviceId))
      .find(
        (item) =>
          String(item?.status || "").toUpperCase() === "APPROVED" ||
          String(item?.status || "").toUpperCase() === "REJECTED"
      ) || null;

  const serviceCustomer = serviceCustomerState;

  const hasApprovedServiceBooking = (serviceId) =>
    serviceRequests.some(
      (item) =>
        String(item?.status || "").toUpperCase() === "APPROVED" &&
        (!serviceId || String(item?.serviceId || "") === String(serviceId))
    );

  const saveMyProfile = async (profileData) => {
    const requiredFields = [
      "name",
      "profileCreatedFor",
      "gender",
      "age",
      "phone",
      "community",
      "religion",
      "location",
      "education",
      "job",
      "height",
      "about",
    ];

    const filledCount = requiredFields.filter(
      (key) => String(profileData[key] || "").trim().length > 0
    ).length;

    const completion = Math.round((filledCount / requiredFields.length) * 100);

    const updatedProfile = {
      ...myProfile,
      ...profileData,
      image: toStoredAssetPath(profileData?.image || myProfile?.image),
      profileCompletion: completion,
      approvalStatus: "Pending",
    };

    if (!currentUser?.id) {
      setMyProfile(updatedProfile);
      return {
        success: false,
        message: "Please login again before saving profile.",
      };
    }

    try {
      const data = await fetchJson(
        `${API_BASE_URL}/api/users/${currentUser.id}/profile`,
        {
          method: "PUT",
          body: JSON.stringify(updatedProfile),
        }
      );

      await Promise.all([loadCurrentUserData(currentUser.id), loadAdminData()]);

      return {
        success: true,
        profile: data?.data?.profile
          ? mapUserToProfile(data.data.profile)
          : updatedProfile,
        approvalResult: data?.data?.approvalRequest
          ? mapApprovalRequest(data.data.approvalRequest)
          : null,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const sendInterest = async (profile) => {
    if (!currentUser?.id || !profile?.id) {
      return {
        success: false,
        message: "Please login again before sending interest.",
      };
    }

    try {
      const response = await fetchJson(
        `${API_BASE_URL}/api/users/${currentUser.id}/interests`,
        {
          method: "POST",
          body: JSON.stringify({ targetUserId: profile.id }),
        }
      );

      await loadCurrentUserData(currentUser.id);

      return {
        success: true,
        message: response.message,
        request: response.data ? mapInterestRequest(response.data) : null,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const updateInterestStatus = async (interestId, status) => {
    if (!currentUser?.id) {
      return {
        success: false,
        message: "Please login again before updating interest.",
      };
    }

    try {
      const response = await fetchJson(
        `${API_BASE_URL}/api/users/interests/${interestId}/status`,
        {
          method: "POST",
          body: JSON.stringify({
            actingUserId: currentUser.id,
            status,
          }),
        }
      );

      await loadCurrentUserData(currentUser.id);

      return {
        success: true,
        message: response.message,
        request: response.data ? mapInterestRequest(response.data) : null,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const getInterestStatus = (profileId) => {
    const item = interests.find(
      (interest) => String(interest?.profile?.id) === String(profileId)
    );
    return item?.status || null;
  };

  const getConversation = async (otherUserId) => {
    if (!currentUser?.id || !otherUserId) {
      return {
        success: false,
        message: "Conversation users are required.",
      };
    }

    try {
      const response = await fetchJson(
        `${API_BASE_URL}/api/users/${currentUser.id}/chat/${otherUserId}`
      );

      return {
        success: true,
        messages: Array.isArray(response.data) ? response.data : [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        messages: [],
      };
    }
  };

  const getPresence = async (otherUserId) => {
    if (!otherUserId) {
      return {
        success: false,
        message: "User is required.",
      };
    }

    try {
      const response = await fetchJson(`${API_BASE_URL}/api/users/presence/${otherUserId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const sendChatMessage = async (receiverUserId, text) => {
    if (!currentUser?.id) {
      return {
        success: false,
        message: "Please login again before sending message.",
      };
    }

    try {
      const response = await fetchJson(`${API_BASE_URL}/api/users/chat/messages`, {
        method: "POST",
        body: JSON.stringify({
          senderUserId: currentUser.id,
          receiverUserId,
          text,
        }),
      });

      return {
        success: true,
        message: response.message,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const submitVerificationRequest = async (data = {}) => {
    if (!currentUser?.id) {
      return {
        success: false,
        message: "Please login again before submitting verification.",
      };
    }

    try {
      const payload = {
        idNumber: data.idNumber,
        addressProof: data.addressProof,
        addressDetail: data.addressDetail,
        educationProof: data.educationProof,
        educationDetail: data.educationDetail,
        jobProof: data.jobProof,
        jobDetail: data.jobDetail,
        familyContact: data.familyContact,
        characterVerification: data.characterVerification,
        maritalProof: data.maritalProof,
        maritalDetail: data.maritalDetail,
      };

      const response = await fetchJson(
        `${API_BASE_URL}/api/users/${currentUser.id}/verification-requests`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      await Promise.all([loadCurrentUserData(currentUser.id), loadAdminData()]);

      return {
        success: true,
        message: response.message,
        request: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const updateVerificationStatus = async (
    requestId,
    status,
    adminMessage = ""
  ) => {
    try {
      const endpoint =
        status === "Approved"
          ? `${API_BASE_URL}/api/admin/verification-requests/${requestId}/approve`
          : `${API_BASE_URL}/api/admin/verification-requests/${requestId}/reject`;

      const response = await fetchJson(endpoint, {
        method: "POST",
        body: JSON.stringify({ adminMessage }),
      });

      await Promise.all([loadCurrentUserData(), loadAdminData()]);

      return {
        success: true,
        message: response.message,
        request: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const getPendingVerificationRequests = () =>
    verificationRequests.filter((item) => item.status === "Pending");

  const getApprovedVerificationRequests = () =>
    verificationRequests.filter((item) => item.status === "Approved");

  const getRejectedVerificationRequests = () =>
    verificationRequests.filter((item) => item.status === "Rejected");

  const getPublicProfileDetails = async (targetUserId) => {
    if (!currentUser?.id || !targetUserId) {
      return {
        success: false,
        message: "Please login again before opening profile details.",
      };
    }

    try {
      const response = await fetchJson(
        `${API_BASE_URL}/api/users/${currentUser.id}/profiles/${targetUserId}`
      );

      return {
        success: true,
        profile: response.data
          ? mapUserToProfile(response.data)
          : null,
        rawProfile: response.data || null,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const loadPremiumPlans = async () => {
    if (!currentUser?.id) {
      return {
        success: false,
        message: "Please login again before loading premium plans.",
      };
    }

    try {
      const response = await fetchJson(
        `${API_BASE_URL}/api/premium/plans/${currentUser.id}`
      );

      return {
        success: true,
        plans: response.data?.plans || {},
        currentPlan: response.data?.currentPlan || myProfile?.premiumPlan || "FREE",
        premiumStatus: response.data?.premiumStatus || myProfile?.premiumStatus || "ACTIVE",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const applyPremiumPayload = (premiumData = {}) => {
    if (!premiumData?.premiumPlan) {
      return;
    }

    const nextPremiumFields = {
      premiumPlan: premiumData.premiumPlan,
      premiumStatus: premiumData.premiumStatus || "ACTIVE",
      premiumOrderId: premiumData.premiumOrderId || "",
      premiumPaymentId: premiumData.premiumPaymentId || "",
      premiumActivatedAt: premiumData.premiumActivatedAt || "",
    };

    setCurrentUser((previous) =>
      previous ? { ...previous, ...nextPremiumFields } : previous
    );
    setMyProfile((previous) =>
      previous ? { ...previous, ...nextPremiumFields } : previous
    );
  };

  const createPremiumOrder = async (planCode) => {
    if (!currentUser?.id) {
      return {
        success: false,
        message: "Please login again before starting payment.",
      };
    }

    try {
      const response = await fetchJson(
        `${API_BASE_URL}/api/premium/orders/${currentUser.id}`,
        {
          method: "POST",
          body: JSON.stringify({ planCode }),
        }
      );

      applyPremiumPayload(response.data);

      if (planCode === "FREE") {
        await loadCurrentUserData(currentUser.id);
      }

      return {
        success: true,
        message: response.message,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const verifyPremiumPayment = async (payload) => {
    if (!currentUser?.id) {
      return {
        success: false,
        message: "Please login again before verifying payment.",
      };
    }

    try {
      const response = await fetchJson(
        `${API_BASE_URL}/api/premium/verify/${currentUser.id}`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      applyPremiumPayload(response.data);
      await loadCurrentUserData(currentUser.id);

      return {
        success: true,
        message: response.message,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const hasSilverAccess = () => {
    const plan = String(currentUser?.premiumPlan || myProfile?.premiumPlan || "FREE")
      .trim()
      .toUpperCase();
    return plan === "SILVER" || plan === "GOLD";
  };

  const hasGoldAccess = () =>
    String(currentUser?.premiumPlan || myProfile?.premiumPlan || "FREE")
      .trim()
      .toUpperCase() === "GOLD";

  const sendVendorOtp = async (phone) => {
    try {
      const response = await fetchJson(`${API_BASE_URL}/api/vendors/send-otp`, {
        method: "POST",
        body: JSON.stringify({ phone }),
      });

      return {
        success: true,
        message: response?.message || "OTP sent successfully.",
      };
    } catch (error) {
      return { success: false, message: error.message || "Unable to send OTP." };
    }
  };

  const verifyVendorOtp = async (phone, otp) => {
    try {
      const response = await fetchJson(`${API_BASE_URL}/api/vendors/verify-otp`, {
        method: "POST",
        body: JSON.stringify({ phone, otp }),
      });

      return {
        success: true,
        message: response?.message || "Mobile number verified successfully.",
      };
    } catch (error) {
      return { success: false, message: error.message || "Unable to verify OTP." };
    }
  };

  const createVendorService = (vendor = {}) => ({
    vendorId: vendor.id,
    serviceStatus:
      String(vendor?.approvalStatus || vendor?.status || "").toLowerCase() === "approved"
        ? "Live"
        : String(vendor?.approvalStatus || vendor?.status || "").toLowerCase() === "pending"
        ? "PendingApproval"
        : String(vendor?.approvalStatus || vendor?.status || "").toLowerCase() === "rejected"
        ? "Rejected"
        : "Draft",
    kyc:
      vendor?.kycStatus === "Submitted" || vendor?.kycStatus === "Approved"
        ? {
            submitted: true,
            submittedAt: vendor?.kycSubmittedAt || "",
            aadharFront: vendor?.idProofDocument || "",
            panPhoto: vendor?.businessDocument || "",
            aadharBack: vendor?.addressProofDocument || "",
          }
        : {},
    serviceDescription:
      getPrimaryServiceProfile(vendor)?.serviceDescription ||
      vendor?.serviceDescription ||
      vendor?.description ||
      "",
    photos:
      Array.isArray(getPrimaryServiceProfile(vendor)?.photos)
        ? getPrimaryServiceProfile(vendor).photos
        : Array.isArray(vendor?.servicePhotos)
        ? vendor.servicePhotos
        : [],
    serviceProfiles: vendor?.serviceProfiles || {},
    packages:
      Array.isArray(getPrimaryServiceProfile(vendor)?.packages)
        ? getPrimaryServiceProfile(vendor).packages
        : Array.isArray(vendor?.servicePackages)
        ? vendor.servicePackages
        : [],
    serviceDetails:
      getPrimaryServiceProfile(vendor)?.serviceDetails ||
      vendor?.serviceDetails ||
      {},
    bookings: [],
    notifications: [],
    revenue: {
      totalRevenue: 0,
      paidBookings: 0,
      pendingCollection: 0,
      transactions: [],
    },
  });

  const mergeVendorServiceFromVendor = (existing = {}, vendor = {}) => ({
    ...createVendorService(vendor),
    ...existing,
    serviceStatus: createVendorService(vendor).serviceStatus,
    serviceDescription:
      getPrimaryServiceProfile(vendor)?.serviceDescription ||
      vendor?.serviceDescription ||
      existing?.serviceDescription ||
      vendor?.description ||
      "",
    photos:
      existing?.photos && existing.photos.length
        ? existing.photos
        : getPrimaryServiceProfile(vendor)?.photos ||
          (Array.isArray(vendor?.servicePhotos) ? vendor.servicePhotos : []),
    serviceProfiles:
      vendor?.serviceProfiles && Object.keys(vendor.serviceProfiles).length
        ? vendor.serviceProfiles
        : existing?.serviceProfiles || {},
    packages:
      existing?.packages && existing.packages.length
        ? existing.packages
        : getPrimaryServiceProfile(vendor)?.packages ||
          (Array.isArray(vendor?.servicePackages) ? vendor.servicePackages : []),
    serviceDetails:
      existing?.serviceDetails && Object.keys(existing.serviceDetails).length
        ? existing.serviceDetails
        : getPrimaryServiceProfile(vendor)?.serviceDetails ||
          vendor?.serviceDetails ||
          {},
  });

  const persistVendorServiceProfile = async (vendorId, nextService) => {
    if (!vendorId || String(vendorId).indexOf("VENDOR") === 0) {
      return;
    }

    try {
      const response = await fetchJson(`${API_BASE_URL}/api/vendors/${vendorId}/service-profile`, {
        method: "PUT",
        body: JSON.stringify({
          photos: (nextService?.photos || []).map((photo) => ({
            ...photo,
            uri: toStoredAssetPath(photo?.uri),
          })),
          packages: nextService?.packages || [],
          serviceDetails: nextService?.serviceDetails || {},
          serviceDescription: nextService?.serviceDescription || "",
          serviceProfiles: Object.fromEntries(
            Object.entries(nextService?.serviceProfiles || {}).map(([key, profile]) => [
              key,
              {
                ...(profile || {}),
                photos: Array.isArray(profile?.photos)
                  ? profile.photos.map((photo) => ({
                      ...photo,
                      uri: toStoredAssetPath(photo?.uri),
                    }))
                  : [],
              },
            ])
          ),
        }),
      });
      const vendor = mapVendor(response?.data || {});
      setCurrentVendor((prev) => (prev && String(prev.id) === String(vendorId) ? vendor : prev));
      setVendors((prev) => [vendor, ...prev.filter((item) => String(item.id) !== String(vendorId))]);
      setVendorServices((prev) => ({
        ...prev,
        [vendor.id]: mergeVendorServiceFromVendor(prev[vendor.id], vendor),
      }));
      await loadWeddingServices();
    } catch (error) {
      // Keep local edits; they will still be available in this browser as a fallback.
    }
  };

  const markVendorServicePendingApproval = (vendorId) => {
    const currentApproval = String(currentVendor?.approvalStatus || currentVendor?.status || "").toLowerCase();

    if (
      !vendorId ||
      (currentApproval !== "approved" &&
        currentApproval !== "pending" &&
        currentApproval !== "live")
    ) {
      return;
    }

    const nextPatch = {
      status: "PendingApproval",
      approvalStatus: "Pending",
      kycStatus: "Submitted",
      adminMessage: "Service profile updated. Awaiting admin approval.",
    };

    setCurrentVendor((prev) =>
      prev && String(prev.id) === String(vendorId)
        ? mapVendor({ ...prev, ...nextPatch })
        : prev
    );

    setVendors((prev) =>
      prev.map((item) =>
        String(item.id) === String(vendorId)
          ? mapVendor({ ...item, ...nextPatch })
          : item
      )
    );

    setVendorServices((prev) => {
      const current = prev[vendorId] || createVendorService({ id: vendorId });
      return {
        ...prev,
        [vendorId]: {
          ...current,
          serviceStatus: "PendingApproval",
        },
      };
    });
  };

  const getVendorSetupRoute = (vendor = {}) => {
    const approvalStatus = String(vendor?.approvalStatus || vendor?.status || "").toLowerCase();
    const kycStatus = String(vendor?.kycStatus || "").toLowerCase();
    const svc = vendor?.id ? getVendorService(vendor.id) : {};
    const profiles = Object.values(svc.serviceProfiles || {});
    const hasAnyPhotos =
      (Array.isArray(svc.photos) && svc.photos.length > 0) ||
      profiles.some((profile) => Array.isArray(profile?.photos) && profile.photos.length > 0);
    const hasAnyPackages =
      (Array.isArray(svc.packages) && svc.packages.length > 0) ||
      profiles.some((profile) => Array.isArray(profile?.packages) && profile.packages.length > 0);
    const hasAnyDetails =
      Object.values(svc.serviceDetails || {}).some((value) => String(value || "").trim().length > 0) ||
      profiles.some((profile) =>
        Object.values(profile?.serviceDetails || {}).some((value) => String(value || "").trim().length > 0)
      ) ||
      profiles.some((profile) => String(profile?.serviceDescription || "").trim().length > 0);

    if (approvalStatus === "approved") {
      return { name: "VendorDashboard" };
    }

    if (approvalStatus === "pending" || svc.serviceStatus === "PendingApproval") {
      return { name: "VendorApprovalWaiting", params: { vendorData: vendor } };
    }

    if (approvalStatus === "rejected") {
      return { name: "VendorDashboard" };
    }

    if (!svc.kyc?.submitted && kycStatus !== "submitted" && kycStatus !== "approved") {
      return { name: "VendorKYC" };
    }

    if (!hasAnyPhotos) {
      return { name: "VendorPhotos" };
    }

    if (!hasAnyPackages) {
      return { name: "VendorPackages" };
    }

    if (!hasAnyDetails) {
      return {
        name: "VendorServicePage",
        params: { category: vendor?.category, openEditor: true },
      };
    }

    return { name: "VendorDashboard" };
  };

  const registerVendor = async (vendorData = {}) => {
    try {
      const phone = String(vendorData.mobile || vendorData.phone || "").trim();
      const email = String(vendorData.email || "").trim().toLowerCase();
      const services = Array.isArray(vendorData.services)
        ? vendorData.services.map((item) => String(item || "").trim()).filter(Boolean)
        : vendorData.category
        ? [String(vendorData.category).trim()]
        : [];

      const response = await fetchJson(`${API_BASE_URL}/api/vendors/register`, {
        method: "POST",
        body: JSON.stringify({
          businessName: String(vendorData.businessName || "").trim(),
          ownerName: String(vendorData.ownerName || "").trim(),
          phone,
          email,
          password: String(vendorData.password || "").trim(),
          services,
          city: String(vendorData.city || "").trim(),
          location: String(vendorData.location || "").trim(),
          startingPrice: String(vendorData.startingPrice || "").trim(),
          imageName: String(vendorData.imageName || "").trim(),
          description: String(vendorData.description || "").trim(),
        }),
      });

      const newVendor = mapVendor({
        ...vendorData,
        ...(response?.data || {}),
        status: response?.data?.approvalStatus || "KYC Pending",
      });

      setVendors((prev) => [newVendor, ...prev.filter((item) => item.id !== newVendor.id)]);
      setCurrentVendor(newVendor);
      setVendorServices((prev) => ({
        ...prev,
        [newVendor.id]: mergeVendorServiceFromVendor(prev[newVendor.id], newVendor),
      }));

      return { success: true, vendor: newVendor, message: response?.message };
    } catch (error) {
      return { success: false, message: error.message || "Vendor registration failed." };
    }
  };

  const registerVendorLocal = (vendorData = {}) => {
    const newVendor = mapVendor({
      id: createId("VENDOR"),
      status: "Registered",
      createdAt: new Date().toISOString(),
      ...vendorData,
    });

    setVendors((prev) => [newVendor, ...prev]);
    setCurrentVendor(newVendor);
    setVendorServices((prev) => ({
      ...prev,
      [newVendor.id]: createVendorService(newVendor),
    }));

    return newVendor;
  };

  const loginVendor = async (mobile, password) => {
    try {
      const response = await fetchJson(`${API_BASE_URL}/api/vendors/login`, {
        method: "POST",
        body: JSON.stringify({
          identifier: mobile,
          password,
        }),
      });

      const vendor = mapVendor(response?.data || {});
      setCurrentVendor(vendor);
    setVendors((prev) => [vendor, ...prev.filter((item) => item.id !== vendor.id)]);
    setVendorServices((prev) => ({
      ...prev,
      [vendor.id]: mergeVendorServiceFromVendor(prev[vendor.id], vendor),
    }));
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(`vendorSession:${String(vendor.id)}`, JSON.stringify(vendor));
      } catch (error) {
        // ignore storage failures
      }
    }
    loadVendorBookings(vendor.id);

      return {
        success: true,
        vendor,
        message: response?.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Invalid vendor mobile number or password.",
      };
    }
  };

  const logoutVendor = async () => {
    try {
      await fetchJson(`${API_BASE_URL}/api/vendors/logout`, {
        method: "POST",
      });
    } catch (error) {
      // Logout should still succeed locally even if the backend is unavailable.
    }

    setCurrentVendor(null);
    if (typeof window !== "undefined" && window.localStorage && currentVendor?.id) {
      try {
        window.localStorage.removeItem(`vendorSession:${String(currentVendor.id)}`);
      } catch (error) {
        // ignore storage failures
      }
    }
    setNotifications([]);
  };

  const updateVendorProfile = async (vendorId, profileData = {}) => {
    if (!vendorId) {
      return { success: false, message: "Please login as vendor again." };
    }

    try {
      const response = await fetchJson(`${API_BASE_URL}/api/vendors/${vendorId}`, {
        method: "PUT",
        body: JSON.stringify(profileData),
      });
      const vendor = mapVendor(response?.data || {});
      setCurrentVendor(vendor);
      setVendors((prev) => [vendor, ...prev.filter((item) => String(item.id) !== String(vendorId))]);
      setVendorServices((prev) => ({
        ...prev,
        [vendor.id]: mergeVendorServiceFromVendor(prev[vendor.id], vendor),
      }));
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          window.localStorage.setItem(`vendorSession:${String(vendor.id)}`, JSON.stringify(vendor));
        } catch (error) {
          // ignore storage failures
        }
      }
      await loadWeddingServices();
      return { success: true, vendor, message: response?.message || "Vendor profile updated." };
    } catch (error) {
      const vendor = mapVendor({ ...(currentVendor || {}), ...profileData });
      setCurrentVendor(vendor);
      setVendors((prev) => [vendor, ...prev.filter((item) => String(item.id) !== String(vendorId))]);
      return { success: false, vendor, message: error.message || "Saved locally. Backend update failed." };
    }
  };

  const getVendorService = (vendorId) =>
    vendorServices[vendorId] || createVendorService({ id: vendorId });

  const updateVendorService = (vendorId, updater, options = {}) => {
    if (!vendorId) return;

    const currentService = vendorServices[vendorId] || createVendorService({ id: vendorId });
    const optimisticService =
      typeof updater === "function" ? updater(currentService) : { ...currentService, ...updater };

    setVendorServices((prev) => {
      const existing = prev[vendorId] || createVendorService({ id: vendorId });
      const nextService =
        typeof updater === "function" ? updater(existing) : { ...existing, ...updater };

      return {
        ...prev,
        [vendorId]: nextService,
      };
    });

    if (options.persist !== false) {
      persistVendorServiceProfile(vendorId, optimisticService);
    }
  };

  const updateVendorKyc = (vendorId, kyc) => {
    updateVendorService(vendorId, (svc) => ({
      ...svc,
      kyc: {
        ...(svc.kyc || {}),
        ...kyc,
        submitted: true,
      },
    }));
  };

  const updateVendorPhotos = async (vendorId, photos, options = {}) => {
    const nextPhotos = Array.isArray(photos) ? photos : [];
    const serviceCategory = options.serviceCategory || "";
    const serviceProfileKey = getServiceProfileKey(serviceCategory);

    updateVendorService(
      vendorId,
      (svc) => {
        const nextProfile = {
          ...(svc.serviceProfiles?.[serviceProfileKey] || {}),
          photos: nextPhotos,
          serviceDescription: options.serviceDescription ?? svc.serviceDescription,
        };

        return {
          ...svc,
          photos: nextPhotos,
          serviceDescription: serviceCategory
            ? options.serviceDescription ?? svc.serviceDescription
            : options.serviceDescription ?? svc.serviceDescription,
          serviceProfiles: {
            ...(svc.serviceProfiles || {}),
            [serviceProfileKey]: nextProfile,
          },
        };
      },
      { persist: false }
    );

    const uploadedPhotos = await Promise.all(
      nextPhotos.map(async (photo, index) => {
        const uploadedUri = await uploadVendorAsset(
          photo?.uri,
          photo?.isCover ? "service-cover" : `service-photo-${index + 1}`
        );

        return {
          ...photo,
          uri: uploadedUri || photo?.uri || "",
        };
      })
    );

    const normalizedPhotos = uploadedPhotos.map(mapVendorPhoto);

    updateVendorService(vendorId, (svc) => {
      const nextProfile = {
        ...(svc.serviceProfiles?.[serviceProfileKey] || {}),
        photos: normalizedPhotos,
        serviceDescription: options.serviceDescription ?? svc.serviceDescription,
      };

      return {
        ...svc,
        photos: normalizedPhotos,
        serviceDescription: serviceCategory
          ? options.serviceDescription ?? svc.serviceDescription
          : options.serviceDescription ?? svc.serviceDescription,
        serviceProfiles: {
          ...(svc.serviceProfiles || {}),
          [serviceProfileKey]: nextProfile,
        },
      };
    });

    return { success: true, photos: normalizedPhotos };
  };

  const updateVendorPackages = (vendorId, packages, options = {}) => {
    const nextPackages = Array.isArray(packages) ? packages : [];
    const serviceCategory = options.serviceCategory || "";
    const serviceProfileKey = getServiceProfileKey(serviceCategory);

    updateVendorService(
      vendorId,
      (svc) => {
        const nextProfile = {
          ...(svc.serviceProfiles?.[serviceProfileKey] || {}),
          packages: nextPackages,
        };

        return {
          ...svc,
          packages: nextPackages,
          serviceProfiles: {
            ...(svc.serviceProfiles || {}),
            [serviceProfileKey]: nextProfile,
          },
        };
      },
      { persist: options.persist !== false }
    );
  };

  const updateVendorServiceDetails = (vendorId, serviceDetails, options = {}) => {
    const nextDetails = serviceDetails || {};
    const serviceCategory = options.serviceCategory || "";
    const serviceProfileKey = getServiceProfileKey(serviceCategory);

    updateVendorService(
      vendorId,
      (svc) => {
        const nextProfile = {
          ...(svc.serviceProfiles?.[serviceProfileKey] || {}),
          serviceDetails: nextDetails,
        };

        return {
          ...svc,
          serviceDetails: nextDetails,
          serviceProfiles: {
            ...(svc.serviceProfiles || {}),
            [serviceProfileKey]: nextProfile,
          },
        };
      },
      { persist: options.persist !== false }
    );
  };

  const submitVendorForApproval = async (vendorId) => {
    const vendor =
      vendors.find((item) => String(item.id) === String(vendorId)) || currentVendor;
    const svc = getVendorService(vendorId);
    const kyc = svc.kyc || {};
    const profiles = Object.values(svc.serviceProfiles || {});
    const photos = profiles.flatMap((profile) => (Array.isArray(profile?.photos) ? profile.photos : []));
    const coverPhoto = photos.find((photo) => photo?.isCover) || photos[0] || svc.photos?.[0] || {};
    const packages = profiles.flatMap((profile) => (Array.isArray(profile?.packages) ? profile.packages : []));
    const serviceDetails = profiles.reduce(
      (acc, profile) => ({
        ...acc,
        ...(profile?.serviceDetails || {}),
      }),
      svc.serviceDetails || {}
    );
    const packagePrices = packages
      .map((pkg) => Number(String(pkg?.price || "").replace(/[^\d.]/g, "")))
      .filter((price) => Number.isFinite(price) && price > 0);
    const startingPrice = packagePrices.length
      ? `₹${Math.min(...packagePrices)} onwards`
      : vendor?.startingPrice || "";
    const detailsText = Object.entries(serviceDetails)
      .filter(([, value]) => String(value || "").trim())
      .map(([key, value]) => `${key}: ${String(value).trim()}`)
      .join("\n");
    const packageText = packages
      .map((pkg) => `${pkg.name || "Package"} - ₹${pkg.price || "Contact"}${pkg.includes ? ` (${pkg.includes})` : ""}`)
      .join("\n");
    const description = [
      svc.serviceDescription || vendor?.description || "",
      detailsText,
      packageText ? `Packages:\n${packageText}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      let nextVendor = vendor;
      const uploadedKyc = {
        aadharFront: await uploadVendorAsset(kyc?.aadharFront, "aadhaar-front"),
        aadharBack: await uploadVendorAsset(kyc?.aadharBack, "aadhaar-back"),
        panPhoto: await uploadVendorAsset(kyc?.panPhoto, "pan-card"),
        gstPhoto: await uploadVendorAsset(kyc?.gstPhoto, "business-proof"),
      };
      const uploadedCover = await uploadVendorAsset(coverPhoto?.uri, "service-cover");

      if (vendorId && String(vendorId).indexOf("VENDOR") !== 0) {
        const response = await fetchJson(`${API_BASE_URL}/api/vendors/${vendorId}/kyc`, {
          method: "POST",
          body: JSON.stringify({
            idProofType: "Aadhaar/PAN",
            idProofNumber: kyc?.idProofNumber || "Uploaded",
            idProofDocument: uploadedKyc.aadharFront || uploadedKyc.panPhoto || "",
            businessDocument: uploadedKyc.gstPhoto || uploadedKyc.panPhoto || uploadedKyc.aadharFront || "",
            addressProofDocument: uploadedKyc.aadharBack || uploadedKyc.aadharFront || "",
            portfolioDocument: uploadedCover || "",
            description,
            startingPrice,
            imageName: uploadedCover || "",
          }),
        });
        nextVendor = mapVendor(response?.data || {});
      }

      updateVendorService(vendorId, {
        serviceStatus: "PendingApproval",
        photos: photos.map((photo) =>
          photo?.isCover && uploadedCover ? { ...photo, uri: uploadedCover } : photo
        ),
        kyc: {
          ...kyc,
          aadharFront: uploadedKyc.aadharFront || kyc?.aadharFront,
          aadharBack: uploadedKyc.aadharBack || kyc?.aadharBack,
          panPhoto: uploadedKyc.panPhoto || kyc?.panPhoto,
          gstPhoto: uploadedKyc.gstPhoto || kyc?.gstPhoto,
        },
      });
      setCurrentVendor((prev) =>
        prev && String(prev.id) === String(vendorId)
          ? mapVendor({ ...prev, ...nextVendor, status: "PendingApproval", approvalStatus: "Pending" })
          : prev
      );
      setVendors((prev) =>
        prev.map((item) =>
          String(item.id) === String(vendorId)
            ? mapVendor({ ...item, ...nextVendor, status: "PendingApproval", approvalStatus: "Pending" })
            : item
        )
      );
      loadAdminData();
      return { success: true, vendor: nextVendor };
    } catch (error) {
      return { success: false, message: error.message || "Unable to submit vendor for approval." };
    }
  };

  const getVendorNotifications = (vendorId) =>
    getVendorService(vendorId).notifications || [];

  const preserveVendorNotificationReadState = (existingNotifications = [], nextNotifications = []) => {
    const readMap = new Map(
      (Array.isArray(existingNotifications) ? existingNotifications : []).map((item) => [
        String(item.id),
        Boolean(item.read),
      ])
    );

    return (Array.isArray(nextNotifications) ? nextNotifications : []).map((item) => ({
      ...item,
      read: readMap.has(String(item.id)) ? readMap.get(String(item.id)) : Boolean(item.read),
    }));
  };

  const markVendorNotificationRead = (vendorId, notificationId) => {
    if (!vendorId || !notificationId) return;

    updateVendorService(
      vendorId,
      (svc) => ({
        ...svc,
        notifications: (svc.notifications || []).map((item) =>
          String(item.id) === String(notificationId) ? { ...item, read: true } : item
        ),
      }),
      { persist: false }
    );
  };

  const markAllVendorNotificationsRead = (vendorId) => {
    if (!vendorId) return;

    updateVendorService(
      vendorId,
      (svc) => ({
        ...svc,
        notifications: (svc.notifications || []).map((item) => ({ ...item, read: true })),
      }),
      { persist: false }
    );
  };

  const parseCurrencyAmount = (value = "") => {
    const numeric = Number(String(value || "").replace(/[^\d.]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const formatPaidAmount = (request = {}) => {
    if (request?.paidAmount !== undefined && request?.paidAmount !== null) {
      const paidAmount = Number(request.paidAmount);
      return Number.isFinite(paidAmount) ? paidAmount : 0;
    }

    const rawPaise = Number(request?.paymentAmount || 0);
    if (Number.isFinite(rawPaise) && rawPaise > 0 && String(rawPaise).length > 3) {
      return Math.round(rawPaise / 100);
    }

    if (request?.paymentAmount !== undefined && request?.paymentAmount !== null) {
      return Number.isFinite(rawPaise) ? rawPaise : 0;
    }

    const fromPrice = parseCurrencyAmount(request?.price || request?.basePrice || "");
    return fromPrice > 0 ? fromPrice : 0;
  };

  const buildVendorRevenue = (bookings = []) => {
    const transactions = bookings
      .filter((booking) => String(booking?.paymentStatus || "").toUpperCase() === "PAID")
      .map((booking) => {
        const amount = formatPaidAmount(booking);
        return {
          id: booking?.id,
          vendorId: booking?.vendorId,
          customerName: booking?.customerName || "Customer",
          serviceTitle: booking?.package || booking?.serviceTitle || "Wedding Service",
          package: booking?.package || booking?.serviceTitle || "Package",
          date: booking?.date || "",
          time: booking?.time || "",
          paidAt: booking?.paidAt || booking?.paymentVerifiedAt || booking?.updatedAt || "Just now",
          paymentMethod: "Razorpay",
          transactionId: booking?.transactionId || booking?.razorpayPaymentId || booking?.razorpayOrderId || "",
          paidAmount: amount,
          vendorEarning: amount,
          amount,
        };
      });

    const totalRevenue = transactions.reduce((sum, item) => sum + Number(item.vendorEarning || 0), 0);
    const pendingCollection = bookings
      .filter((booking) => String(booking?.paymentStatus || "").toUpperCase() !== "PAID")
      .reduce((sum, booking) => sum + formatPaidAmount(booking), 0);

    return {
      totalRevenue,
      paidBookings: transactions.length,
      pendingCollection,
      transactions,
    };
  };

  const getVendorRevenue = (vendorId) => {
    const svc = getVendorService(vendorId);
    const computedRevenue = buildVendorRevenue(svc.bookings || []);
    return {
      ...(svc.revenue || {}),
      ...computedRevenue,
    };
  };

  const mapRequestToVendorBooking = (request = {}) => {
    const status = String(request?.status || "").toUpperCase();
    const displayStatus =
      status === "APPROVED"
        ? "Confirmed"
        : status === "REJECTED"
        ? "Cancelled"
        : String(request?.paymentStatus || "").toUpperCase() === "PAID"
        ? "Payment Pending"
        : "Pending";
    const paymentStatus = String(request?.paymentStatus || "").toUpperCase() === "PAID"
      ? "Paid"
      : displayStatus === "Confirmed"
      ? "Confirmed"
      : "Not requested";

    return {
      id: request.id,
      requestId: request.id,
      serviceId: request.serviceId,
      customerName: request.userName || request.customerName || "Customer",
      customerPhone: request.phone || "",
      customerLocation: request.customerLocation || request.location || "",
      date: request.bookingDate || "Date not set",
      endDate: request.bookingEndDate || "",
      time: request.bookingTime || "",
      package: request.packageName || request.serviceTitle || request.category || "Wedding Service",
      amount: String(formatPaidAmount(request) || parseCurrencyAmount(request.price) || "").replace(/[^\d.]/g, ""),
      basePrice: request.price || "",
      status: displayStatus,
      paymentStatus,
      paidAmount: formatPaidAmount(request) || 0,
      paymentMethod: String(request?.paymentStatus || "").toUpperCase() === "PAID" ? "Razorpay" : "",
      transactionId: request?.razorpayPaymentId || request?.razorpayOrderId || "",
      paidAt: request?.paymentVerifiedAt || request?.paidAt || "",
      invoiceNumber: request?.invoiceNumber || `INV-${String(request?.id || "").padStart(6, "0")}`,
      invoiceDate: request?.invoiceDate || request?.paymentVerifiedAt || request?.requestedAt || "",
      invoiceAmount: request?.invoiceAmount ?? formatPaidAmount(request),
      invoiceStatus: request?.invoiceStatus || String(request?.status || "").toUpperCase(),
      invoiceReference: request?.invoiceReference || request?.razorpayPaymentId || request?.razorpayOrderId || "",
      invoice: buildInvoiceFromRequest(request),
      workflowStage:
        paymentStatus === "Paid"
          ? "Payment received"
          : displayStatus === "Confirmed"
          ? "Booking confirmed"
          : displayStatus === "Cancelled"
          ? "Booking cancelled"
          : "Waiting for approval",
      notes: request.adminMessage || "",
      statusHistory: [
        { status: displayStatus, time: request.statusUpdatedAt || request.requestedAt || "Just now" },
      ],
    };
  };

  const buildVendorBookingNotification = (booking = {}) => {
    const status = String(booking?.status || "").toLowerCase();
    const serviceName = booking?.package || booking?.serviceTitle || "Wedding Service";
    const customerName = booking?.customerName || "Customer";
    const vendorId = booking?.vendorId || currentVendor?.id || null;
    const latestHistory = Array.isArray(booking?.statusHistory) && booking.statusHistory.length
      ? booking.statusHistory[booking.statusHistory.length - 1]
      : null;

    let title = "New Booking Request";
    let message = `${customerName} submitted a booking request for ${serviceName}.`;
    let type = "SERVICE_BOOKING_REQUEST";

    if (status === "accepted") {
      title = "Booking Accepted";
      message = `${customerName}'s booking for ${serviceName} was accepted.`;
      type = "SERVICE_BOOKING_APPROVED";
    } else if (status === "rejected") {
      title = "Booking Rejected";
      message = `${customerName}'s booking for ${serviceName} was rejected.`;
      type = "SERVICE_BOOKING_REJECTED";
    } else if (status === "payment pending") {
      title = "Payment Received";
      message = `${customerName} paid for ${serviceName}. Please confirm or reject it.`;
      type = "SERVICE_BOOKING_REQUEST";
    }

    return {
      id: `BOOKING_NOTI_${booking?.requestId || booking?.id || createId("BOOKING")}_${status || "pending"}`,
      to: "vendor",
      userId: vendorId,
      type,
      title,
      message,
      requestId: booking?.requestId || booking?.id || null,
      time: booking?.paidAt || latestHistory?.time || "Now",
      read: false,
      createdAt: new Date().toISOString(),
    };
  };

  const loadVendorBookings = async (vendorId = currentVendor?.id) => {
    if (!vendorId || String(vendorId).indexOf("VENDOR") === 0) {
      return [];
    }

    try {
      const response = await fetchJson(`${API_BASE_URL}/api/vendors/${vendorId}/service-requests`);
      const bookings = Array.isArray(response?.data)
        ? response.data.map((item) => mapRequestToVendorBooking(mapServiceRequest(item)))
        : [];
      const bookingNotifications = preserveVendorNotificationReadState(
        getVendorService(vendorId).notifications || [],
        bookings.map(buildVendorBookingNotification)
      );
      updateVendorService(
        vendorId,
        (svc) => ({
          ...svc,
          bookings,
          revenue: buildVendorRevenue(bookings),
          notifications: bookingNotifications,
        }),
        { persist: false }
      );
      return bookings;
    } catch (error) {
      return [];
    }
  };

  const updateVendorBookingStatus = async (vendorId, bookingId, nextStatus, bookingSnapshot = null) => {
    const currentService = getVendorService(vendorId);
    const currentBookings = currentService.bookings || [];
    const existingBooking = currentBookings.find(
      (booking) =>
        String(booking.id) === String(bookingId) ||
        String(booking.requestId) === String(bookingId)
    );
    const fallbackBooking =
      bookingSnapshot && bookingSnapshot.id
        ? bookingSnapshot
        : {
            id: bookingId,
            requestId: bookingId,
            status: "Pending",
            paymentStatus: "Not requested",
            statusHistory: [],
          };

    const sourceBooking = existingBooking || fallbackBooking;
    const updatedBooking = {
      ...sourceBooking,
      id: sourceBooking.id || bookingId,
      requestId: sourceBooking.requestId || bookingId,
      status: nextStatus,
      paymentStatus:
        nextStatus === "Confirmed"
          ? "Confirmed"
          : nextStatus === "Cancelled"
          ? "Cancelled"
          : sourceBooking.paymentStatus,
      workflowStage:
        nextStatus === "Confirmed"
          ? "Booking confirmed"
          : nextStatus === "Cancelled"
          ? "Booking cancelled"
          : sourceBooking.workflowStage,
      statusHistory: [
        ...(sourceBooking.statusHistory || []),
        { status: nextStatus, time: "Just now" },
      ],
    };
    const nextBookings = existingBooking
      ? currentBookings.map((booking) =>
          String(booking.id) === String(bookingId) ||
          String(booking.requestId) === String(bookingId)
            ? updatedBooking
            : booking
        )
      : [updatedBooking, ...currentBookings];

    updateVendorService(
      vendorId,
      {
        ...currentService,
        bookings: nextBookings,
        revenue: buildVendorRevenue(nextBookings),
        notifications: preserveVendorNotificationReadState(
          currentService.notifications || [],
          nextBookings.map(buildVendorBookingNotification)
        ),
      },
      { persist: false }
    );

    const buildRequestFallback = (backendStatus) =>
      mapServiceRequest({
        id: bookingId,
        status: backendStatus,
        adminMessage: formatServiceStatusMessage(language, backendStatus, "Wedding Service"),
        serviceId: updatedBooking?.serviceId,
        serviceTitle: updatedBooking?.package,
        category: updatedBooking?.category,
        location: updatedBooking?.location,
        price: updatedBooking?.basePrice || updatedBooking?.amount,
        userId: updatedBooking?.userId,
        userName: updatedBooking?.customerName,
        phone: updatedBooking?.customerPhone,
        customerLocation: updatedBooking?.customerLocation,
        bookingDate: updatedBooking?.date,
        bookingEndDate: updatedBooking?.endDate,
        bookingTime: updatedBooking?.time,
      });

    if (nextStatus === "Confirmed" || nextStatus === "Cancelled") {
      const backendStatus = nextStatus === "Cancelled" ? "Rejected" : "Approved";
      const response = await fetchJson(
        `${API_BASE_URL}/api/vendors/${vendorId}/service-requests/${bookingId}/status`,
        {
          method: "POST",
          body: JSON.stringify({
            status: backendStatus,
            adminMessage: formatServiceStatusMessage(language, backendStatus, "Wedding Service"),
          }),
        }
      ).catch(() => null);
      const mappedRequest = response?.data
        ? mapServiceRequest(response.data)
        : buildRequestFallback(backendStatus);

      setServiceRequests((prev) => {
        const exists = prev.some((item) => String(item.id) === String(bookingId));
        if (exists) {
          return prev.map((item) =>
            String(item.id) === String(bookingId) ? { ...item, ...mappedRequest } : item
          );
        }
        return [mappedRequest, ...prev];
      });
      setAdminServiceRequests((prev) => {
        const exists = prev.some((item) => String(item.id) === String(bookingId));
        if (exists) {
          return prev.map((item) =>
            String(item.id) === String(bookingId) ? { ...item, ...mappedRequest } : item
          );
        }
        return [mappedRequest, ...prev];
      });
      await Promise.allSettled([
        loadVendorBookings(vendorId),
        loadAdminServiceRequests(),
        loadAdminData(),
      ]);
    }

    return { ok: true, booking: updatedBooking };
  };

  const loadVendorApprovals = async () => {
    try {
      const response = await fetchJson(`${API_BASE_URL}/api/admin/vendor-approvals`);
      const requests = Array.isArray(response?.data)
        ? response.data.map(mapVendor)
        : [];
      setVendorApprovalRequests(requests);
      return requests;
    } catch (error) {
      return [];
    }
  };

  const approveVendor = async (vendorId, adminMessage = "Vendor approved successfully.") => {
    try {
      const response = await fetchJson(
        `${API_BASE_URL}/api/admin/vendor-approvals/${vendorId}/approve`,
        {
          method: "POST",
          body: JSON.stringify({ adminMessage }),
        }
      );
      const vendor = mapVendor(response?.data || {});
      setVendorApprovalRequests((prev) =>
        prev.filter((item) => String(item.id) !== String(vendorId))
      );
      setVendors((prev) => [
        vendor,
        ...prev.filter((item) => String(item.id) !== String(vendorId)),
      ]);
      setVendorServices((prev) => {
        const current = prev[vendorId] || createVendorService(vendor);
        return {
          ...prev,
          [vendorId]: {
            ...current,
            serviceStatus: "Live",
          },
        };
      });
      await Promise.allSettled([loadWeddingServices(), loadAdminData()]);
      return { success: true, message: response?.message, vendor };
    } catch (error) {
      return { success: false, message: error.message || "Unable to approve vendor." };
    }
  };

  const rejectVendor = async (vendorId, adminMessage = "Vendor KYC rejected.") => {
    try {
      const response = await fetchJson(
        `${API_BASE_URL}/api/admin/vendor-approvals/${vendorId}/reject`,
        {
          method: "POST",
          body: JSON.stringify({ adminMessage }),
        }
      );
      setVendorApprovalRequests((prev) =>
        prev.filter((item) => String(item.id) !== String(vendorId))
      );
      await loadAdminData();
      return { success: true, message: response?.message };
    } catch (error) {
      return { success: false, message: error.message || "Unable to reject vendor." };
    }
  };

  const refreshData = async () => {
    await Promise.allSettled([loadApprovedProfiles(), loadWeddingServices(), loadAdminData()]);
  };

  const value = useMemo(
    () => ({
      profiles,
      services,
      wishlist,
      notifications,
      myProfile,
      currentUser,
      currentVendor,
      vendors,
      vendorServices,
      allUsers,
      interests,
      verificationRequests,
      approvalRequests,
      vendorApprovalRequests,
      serviceRequests,

      addNotification,
      getUserNotifications,
      getAdminNotifications,
      getAdminVendorNotifications,
      getUnreadUserNotificationCount,
      getUnreadAdminNotificationCount,
      markNotificationRead,
      hydrateUserSession,
      clearUserSession,
      loadServiceRequests,
      loadAdminServiceRequests,
      language,
      setLanguage,
      isDarkMode,
      setIsDarkMode,
      toggleDarkMode,
      appTheme,
      loadCurrentUserData,
      loadAdminData,
      loadWeddingServices,
      refreshData,
      uploadVendorAsset,

      addToWishlist,
      removeFromWishlist,

      sendServiceRequest,
      registerServiceCustomerAndSendRequest,
      updateServiceRequestStatus,
      getPendingServiceRequests,
      getApprovedServiceRequests,
      getRejectedServiceRequests,
      getLatestServiceRequest,
      serviceCustomer,
      hasApprovedServiceBooking,
      adminServiceRequests,
      getLatestServiceBookingDecision,

      saveMyProfile,

      submitProfileForApproval,
      approveProfile,
      rejectProfile,
      getPendingApprovalRequests,
      getApprovedApprovalRequests,
      getRejectedApprovalRequests,

      sendInterest,
      updateInterestStatus,
      getInterestStatus,
      getPublicProfileDetails,
      getConversation,
      getPresence,
      sendChatMessage,

      submitVerificationRequest,
      updateVerificationStatus,
      getPendingVerificationRequests,
      getApprovedVerificationRequests,
      getRejectedVerificationRequests,

      loadPremiumPlans,
      createPremiumOrder,
      verifyPremiumPayment,
      hasSilverAccess,
      hasGoldAccess,
      sendVendorOtp,
      verifyVendorOtp,
      registerServiceCustomer,
      registerVendor,
      registerVendorLocal,
      loginVendor,
      logoutVendor,
      updateVendorProfile,
      setCurrentVendor,
      setVendors,
      getVendorService,
      getVendorSetupRoute,
      getVendorNotifications,
      markVendorNotificationRead,
      markAllVendorNotificationsRead,
      getVendorRevenue,
      buildInvoiceFromRequest,
      buildInvoiceDownloadPayload,
      getInvoiceDownloadUrl,
      downloadInvoice,
      loadVendorBookings,
      updateVendorKyc,
      updateVendorPhotos,
      updateVendorPackages,
      updateVendorServiceDetails,
      createServiceBookingOrder,
      verifyServiceBookingPayment,
      submitVendorForApproval,
      updateVendorBookingStatus,
      loadVendorApprovals,
      approveVendor,
      rejectVendor,
      getVendorServiceProfile,

      setProfiles,
      setAllUsers,
      setServices,
      setNotifications,
      setApprovalRequests,
      setVendorApprovalRequests,
      setVerificationRequests,
      setServiceRequests,
      setAdminServiceRequests,
    }),
    [
      profiles,
      services,
      wishlist,
      notifications,
      myProfile,
      currentUser,
      allUsers,
      interests,
      verificationRequests,
      approvalRequests,
      vendorApprovalRequests,
      serviceRequests,
      adminServiceRequests,
      serviceCustomerState,
      vendors,
      currentVendor,
      vendorServices,
      vendorServices,
      language,
      isDarkMode,
      appTheme,
    ]
  );

  return (
    <MatrimonyContext.Provider value={value}>
      {children}
    </MatrimonyContext.Provider>
  );
}

export function useMatrimony() {
  const context = useContext(MatrimonyContext);

  if (!context) {
    throw new Error("useMatrimony must be used inside MatrimonyProvider");
  }

  return context;
}

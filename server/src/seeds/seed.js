import mongoose from 'mongoose';
import { DemoHospital } from '../models/DemoHospital.js';
import { connectDB } from '../config/db.js';
import { env } from '../config/env.js';

// Coordinates generation function around a center (adds slight variation)
const generateCoords = (centerLat, centerLng, offsetIndex) => {
  // Simple offset method keeping hospitals within ~1-5km radius
  // 0.01 degree latitude is approx 1.1km
  // 0.01 degree longitude is approx 0.85km (at 40 deg lat)
  const factor = 0.007; // scale factor
  const angle = (offsetIndex * 2 * Math.PI) / 20; // 20 positions
  const radiusOffset = (offsetIndex % 3 === 0 ? 0.005 : offsetIndex % 2 === 0 ? 0.015 : 0.025);
  
  const lat = centerLat + Math.sin(angle) * radiusOffset;
  const lng = centerLng + Math.cos(angle) * radiusOffset;

  return [lng, lat]; // GeoJSON format: [longitude, latitude]
};

const hospitalsData = [
  {
    name: "Metro Care General Hospital",
    slug: "metro-care-general-hospital",
    description: "State-of-the-art medical center offering multi-specialty care and 24/7 advanced trauma services.",
    address: "100 Broadway, Demo City",
    phone: "+1 (555) 019-2831",
    website: "https://metrocare.demo",
    email: "contact@metrocare.demo",
    externalRating: 4.6,
    externalReviewCount: 154,
    openingHours: ["Monday - Sunday: 12:00 AM - 11:59 PM"],
    ownershipType: "private",
    specialties: ["Emergency Medicine", "Cardiology", "Oncology", "Neurology", "Surgery"],
    facilities: ["ICU", "24/7 Pharmacy", "Diagnostic Lab", "Ventilators", "Blood Bank"],
    emergencyAvailable: true,
    ambulanceNumber: "+1 (555) 019-9991",
    insuranceAccepted: ["Medicare", "Blue Cross", "Aetna", "UnitedHealth"],
    wheelchairAccessible: true
  },
  {
    name: "Grace Community Clinic",
    slug: "grace-community-clinic",
    description: "Charitable community clinic offering primary care, family medicine, and minor surgical procedures.",
    address: "240 Elm St, Demo City",
    phone: "+1 (555) 019-4822",
    website: null,
    email: "info@graceclinic.demo",
    externalRating: 4.8,
    externalReviewCount: 42,
    openingHours: ["Monday - Friday: 8:00 AM - 6:00 PM", "Saturday: 9:00 AM - 2:00 PM"],
    ownershipType: "charitable",
    specialties: ["Primary Care", "Pediatrics", "Family Medicine"],
    facilities: ["Outpatient Lab", "Pharmacy"],
    emergencyAvailable: false,
    ambulanceNumber: "",
    insuranceAccepted: ["Medicare", "Medicaid", "Community Health Plan"],
    wheelchairAccessible: true
  },
  {
    name: "Beacon University Teaching Hospital",
    slug: "beacon-university-teaching-hospital",
    description: "Leading research and teaching hospital with dedicated institutes for cardiovascular and neurological sciences.",
    address: "750 Academic Way, Demo City",
    phone: "+1 (555) 019-7389",
    website: "https://beacon-teaching.demo",
    email: "outreach@beacon.demo",
    externalRating: 4.2,
    externalReviewCount: 210,
    openingHours: ["Monday - Sunday: 12:00 AM - 11:59 PM"],
    ownershipType: "teaching",
    specialties: ["Neurology", "Cardiology", "Orthopedics", "Research Medicine"],
    facilities: ["ICU", "NICU", "Maternity Ward", "Diagnostic Lab", "Research Labs"],
    emergencyAvailable: true,
    ambulanceNumber: "+1 (555) 019-9992",
    insuranceAccepted: ["Blue Cross", "Aetna", "Cigna", "Humana"],
    wheelchairAccessible: true
  },
  {
    name: "City Municipal Hospital",
    slug: "city-municipal-hospital",
    description: "Public hospital managed by the city administration, ensuring affordable care for all residents.",
    address: "415 Government Plaza, Demo City",
    phone: "+1 (555) 019-3221",
    website: "https://citymunicipal.demo",
    email: "municipal@hospital.demo",
    externalRating: 3.9,
    externalReviewCount: 88,
    openingHours: ["Monday - Sunday: 12:00 AM - 11:59 PM"],
    ownershipType: "government",
    specialties: ["Emergency Medicine", "General Surgery", "Internal Medicine", "OB/GYN"],
    facilities: ["ICU", "Pharmacy", "Diagnostic Lab", "Ambulance Fleet"],
    emergencyAvailable: true,
    ambulanceNumber: "+1 (555) 019-9990",
    insuranceAccepted: ["Medicare", "Medicaid", "State Health Plan"],
    wheelchairAccessible: true
  },
  {
    name: "Sacred Heart Pediatric Hospital",
    slug: "sacred-heart-pediatric-hospital",
    description: "Specialized children's hospital with kid-friendly environments and highly experienced pediatricians.",
    address: "310 Kids Care Blvd, Demo City",
    phone: "+1 (555) 019-9821",
    website: "https://sacredheartchildren.demo",
    email: "peds@sacredheart.demo",
    externalRating: 4.7,
    externalReviewCount: 75,
    openingHours: ["Monday - Sunday: 12:00 AM - 11:59 PM"],
    ownershipType: "private",
    specialties: ["Pediatrics", "Pediatric Surgery", "Neonatology", "Child Psychology"],
    facilities: ["NICU", "Playrooms", "Pediatric ICU", "24/7 Pharmacy"],
    emergencyAvailable: true,
    ambulanceNumber: "+1 (555) 019-9993",
    insuranceAccepted: ["Blue Cross", "UnitedHealth", "Aetna", "Medicaid"],
    wheelchairAccessible: true
  },
  {
    name: "Lakeside Orthopedic Center",
    slug: "lakeside-orthopedic-center",
    description: "Dedicated specialty center for bone and joint surgery, physical therapy, and sports medicine.",
    address: "12 Lakeside Dr, Demo City",
    phone: "+1 (555) 019-1144",
    website: "https://lakesideortho.demo",
    email: "appointments@lakesideortho.demo",
    externalRating: 4.5,
    externalReviewCount: 39,
    openingHours: ["Monday - Friday: 7:00 AM - 7:00 PM", "Saturday: 8:00 AM - 12:00 PM"],
    ownershipType: "private",
    specialties: ["Orthopedics", "Sports Medicine", "Physical Therapy"],
    facilities: ["MRI Lab", "Physical Therapy Room", "Surgical Suites"],
    emergencyAvailable: false,
    ambulanceNumber: "",
    insuranceAccepted: ["Blue Cross", "Aetna", "Cigna", "UnitedHealth"],
    wheelchairAccessible: true
  },
  {
    name: "Hope Charity Eye Hospital",
    slug: "hope-charity-eye-hospital",
    description: "Non-profit ophthalmic center offering free vision screenings and affordable eye surgeries.",
    address: "55 Vision Way, Demo City",
    phone: "+1 (555) 019-5500",
    website: "https://hopeeye.demo",
    email: "care@hopeeye.demo",
    externalRating: 4.9,
    externalReviewCount: 18,
    openingHours: ["Monday - Friday: 9:00 AM - 5:00 PM"],
    ownershipType: "charitable",
    specialties: ["Ophthalmology", "Optometry"],
    facilities: ["Lasik Suite", "Optical Shop", "Eye Diagnostic Center"],
    emergencyAvailable: false,
    ambulanceNumber: "",
    insuranceAccepted: ["Medicaid", "Free Care Program"],
    wheelchairAccessible: true
  },
  {
    name: "Northside Emergency Clinic",
    slug: "northside-emergency-clinic",
    description: "A fast-track urgent care and emergency response station for northern neighborhoods.",
    address: "990 North Rd, Demo City",
    phone: "+1 (555) 019-8732",
    website: null,
    email: null,
    externalRating: 4.1,
    externalReviewCount: 110,
    openingHours: ["Monday - Sunday: 12:00 AM - 11:59 PM"],
    ownershipType: "private",
    specialties: ["Emergency Medicine", "Urgent Care"],
    facilities: ["Trauma Room", "X-Ray Lab", "Pharmacy Counter"],
    emergencyAvailable: true,
    ambulanceNumber: "+1 (555) 019-9994",
    insuranceAccepted: ["Medicare", "Blue Cross", "Aetna", "UnitedHealth", "Cigna"],
    wheelchairAccessible: true
  },
  {
    name: "Valley Maternity Home",
    slug: "valley-maternity-home",
    description: "A warm and professional maternity home providing prenatal care, delivery, and postpartum coaching.",
    address: "44 River Valley Rd, Demo City",
    phone: "+1 (555) 019-6161",
    website: "https://valleymaternity.demo",
    email: "deliveries@valleymaternity.demo",
    externalRating: 4.7,
    externalReviewCount: 52,
    openingHours: ["Monday - Sunday: 12:00 AM - 11:59 PM"],
    ownershipType: "private",
    specialties: ["OB/GYN", "Neonatology", "Midwifery"],
    facilities: ["Labor Suites", "Maternity Rooms", "Neonatal Nursery"],
    emergencyAvailable: true,
    ambulanceNumber: "+1 (555) 019-9995",
    insuranceAccepted: ["Blue Cross", "Aetna", "Cigna"],
    wheelchairAccessible: true
  },
  {
    name: "Crestview Psychiatric Center",
    slug: "crestview-psychiatric-center",
    description: "Specialized psychiatric care offering both inpatient treatment programs and outpatient therapy.",
    address: "102 Pine Crest Lane, Demo City",
    phone: "+1 (555) 019-4999",
    website: "https://crestviewpsych.demo",
    email: "help@crestviewpsych.demo",
    externalRating: 3.8,
    externalReviewCount: 31,
    openingHours: ["Monday - Sunday: 12:00 AM - 11:59 PM"],
    ownershipType: "government",
    specialties: ["Psychiatry", "Addiction Recovery", "Therapy"],
    facilities: ["Inpatient Beds", "Activity Center", "Consultation Rooms"],
    emergencyAvailable: true,
    ambulanceNumber: "+1 (555) 019-9990",
    insuranceAccepted: ["Medicare", "Medicaid", "State Health Plan"],
    wheelchairAccessible: true
  },
  {
    name: "Pioneer Geriatric Clinic",
    slug: "pioneer-geriatric-clinic",
    description: "Senior wellness clinic focusing on age-related healthcare, pain management, and occupational therapy.",
    address: "88 Silver Meadows Ave, Demo City",
    phone: "+1 (555) 019-2111",
    website: "https://pioneerseniors.demo",
    email: "seniors@pioneer.demo",
    externalRating: 4.4,
    externalReviewCount: 15,
    openingHours: ["Monday - Friday: 8:00 AM - 5:00 PM"],
    ownershipType: "private",
    specialties: ["Geriatrics", "Physical Therapy", "Internal Medicine"],
    facilities: ["Rehabilitation Gym", "Diagnostic Lab"],
    emergencyAvailable: false,
    ambulanceNumber: "",
    insuranceAccepted: ["Medicare", "Blue Cross", "UnitedHealth"],
    wheelchairAccessible: true
  },
  {
    name: "Westside Cardiac Specialist",
    slug: "westside-cardiac-specialist",
    description: "Specialized private heart clinic providing advanced cardiac diagnostic scans and pacemaker checkups.",
    address: "512 West Boulevard, Demo City",
    phone: "+1 (555) 019-8751",
    website: "https://westsidecardio.demo",
    email: "cardio@westside.demo",
    externalRating: 4.8,
    externalReviewCount: 61,
    openingHours: ["Monday - Friday: 8:00 AM - 6:00 PM"],
    ownershipType: "private",
    specialties: ["Cardiology"],
    facilities: ["EKG Lab", "Echocardiogram", "Stress Test Center"],
    emergencyAvailable: false,
    ambulanceNumber: "",
    insuranceAccepted: ["Blue Cross", "Aetna", "Cigna", "UnitedHealth"],
    wheelchairAccessible: false
  },
  {
    name: "Mercy Cancer Care Center",
    slug: "mercy-cancer-care-center",
    description: "Comprehensive oncology center providing chemotherapy, radiation therapy, and compassionate support.",
    address: "18 Hope Ave, Demo City",
    phone: "+1 (555) 019-9009",
    website: "https://mercycancer.demo",
    email: "support@mercycancer.demo",
    externalRating: 4.7,
    externalReviewCount: 45,
    openingHours: ["Monday - Friday: 8:00 AM - 6:00 PM"],
    ownershipType: "charitable",
    specialties: ["Oncology", "Hematology"],
    facilities: ["Chemo Suites", "Radiation Units", "Counseling Rooms"],
    emergencyAvailable: false,
    ambulanceNumber: "",
    insuranceAccepted: ["Medicare", "Blue Cross", "Aetna", "UnitedHealth", "Cancer Foundation Alliance"],
    wheelchairAccessible: true
  },
  {
    name: "Trinity Diagnostic & Urgent Care",
    slug: "trinity-diagnostic-urgent-care",
    description: "Walk-in clinic and imaging center featuring rapid-turnaround X-Ray, CT, and Ultrasound.",
    address: "818 Junction Dr, Demo City",
    phone: "+1 (555) 019-4554",
    website: "https://trinitydiagnostic.demo",
    email: "info@trinitydiagnostic.demo",
    externalRating: 4.0,
    externalReviewCount: 95,
    openingHours: ["Monday - Sunday: 8:00 AM - 10:00 PM"],
    ownershipType: "private",
    specialties: ["Urgent Care", "Radiology"],
    facilities: ["CT Scanner", "X-Ray Lab", "Ultrasound Rooms", "Pharmacy Counter"],
    emergencyAvailable: false,
    ambulanceNumber: "",
    insuranceAccepted: ["Blue Cross", "Aetna", "Cigna", "UnitedHealth"],
    wheelchairAccessible: true
  },
  {
    name: "Eastside Community Medical",
    slug: "eastside-community-medical",
    description: "Affordable family health clinic offering preventative physicals, vaccinations, and diabetic care.",
    address: "320 Sunrise Highway, Demo City",
    phone: "+1 (555) 019-1299",
    website: null,
    email: null,
    externalRating: 4.1,
    externalReviewCount: 22,
    openingHours: ["Monday - Friday: 9:00 AM - 5:00 PM", "Saturday: 9:00 AM - 1:00 PM"],
    ownershipType: "government",
    specialties: ["Primary Care", "Family Medicine", "Preventative Care"],
    facilities: ["Outpatient Lab"],
    emergencyAvailable: false,
    ambulanceNumber: "",
    insuranceAccepted: ["Medicare", "Medicaid", "Community Health Plus"],
    wheelchairAccessible: true
  },
  {
    name: "St. Jude Rehabilitation Hospital",
    slug: "st-jude-rehabilitation-hospital",
    description: "Post-surgery recovery and long-term stroke rehabilitation care center with professional nursing.",
    address: "70 Recovery Road, Demo City",
    phone: "+1 (555) 019-3333",
    website: "https://stjuderehab.demo",
    email: "admissions@stjuderehab.demo",
    externalRating: 4.6,
    externalReviewCount: 30,
    openingHours: ["Monday - Sunday: 12:00 AM - 11:59 PM"],
    ownershipType: "charitable",
    specialties: ["Rehabilitation", "Neurology", "Geriatrics"],
    facilities: ["Hydrotherapy Pool", "PT Gymnasium", "Occupational Therapy Suites"],
    emergencyAvailable: false,
    ambulanceNumber: "",
    insuranceAccepted: ["Medicare", "Blue Cross", "Aetna", "UnitedHealth"],
    wheelchairAccessible: true
  },
  {
    name: "Springfield General Clinic",
    slug: "springfield-general-clinic",
    description: "A local community clinic providing general consultation, health education, and immunization.",
    address: "99 Maple Ave, Demo City",
    phone: "+1 (555) 019-4411",
    website: null,
    email: null,
    externalRating: 3.5,
    externalReviewCount: 8,
    openingHours: ["Monday - Friday: 8:30 AM - 5:30 PM"],
    ownershipType: "unknown",
    specialties: ["Primary Care"],
    facilities: ["Consultation Clinic"],
    emergencyAvailable: false,
    ambulanceNumber: "",
    insuranceAccepted: ["Blue Cross", "Aetna", "Cash Pay"],
    wheelchairAccessible: true
  },
  {
    name: "Summit Specialty Surgery Center",
    slug: "summit-specialty-surgery-center",
    description: "Private ambulatory surgery center focusing on outpatient orthopedics, urology, and keyhole general surgeries.",
    address: "400 Summit View Blvd, Demo City",
    phone: "+1 (555) 019-8221",
    website: "https://summitsurgery.demo",
    email: "surgery@summitsurgery.demo",
    externalRating: 4.5,
    externalReviewCount: 14,
    openingHours: ["Monday - Friday: 6:00 AM - 4:00 PM"],
    ownershipType: "private",
    specialties: ["Surgery", "Orthopedics"],
    facilities: ["Operating Rooms", "Recovery Ward", "Diagnostics Suite"],
    emergencyAvailable: false,
    ambulanceNumber: "",
    insuranceAccepted: ["Blue Cross", "Aetna", "Cigna", "UnitedHealth"],
    wheelchairAccessible: true
  },
  {
    name: "Demo City Wellness Center",
    slug: "demo-city-wellness-center",
    description: "Preventative medicine and nutritional counseling clinic with holistic family care focus.",
    address: "88 Health St, Demo City",
    phone: "+1 (555) 019-7643",
    website: "https://wellnesscenter.demo",
    email: "consult@wellnesscenter.demo",
    externalRating: 4.3,
    externalReviewCount: 12,
    openingHours: ["Monday - Friday: 9:00 AM - 6:00 PM"],
    ownershipType: "private",
    specialties: ["Family Medicine", "Preventative Care"],
    facilities: ["Counseling Suite", "Dietary Clinic"],
    emergencyAvailable: false,
    ambulanceNumber: "",
    insuranceAccepted: ["Blue Cross", "Aetna"],
    wheelchairAccessible: true
  },
  {
    name: "Harbor View Trauma Clinic",
    slug: "harbor-view-trauma-clinic",
    description: "Dedicated urgent triage and trauma response clinic near the harbor docks.",
    address: "1 Harbor Plaza, Demo City",
    phone: "+1 (555) 019-0909",
    website: "https://harbortrauma.demo",
    email: "triage@harbortrauma.demo",
    externalRating: 4.4,
    externalReviewCount: 65,
    openingHours: ["Monday - Sunday: 12:00 AM - 11:59 PM"],
    ownershipType: "private",
    specialties: ["Emergency Medicine", "Surgery"],
    facilities: ["Trauma Bays", "Imaging Lab", "Ambulance Parking"],
    emergencyAvailable: true,
    ambulanceNumber: "+1 (555) 019-9996",
    insuranceAccepted: ["Medicare", "Blue Cross", "Aetna", "UnitedHealth"],
    wheelchairAccessible: true
  },
  {
    name: "Betul District Hospital",
    slug: "betul-district-hospital",
    description: "Main government hospital serving Betul district with emergency services.",
    address: "Sadar Bazar, Betul, Madhya Pradesh",
    phone: "+91 7141 234567",
    website: null,
    email: null,
    externalRating: 3.8,
    externalReviewCount: 120,
    openingHours: ["Monday - Sunday: 12:00 AM - 11:59 PM"],
    ownershipType: "government",
    specialties: ["Emergency Medicine", "General Surgery", "Internal Medicine"],
    facilities: ["ICU", "Blood Bank", "Diagnostic Lab"],
    emergencyAvailable: true,
    ambulanceNumber: "108",
    insuranceAccepted: ["Ayushman Bharat"],
    wheelchairAccessible: true,
    customCoordinates: [77.901500, 21.902500]
  },
  {
    name: "Sanjeevani Hospital & Research Center",
    slug: "sanjeevani-hospital-betul",
    description: "Private multi-specialty hospital providing advanced critical care.",
    address: "Kothi Bazar, Betul, Madhya Pradesh",
    phone: "+91 7141 987654",
    website: "https://sanjeevanibetul.demo",
    email: "info@sanjeevanibetul.demo",
    externalRating: 4.5,
    externalReviewCount: 85,
    openingHours: ["Monday - Sunday: 12:00 AM - 11:59 PM"],
    ownershipType: "private",
    specialties: ["Cardiology", "Orthopedics", "Pediatrics"],
    facilities: ["NICU", "24/7 Pharmacy", "Ventilators"],
    emergencyAvailable: true,
    ambulanceNumber: "+91 9876543210",
    insuranceAccepted: ["Star Health", "HDFC ERGO"],
    wheelchairAccessible: true,
    customCoordinates: [77.905000, 21.898000]
  },
  {
    name: "Padhar Hospital",
    slug: "padhar-hospital",
    description: "Charitable mission hospital well known for oncology and general healthcare in the region.",
    address: "Padhar, Betul District, Madhya Pradesh",
    phone: "+91 7141 232323",
    website: "https://padharhospital.demo",
    email: "contact@padharhospital.demo",
    externalRating: 4.8,
    externalReviewCount: 205,
    openingHours: ["Monday - Sunday: 12:00 AM - 11:59 PM"],
    ownershipType: "charitable",
    specialties: ["Oncology", "Ophthalmology", "General Medicine"],
    facilities: ["Radiation Units", "Eye Diagnostic Center", "Surgical Suites"],
    emergencyAvailable: true,
    ambulanceNumber: "108",
    insuranceAccepted: ["Ayushman Bharat", "Free Care Program"],
    wheelchairAccessible: true,
    customCoordinates: [77.899000, 21.905000]
  }
];

const seedHospitals = async () => {
  try {
    console.log('Seeding process started...');
    await connectDB();

    const resetMode = process.argv.includes('--reset') || process.argv.includes('-r');

    if (resetMode) {
      console.log('Reset flag supplied. Clearing current DemoHospital records...');
      await DemoHospital.deleteMany({});
      console.log('DemoHospital records deleted successfully.');
    }

    const centerLat = env.demoCenterLat;
    const centerLng = env.demoCenterLng;
    console.log(`Demo City Center loaded: Lat ${centerLat}, Lng ${centerLng}`);

    let seededCount = 0;

    for (let i = 0; i < hospitalsData.length; i++) {
      const hData = hospitalsData[i];
      
      // Check if hospital already exists by slug
      const existing = await DemoHospital.findOne({ slug: hData.slug });
      
      if (!existing) {
        const coordinates = hData.customCoordinates || generateCoords(centerLat, centerLng, i);
        
        const hospitalToCreate = { ...hData };
        delete hospitalToCreate.customCoordinates;

        await DemoHospital.create({
          ...hospitalToCreate,
          location: {
            type: 'Point',
            coordinates
          }
        });
        seededCount++;
      }
    }

    console.log(`Seeding complete. Added ${seededCount} new hospitals. Total hospitals: ${await DemoHospital.countDocuments()}`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding process encountered an error:', error.message);
    process.exit(1);
  }
};

seedHospitals();

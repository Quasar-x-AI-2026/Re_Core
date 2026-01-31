// Demo university data for preference engine as per choice

export const UNIVERSITY_DATA = [
  {
    id: "iit_bombay",
    name: "IIT Bombay",
    type: "IIT",
    location: "Mumbai",
    state: "Maharashtra",
    branches: ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Chemical Engineering", "Civil Engineering"],
    metrics: {
      ranking: 1,
      placementRate: 95,
      averagePackage: 18.5,
      researchOutput: 92,
      facultyRatio: 8,
      infrastructure: 95
    },
    cutoffs: {
      general: 67,
      obc: 1240,
      sc: 3570,
      st: 4680
    }
  },
  {
    id: "iit_delhi",
    name: "IIT Delhi",
    type: "IIT",
    location: "New Delhi",
    state: "Delhi",
    branches: ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Mathematics & Computing", "Civil Engineering"],
    metrics: {
      ranking: 2,
      placementRate: 94,
      averagePackage: 17.8,
      researchOutput: 90,
      facultyRatio: 9,
      infrastructure: 93
    },
    cutoffs: {
      general: 89,
      obc: 1456,
      sc: 3890,
      st: 5120
    }
  },
  {
    id: "bits_pilani",
    name: "BITS Pilani",
    type: "Private",
    location: "Pilani",
    state: "Rajasthan",
    branches: ["Computer Science", "Electronics", "Mechanical Engineering", "Chemical Engineering", "Civil Engineering"],
    metrics: {
      ranking: 8,
      placementRate: 89,
      averagePackage: 15.2,
      researchOutput: 78,
      facultyRatio: 12,
      infrastructure: 88
    },
    cutoffs: {
      general: 220,
      obc: 230,
      sc: 250,
      st: 270
    }
  },
  {
    id: "nit_trichy",
    name: "NIT Trichy",
    type: "NIT",
    location: "Tiruchirappalli",
    state: "Tamil Nadu",
    branches: ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Electronics", "Production Engineering"],
    metrics: {
      ranking: 9,
      placementRate: 87,
      averagePackage: 12.5,
      researchOutput: 75,
      facultyRatio: 15,
      infrastructure: 85
    },
    cutoffs: {
      general: 3450,
      obc: 5670,
      sc: 8900,
      st: 11200
    }
  },
  {
    id: "dtu",
    name: "Delhi Technological University",
    type: "State University",
    location: "New Delhi",
    state: "Delhi",
    branches: ["Computer Science", "Information Technology", "Electronics", "Mechanical Engineering", "Civil Engineering"],
    metrics: {
      ranking: 15,
      placementRate: 82,
      averagePackage: 10.8,
      researchOutput: 68,
      facultyRatio: 18,
      infrastructure: 80
    },
    cutoffs: {
      general: 5600,
      obc: 7800,
      sc: 12000,
      st: 15000
    }
  },
  {
    id: "iiit_hyderabad",
    name: "IIIT Hyderabad",
    type: "IIIT",
    location: "Hyderabad",
    state: "Telangana",
    branches: ["Computer Science", "Electronics & Communication"],
    metrics: {
      ranking: 12,
      placementRate: 91,
      averagePackage: 16.3,
      researchOutput: 85,
      facultyRatio: 10,
      infrastructure: 87
    },
    cutoffs: {
      general: 2100,
      obc: 3400,
      sc: 6700,
      st: 8900
    }
  },
  {
    id: "vit_vellore",
    name: "VIT Vellore",
    type: "Private",
    location: "Vellore",
    state: "Tamil Nadu",
    branches: ["Computer Science", "Electronics", "Mechanical Engineering", "Chemical Engineering", "Biotechnology"],
    metrics: {
      ranking: 18,
      placementRate: 78,
      averagePackage: 8.5,
      researchOutput: 62,
      facultyRatio: 20,
      infrastructure: 82
    },
    cutoffs: {
      general: 18000,
      obc: 22000,
      sc: 30000,
      st: 35000
    }
  },
  {
    id: "nit_surathkal",
    name: "NIT Karnataka Surathkal",
    type: "NIT",
    location: "Surathkal",
    state: "Karnataka",
    branches: ["Computer Science", "Information Technology", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering"],
    metrics: {
      ranking: 13,
      placementRate: 86,
      averagePackage: 11.8,
      researchOutput: 73,
      facultyRatio: 16,
      infrastructure: 83
    },
    cutoffs: {
      general: 4200,
      obc: 6100,
      sc: 9800,
      st: 12500
    }
  }
];

export const PREFERENCE_CRITERIA = [
  { id: "ranking", label: "Overall Ranking", description: "National ranking and reputation" },
  { id: "placementRate", label: "Placement Rate", description: "Percentage of students placed" },
  { id: "averagePackage", label: "Average Package", description: "Average annual salary (in LPA)" },
  { id: "researchOutput", label: "Research Output", description: "Quality and quantity of research" },
  { id: "facultyRatio", label: "Student-Faculty Ratio", description: "Lower is better - more personalized attention", inverted: true },
  { id: "infrastructure", label: "Infrastructure", description: "Campus facilities and resources" },
  { id: "homeState", label: "Home State Preference", description: "Preference for universities in your home state", custom: true },
  { id: "instituteType", label: "Institute Type Preference", description: "IIT > NIT > IIIT > Private > State", custom: true }
];

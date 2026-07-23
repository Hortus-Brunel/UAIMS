const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // 1. Permissions
  const permCodes = [
    "announcement:create:class","announcement:create:club",
    "announcement:create:department","announcement:create:faculty",
    "announcement:create:university","announcement:moderate:department",
    "announcement:moderate:faculty","announcement:moderate:university",
    "user:promote:l1","user:promote:l2","user:promote:l3",
    "user:manage:all","category:manage","reports:view"
  ];
  const perms = {};
  for (const code of permCodes) {
    perms[code] = await prisma.permission.upsert({ where:{code}, update:{}, create:{code} });
  }

  await prisma.levelPermission.deleteMany({});
  const lvlPerms = {
    L1_REP:["announcement:create:class","announcement:create:club"],
    L2_DEPT_ADMIN:["announcement:create:class","announcement:create:club","announcement:create:department","announcement:moderate:department","user:promote:l1"],
    L3_FACULTY_ADMIN:["announcement:create:department","announcement:create:faculty","announcement:moderate:faculty","user:promote:l1","user:promote:l2"],
    L4_UNIVERSITY_ADMIN:["announcement:create:faculty","announcement:create:university","announcement:moderate:university","user:promote:l1","user:promote:l2","user:promote:l3","category:manage","reports:view"],
    L5_SUPER_ADMIN:permCodes
  };
  for (const [level, codes] of Object.entries(lvlPerms)) {
    for (const code of codes) {
      if (perms[code]) await prisma.levelPermission.create({ data:{ accessLevel:level, permissionId:perms[code].id } });
    }
  }
  console.log("Permissions seeded.");

  // 2. Academic Levels
  for (const name of ["Level 100","Level 200","Level 300","Level 400","Level 500","MSc","PhD"]) {
    await prisma.academicLevel.upsert({ where:{name}, update:{}, create:{name} });
  }
  console.log("Academic levels seeded.");

  // 3. Categories
  for (const cat of [
    {name:"Academics",description:"Academic timetables and notes",colorHex:"#1B3A6B"},
    {name:"Exams",description:"Examination timetables and venues",colorHex:"#DC2626"},
    {name:"Events",description:"University events and seminars",colorHex:"#D97706"},
    {name:"Scholarships",description:"Scholarship and financial aid",colorHex:"#059669"},
    {name:"General",description:"General notices",colorHex:"#4B5563"}
  ]) {
    await prisma.category.upsert({ where:{name:cat.name}, update:cat, create:cat });
  }
  console.log("Categories seeded.");

  // 4. Faculties + Departments + Programmes
  const structure = [
    { name:"Faculty of Engineering and Technology", shortCode:"FET", departments:[
      { name:"Computer Engineering", shortCode:"CE", programmes:[{name:"B.Eng in Computer Engineering",shortCode:"CE-BENG"}]},
      { name:"Electrical and Electronic Engineering", shortCode:"EEE", programmes:[{name:"B.Eng in Electrical and Electronic Engineering",shortCode:"EEE-BENG"}]},
      { name:"Civil Engineering", shortCode:"CVL", programmes:[{name:"B.Eng in Civil Engineering",shortCode:"CVL-BENG"}]},
      { name:"Mechanical Engineering", shortCode:"MCH", programmes:[{name:"B.Eng in Mechanical Engineering",shortCode:"MCH-BENG"}]}
    ]},
    { name:"Faculty of Science", shortCode:"FS", departments:[
      { name:"Computer Science", shortCode:"CSC", programmes:[{name:"B.Sc in Computer Science",shortCode:"CSC-BSC"},{name:"M.Sc in Computer Science",shortCode:"CSC-MSC"}]},
      { name:"Mathematics", shortCode:"MAT", programmes:[{name:"B.Sc in Mathematics",shortCode:"MAT-BSC"}]},
      { name:"Physics", shortCode:"PHY", programmes:[{name:"B.Sc in Physics",shortCode:"PHY-BSC"}]},
      { name:"Biochemistry", shortCode:"BCH", programmes:[{name:"B.Sc in Biochemistry",shortCode:"BCH-BSC"}]},
      { name:"Microbiology and Parasitology", shortCode:"MCB", programmes:[{name:"B.Sc in Microbiology",shortCode:"MCB-BSC"}]}
    ]},
    { name:"Faculty of Social and Management Sciences", shortCode:"FSMS", departments:[
      { name:"Economics", shortCode:"ECO", programmes:[{name:"B.Sc in Economics",shortCode:"ECO-BSC"}]},
      { name:"Journalism and Mass Communication", shortCode:"JMC", programmes:[{name:"B.Sc in Journalism and Mass Communication",shortCode:"JMC-BSC"}]},
      { name:"Law", shortCode:"LAW", programmes:[{name:"LL.B in Law",shortCode:"LAW-LLB"}]},
      { name:"Banking and Finance", shortCode:"BFN", programmes:[{name:"B.Sc in Banking and Finance",shortCode:"BFN-BSC"}]},
      { name:"Management Sciences", shortCode:"MGT", programmes:[{name:"B.Sc in Management",shortCode:"MGT-BSC"}]}
    ]},
    { name:"Faculty of Health Sciences", shortCode:"FHS", departments:[
      { name:"Medicine and Biomedical Sciences", shortCode:"MED", programmes:[{name:"MD in Medicine and Surgery",shortCode:"MED-MD"}]},
      { name:"Nursing", shortCode:"NUR", programmes:[{name:"B.Sc in Nursing",shortCode:"NUR-BSC"}]},
      { name:"Medical Laboratory Science", shortCode:"MLS", programmes:[{name:"B.Sc in Medical Laboratory Science",shortCode:"MLS-BSC"}]},
      { name:"Public Health", shortCode:"PHC", programmes:[{name:"B.Sc in Public Health",shortCode:"PHC-BSC"}]}
    ]},
    { name:"Faculty of Arts", shortCode:"FA", departments:[
      { name:"English", shortCode:"ENG", programmes:[{name:"B.A in English Language and Literature",shortCode:"ENG-BA"}]},
      { name:"History", shortCode:"HIS", programmes:[{name:"B.A in History",shortCode:"HIS-BA"}]},
      { name:"Linguistics", shortCode:"LIN", programmes:[{name:"B.A in Linguistics",shortCode:"LIN-BA"}]},
      { name:"Cameroon Studies", shortCode:"CST", programmes:[{name:"B.A in Cameroon Studies",shortCode:"CST-BA"}]}
    ]},
    { name:"Faculty of Education", shortCode:"FED", departments:[
      { name:"Educational Psychology and Special Education", shortCode:"EPSY", programmes:[{name:"B.Ed in Educational Psychology",shortCode:"EPSY-BED"}]},
      { name:"Curriculum Studies and Teaching", shortCode:"CUR", programmes:[{name:"B.Ed in Curriculum Studies",shortCode:"CUR-BED"}]},
      { name:"Science and Technical Education", shortCode:"STE", programmes:[{name:"B.Ed in Science Education",shortCode:"STE-BED"}]}
    ]},
    { name:"Faculty of Agriculture and Veterinary Medicine", shortCode:"FAVM", departments:[
      { name:"Agronomy and Applied Ecology", shortCode:"AGR", programmes:[{name:"B.Sc in Crop Production",shortCode:"AGR-BSC"}]},
      { name:"Agricultural Economics and Agribusiness Management", shortCode:"AEC", programmes:[{name:"B.Sc in Agricultural Economics",shortCode:"AEC-BSC"}]},
      { name:"Animal Production and Veterinary Medicine", shortCode:"APV", programmes:[{name:"B.Sc in Animal Science",shortCode:"APV-BSC"}]}
    ]},
    { name:"Advanced School of Translators and Interpreters", shortCode:"ASTI", departments:[
      { name:"Translation", shortCode:"TRANS", programmes:[{name:"M.A in Translation",shortCode:"TRANS-MA"},{name:"M.A in Conference Interpretation",shortCode:"TRANS-CI"}]},
      { name:"Legal Translation", shortCode:"LTRANS", programmes:[{name:"Postgraduate Diploma in Legal Translation",shortCode:"LTRANS-PGD"}]}
    ]},
    { name:"College of Technology", shortCode:"COT", departments:[
      { name:"Engineering Technology", shortCode:"ET", programmes:[
        {name:"B.Tech in Computer Engineering Technology",shortCode:"ET-CE"},
        {name:"B.Tech in Electrical and Electronic Engineering Technology",shortCode:"ET-EEE"},
        {name:"B.Tech in Mechanical Engineering Technology",shortCode:"ET-MCH"},
        {name:"B.Tech in Civil Engineering Technology",shortCode:"ET-CVL"}
      ]}
    ]}
  ];

  for (const fac of structure) {
    const faculty = await prisma.faculty.upsert({
      where: { shortCode: fac.shortCode },
      update: { name: fac.name },
      create: { name: fac.name, shortCode: fac.shortCode }
    });
    for (const dept of fac.departments) {
      const department = await prisma.department.upsert({
        where: { facultyId_name: { facultyId: faculty.id, name: dept.name } },
        update: { shortCode: dept.shortCode },
        create: { facultyId: faculty.id, name: dept.name, shortCode: dept.shortCode }
      });
      for (const prog of dept.programmes) {
        await prisma.programme.upsert({
          where: { departmentId_name: { departmentId: department.id, name: prog.name } },
          update: { shortCode: prog.shortCode },
          create: { departmentId: department.id, name: prog.name, shortCode: prog.shortCode }
        });
      }
    }
  }
  console.log("UB Faculties, Departments, and Programmes seeded.");

  // 5. Clubs
  for (const club of [
    {name:"Google Developer Groups on Campus UB",description:"Developer student club for Google Technologies"},
    {name:"FET Student Association",description:"Student body of Faculty of Engineering and Technology"},
    {name:"University Choir",description:"Official university choir"},
    {name:"Student Representative Council",description:"Main student governance body"},
    {name:"Science Students Association",description:"Students in Faculty of Science"}
  ]) {
    await prisma.club.upsert({ where:{name:club.name}, update:{description:club.description}, create:club });
  }
  console.log("Clubs seeded.");

  // 6. Super Admin
  const hash = await bcrypt.hash("Admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "oassonkeng@gmail.com" },
    update: { fullName:"ASSONKENG NGUIMDO ORTUS BRUNEL", accessLevel:"L5_SUPER_ADMIN", isEmailVerified:true, isActive:true },
    create: { fullName:"ASSONKENG NGUIMDO ORTUS BRUNEL", email:"oassonkeng@gmail.com", matricule:"FE24A228", passwordHash:hash, accessLevel:"L5_SUPER_ADMIN", isEmailVerified:true, isActive:true }
  });
  console.log(`Super Admin seeded: ${admin.email}`);
  console.log("Seeding complete!");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

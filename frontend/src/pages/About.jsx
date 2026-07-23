import { useState } from 'react';
import {
  MapPin, Calendar, Award, Users, BookOpen, GraduationCap,
  FlaskConical, Laptop, Library, Scale, HeartPulse, Music2,
  ChevronRight, Building2, Scroll, ClipboardList, ShieldCheck,
  SquareActivity, AlertCircle, Star,
} from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, children, accent = 'brand' }) {
  return (
    <div className={`card border-l-4 border-${accent}-500 space-y-3`}>
      <div className={`flex items-center gap-3 text-${accent}-600 dark:text-${accent}-400`}>
        <Icon size={22} />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
      </div>
      <div className="text-slate-600 dark:text-slate-300 leading-relaxed">{children}</div>
    </div>
  );
}

function GradeTable({ rows }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 mt-3">
      <table className="w-full text-sm text-left">
        <thead className="bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs uppercase">
          <tr>
            {['Mark / 100', 'Letter Grade', 'Grade Points', 'Evaluation'].map((h) => (
              <th key={h} className="px-4 py-3 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map(([mark, grade, pts, label]) => (
            <tr key={grade} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="px-4 py-2.5 font-mono text-slate-700 dark:text-slate-300">{mark}</td>
              <td className="px-4 py-2.5 font-bold text-brand-600 dark:text-brand-400">{grade}</td>
              <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{pts}</td>
              <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{label}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InfoList({ items }) {
  return (
    <ul className="space-y-1.5 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-sm">
          <ChevronRight size={14} className="text-brand-500 mt-0.5 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ClassificationTable({ rows, title }) {
  return (
    <div className="mt-3">
      {title && <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{title}</p>}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Classification</th>
              <th className="px-4 py-3 text-left font-semibold">Cumulative GPA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map(([cls, gpa]) => (
              <tr key={cls} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">{cls}</td>
                <td className="px-4 py-2.5 text-brand-600 dark:text-brand-400 font-mono">{gpa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const GRADE_ROWS = [
  ['80 – 100', 'A', '4.00', 'Excellent'],
  ['70 – 79', 'B+', '3.50', 'Very Good'],
  ['60 – 69', 'B', '3.00', 'Good'],
  ['55 – 59', 'C+', '2.50', 'Fair'],
  ['50 – 54', 'C', '2.00', 'Average'],
  ['45 – 49', 'D+', '1.50', 'Below Average'],
  ['40 – 44', 'D', '1.00', 'Poor'],
  ['0 – 39', 'F', '0.00', 'Fail'],
];

const BACHELOR_CLASSIFICATION = [
  ['First Class Honours', '3.60 – 4.00'],
  ['Second Class (Upper Division) Honours', '3.00 – 3.59'],
  ['Second Class (Lower Division) Honours', '2.50 – 2.99'],
  ['Third Class Honours', '2.25 – 2.49'],
  ['Pass', '2.00 – 2.24'],
];

const PROGRAMMES = [
  {
    faculty: 'Faculty of Agriculture & Veterinary Medicine',
    icon: '🌾',
    degrees: [
      'Agronomic & Applied Molecular Sciences (B.Sc.)',
      'Crop Production (B.Sc.)',
      'Plant Health Management (B.Sc.)',
      'Agricultural Economics & Agribusiness (B.Sc.)',
      'Animal Production (Ph.D.)',
      'Fisheries (Ph.D.)',
    ],
  },
  {
    faculty: 'Faculty of Arts',
    icon: '📚',
    degrees: [
      'English Language (B.A., M.A., Ph.D.)',
      'Literatures in English (B.A., M.A., Ph.D.)',
      'Performing and Visual Arts (B.A.)',
      'American Literature (M.A.)',
      'Comparative Literature (M.A., Ph.D.)',
      'French Studies (B.A., Ph.D.)',
      'History (B.A., M.A., Ph.D.)',
      'Applied Linguistics (M.A., Ph.D.)',
      'Theoretical Linguistics (M.A., Ph.D.)',
    ],
  },
  {
    faculty: 'Faculty of Education',
    icon: '🎓',
    degrees: [
      'Curriculum Studies & Teaching (B.Ed., M.Ed., Ph.D.)',
      'Educational Foundations & Administration (M.Ed., Ph.D.)',
      'Educational Psychology (B.Ed., M.Ed., Ph.D.)',
      'Nursery and Primary Education (B.Ed.)',
      'Special Education (B.Ed., M.Ed., Ph.D.)',
      'Guidance and Counseling (M.Ed.)',
    ],
  },
  {
    faculty: 'Faculty of Engineering & Technology',
    icon: '⚙️',
    degrees: [
      'Computer Engineering (B.Eng)',
      'Electrical & Electronic Engineering (B.Eng)',
      'Mechanical Engineering (B.Eng)',
      'Civil Engineering (B.Eng)',
    ],
  },
  {
    faculty: 'Faculty of Health Sciences',
    icon: '🏥',
    degrees: [
      'Nursing (BNS, MNE)',
      'Public Health (MPH)',
      'Medical Microbiology & Parasitology (M.Sc.)',
      'Chemical Pathology (M.Sc.)',
      'Medical Laboratory Science (BMLS)',
      'Medicine (MD)',
    ],
  },
  {
    faculty: 'Faculty of Science',
    icon: '🔬',
    degrees: [
      'Biochemistry (B.Sc., M.Sc., Ph.D.)',
      'Chemistry (B.Sc., M.Sc., Ph.D.)',
      'Computer Science (M.Sc., Ph.D.)',
      'Environmental Science (B.Sc., M.Sc.)',
      'Geology (B.Sc., M.Sc., Ph.D.)',
      'Mathematics (B.Sc., M.Sc., Ph.D.)',
      'Microbiology (B.Sc., M.Sc., Ph.D.)',
      'Physics (B.Sc., M.Sc., Ph.D.)',
      'Zoology (B.Sc., M.Sc., Ph.D.)',
      'Parasitology (B.Sc.)',
      'Molecular Diagnostic Science (M.Sc.)',
    ],
  },
  {
    faculty: 'Faculty of Social & Management Sciences',
    icon: '📊',
    degrees: [
      'Accountancy (B.Sc., M.Sc., Ph.D.)',
      'Banking & Finance (B.Sc., M.Sc., Ph.D.)',
      'Economics (B.Sc., M.Sc., Ph.D.)',
      'Management (B.Sc., M.Sc.)',
      'Master\'s in Business Administration (MBA)',
      'Geography (B.Sc., M.Sc., Ph.D.)',
      'Journalism & Mass Communication (B.Sc., M.Sc., Ph.D.)',
      'Law (LL.B., LL.M., Ph.D.)',
      'Political Science (B.Sc., M.Sc.)',
      'Sociology & Anthropology (B.Sc., M.Sc.)',
      'Women & Gender Studies (B.Sc., M.Sc., Ph.D.)',
    ],
  },
  {
    faculty: 'Advanced School of Translators & Interpreters (ASTI)',
    icon: '🌍',
    degrees: ['Translation (M.A.)', 'Interpretation (M.A.)'],
  },
  {
    faculty: 'College of Technology',
    icon: '💻',
    degrees: [
      'Computer Engineering (B.Tech / HND)',
      'Electrical & Electronic Engineering (B.Tech / HND)',
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Tab definitions
// ──────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview', icon: Building2 },
  { id: 'registration', label: 'Registration', icon: ClipboardList },
  { id: 'academics', label: 'Academic Regulations', icon: BookOpen },
  { id: 'programmes', label: 'Programmes', icon: GraduationCap },
  { id: 'examinations', label: 'Examinations', icon: Scroll },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'conduct', label: 'Code of Conduct', icon: ShieldCheck },
  { id: 'services', label: 'IT & Services', icon: Laptop },
  { id: 'heritage', label: 'Heritage & Anthem', icon: Music2 },
];

// ──────────────────────────────────────────────────────────────────────────────
// Tab Content Components
// ──────────────────────────────────────────────────────────────────────────────
function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Founded', value: '1992 / 1993', icon: Calendar },
          { label: 'Students', value: '30,000+', icon: Users },
          { label: 'Faculties', value: '10+', icon: Building2 },
          { label: 'Location', value: 'Buea, S.W.R.', icon: MapPin },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card text-center group hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
            <Icon size={28} className="mx-auto mb-2 text-brand-500 group-hover:scale-110 transition-transform" />
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      <SectionCard icon={Building2} title="Presentation">
        <p className="mb-3">
          The University of Buea was <strong>created in 1992 and chartered in 1993</strong> as the only English-speaking
          university out of the then six State universities in Cameroon. It started effectively in <strong>May 1993</strong> despite
          the economic crisis of the early 90s, the devaluation of the currency, and an acute shortage of human, material and financial resources.
        </p>
        <p className="mb-3">
          The University boldly began with <strong>768 students enrolled in three faculties</strong>. It currently has
          <strong> 7 faculties, 1 school and 2 colleges</strong>. The entire campus is networked and linked to the internet.
        </p>
        <p>
          Situated on the eastern slopes of <strong>Mount Cameroon</strong> in Buea, South West Region, UB is affectionately known as
          <em> "The Place to Be"</em>, symbolizing its commitment to bilingualism, excellence, and the Anglo-Saxon educational tradition.
        </p>
      </SectionCard>

      <SectionCard icon={Star} title="Mission">
        <p className="mb-3">
          The mission of the University of Buea is to provide opportunities for <strong>quality education through teaching
          and research</strong> in an environment that is conducive to such pursuits and in ways that respond to market forces.
        </p>
        <p className="mb-3">
          Conceived in the English-speaking tradition, the University of Buea seeks to foster the essence of that system while
          situating itself within the larger <strong>bilingual and multicultural context of Cameroon</strong>.
        </p>
        <p>
          Its teaching and research programmes <strong>emphasize relevance, encourage tolerance</strong> and promote
          creative, critical and independent thinking.
        </p>
      </SectionCard>

      <SectionCard icon={SquareActivity} title="Orientation">
        <p className="mb-2">Orientation is conducted at two levels:</p>
        <div className="grid sm:grid-cols-2 gap-4 mt-3">
          <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4">
            <p className="font-semibold text-brand-700 dark:text-brand-300 mb-2">General Orientation</p>
            <InfoList items={[
              'Code of conduct for all students',
              'Student rights, privileges and obligations',
              'Academic good standing',
              'Sports and Recreation',
              'Registration Procedures',
              'Health Insurance Benefits',
              'Medical Examination',
              'The Library',
            ]} />
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Academic Orientation</p>
            <p className="text-sm">Carried out by each Faculty/Department. Includes explanation of courses offered in respective programmes, which courses to register for, and programme-specific requirements. Conducted before classes begin.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function RegistrationTab() {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-5 py-4 text-sm text-amber-700 dark:text-amber-300 flex gap-3">
        <AlertCircle size={20} className="shrink-0 mt-0.5" />
        <span>All students must register online at <strong>www.ubuea.cm</strong>. Course registration is <strong>exclusively online</strong>. Using the University Internet facility and IT Centre is strongly recommended.</span>
      </div>

      <SectionCard icon={ClipboardList} title="Freshmen Registration Procedure">
        {[
          {
            step: 'Step 1',
            title: 'Payment of Registration Fees',
            content: 'Pay registration fees (60,000 FCFA for freshmen) using the online portal via MTN Mobile Money, or directly at BICEC Buea, BICEC Limbe, SCB Limbe, or Banque Atlantique. Fees must be paid into the respective Faculty bank account as shown on your admission letter. Failure to pay by the deadline forfeits your place.',
          },
          {
            step: 'Step 2',
            title: 'Verification & Validation of Receipts',
            content: 'Present your original receipt + 4 photocopies along with your admission letter to the Receipts Control Service at the Finance Office (rear of Faculty of Arts building). The original is retained; you receive 4 stamped copies — STUDENT\'S COPY, HEALTH CENTRE COPY, FACULTY COPY, and ID CARD CENTRE copy.',
          },
          {
            step: 'Step 3',
            title: 'Compulsory Medical Examination',
            content: 'Present HEALTH CENTRE COPY with test results from a Government Hospital or UB Health Centre. Required tests: Chest X-Ray, Blood sugar level, Weight & height, Blood pressure, Vision, Hearing, Tuberculosis, Urine analysis. Students doing tests at UB Health Centre pay 5,000 FCFA. Results must be sealed and marked "CONFIDENTIAL".',
          },
          {
            step: 'Step 4',
            title: 'Orientation',
            content: 'All freshmen must attend orientation before being issued course registration forms (Form B) by their Departments. You will receive a ticket as proof of attendance.',
          },
          {
            step: 'Step 5',
            title: 'Course Registration at Faculty',
            content: 'Present FACULTY COPY + Health Centre attestation + Orientation ticket to receive Form B and register for courses. Faculties will not register any student without these three documents.',
          },
          {
            step: 'Step 6',
            title: 'Production of ID Cards',
            content: 'Present ID CARD CENTRE copy at the designated time and place announced by the ID card service. ID cards are valid for the duration of the programme. Replacement cost in case of loss: 5,000 FCFA.',
          },
        ].map(({ step, title, content }) => (
          <div key={step} className="flex gap-4 py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex flex-col items-center justify-center text-brand-600 dark:text-brand-400">
              <span className="text-xs font-semibold">{step}</span>
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-white mb-1">{title}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{content}</p>
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard icon={ClipboardList} title="Returning Students Registration" accent="slate">
        <p className="mb-3">Registration fee for returning students: <strong>50,000 FCFA</strong> per session (payable in one or two installments of 25,000 FCFA). Medical tests required: Weight & height, Blood sugar, Blood pressure, Vision, Hearing, Tuberculosis, Urine analysis. Cost at UB Health Centre: <strong>3,000 FCFA</strong>.</p>
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl px-4 py-3 text-sm">
          <strong>Note:</strong> Students who suspended studies or were suspended by the University must obtain authorization for resumption from the Registrar before registration.
        </div>
      </SectionCard>

      <SectionCard icon={HeartPulse} title="Health Insurance Benefits" accent="rose">
        <p className="mb-3">Every registered student of the University of Buea is covered by a health insurance policy with the following benefits:</p>
        <div className="overflow-x-auto rounded-xl border border-rose-100 dark:border-rose-900/30 mt-2">
          <table className="w-full text-sm">
            <thead className="bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Coverage</th>
                <th className="px-4 py-3 text-right font-semibold">Amount (FCFA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50 dark:divide-rose-900/20">
              {[
                ['Reimbursement of medical expenses (serious illness)', '350,000 max'],
                ['Death through illness', '250,000'],
                ['Death by accident', '500,000'],
                ['Physical disability after accident', '500,000'],
                ['Medical expenses after accident', '50,000'],
                ['Funeral expenses (transport, casket)', '300,000'],
              ].map(([cov, amt]) => (
                <tr key={cov} className="hover:bg-rose-50/50 dark:hover:bg-rose-900/10">
                  <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{cov}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-rose-600 dark:text-rose-400">{amt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-2">Students who do not complete the medical examination will not be allowed to register or sit for any university examination.</p>
      </SectionCard>
    </div>
  );
}

function AcademicsTab() {
  return (
    <div className="space-y-6">
      <SectionCard icon={BookOpen} title="General Academic Provisions">
        <InfoList items={[
          'Instruction at UB is organized on the Semester Course Credit System.',
          'One credit = 10 hours of student effort (or 15 hours in Engineering = 60 contact hours).',
          'Each course is assigned 6 credits unless otherwise approved by Senate.',
          'An academic session consists of 2 semesters of 15 weeks each.',
          'Students register for all courses in their programme at the beginning of the first semester.',
          'Each student must pass: General Studies (Civics & Ethics), Use of English, Functional French, Sports, and IT Skills.',
          'Students must register for courses totaling between 24 and 32 credits per semester. Maximum of 38 credits with Dean\'s approval.',
        ]} />
      </SectionCard>

      <SectionCard icon={BookOpen} title="Course Terminology">
        {[
          { term: 'Compulsory', desc: 'A course specified for a degree/programme which a student must take and pass before graduation.' },
          { term: 'Elective', desc: 'A course which a student may choose to make up required additional credits for the award of a degree.' },
          { term: 'Prerequisite', desc: 'A course whose knowledge is essential for another specified course.' },
          { term: 'Concurrent', desc: 'A specified course at the same level that must be taken during the same semester.' },
          { term: 'Required', desc: 'A course specified by a Department. Minimum standard to earn credit is a D grade.' },
        ].map(({ term, desc }) => (
          <div key={term} className="flex gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <span className="font-semibold text-brand-600 dark:text-brand-400 w-28 shrink-0 text-sm">{term}</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">{desc}</span>
          </div>
        ))}
      </SectionCard>

      <SectionCard icon={Award} title="Bachelor's Degree">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          {[
            { label: 'Duration', value: '6 or 8 semesters' },
            { label: 'Min. Credits (6-sem)', value: '180 credits' },
            { label: 'Min. Credits (8-sem)', value: '240 credits' },
            { label: 'Min. GPA Required', value: '2.00 (4.0 scale)' },
            { label: 'Single Honours Major', value: '120 credits' },
            { label: 'Double Major', value: '130 credits each' },
            { label: 'Minor Credits', value: '36–48 credits' },
            { label: 'Continuous Assessment', value: '30% of final grade' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg">
              <span className="text-slate-500 dark:text-slate-400">{label}</span>
              <span className="font-semibold text-slate-800 dark:text-white">{value}</span>
            </div>
          ))}
        </div>

        <GradeTable rows={GRADE_ROWS} />

        <ClassificationTable title="Degree Classification" rows={BACHELOR_CLASSIFICATION} />

        <div className="mt-4 text-sm space-y-2 text-slate-600 dark:text-slate-400">
          <p>✦ To earn credit for a <strong>compulsory course</strong>, a student must score minimum <strong>50% (C grade)</strong>.</p>
          <p>✦ For elective/required courses, minimum passing grade is <strong>40% (D)</strong>. Total D credits may not exceed 10% of programme requirements.</p>
          <p>✦ Students on <strong>Dean's List</strong>: GPA ≥ 3.25. <strong>Vice-Chancellor's List</strong>: GPA ≥ 3.50 (full load, no sanctions).</p>
          <p>✦ A student with GPA &lt; 2.0 is placed on <strong>probation</strong>. Two consecutive semesters with GPA &lt; 1.0 → required to withdraw.</p>
        </div>
      </SectionCard>

      <SectionCard icon={GraduationCap} title="Master's Degree">
        <InfoList items={[
          'Duration: 4 semesters (maximum 6 semesters).',
          'Admission requirement: Bachelor\'s degree with at least Second Class Honours or equivalent.',
          'Award requires 120 credits including research work defended before a panel.',
          'Minimum GPA: 2.00. Minimum passing grade for a course: C grade.',
          'Thesis panel: at least 3 members (Lecturers, Associate or Full Professors) designated by the Vice-Chancellor.',
        ]} />
        <GradeTable rows={GRADE_ROWS} />
      </SectionCard>

      <SectionCard icon={FlaskConical} title="Doctorate (Ph.D.) Degree">
        <InfoList items={[
          'Selective programme open to holders of a Master\'s degree or equivalent.',
          'Duration: 3 years minimum, 5 years maximum (extendable by 1–2 years by Senate).',
          'Year 1: Course work and research technique acquisition. 60 credits required to proceed.',
          'After Year 1: Comprehensive Examination, then deposit of research proposal.',
          'Thesis must constitute an original contribution to knowledge and be defended before a panel.',
          'Panel composition: Chairperson, External Examiner, Internal Examiner, and Supervisor.',
          'Supervisors must hold the rank of Professor, Associate Professor, or Lecturer with PhD/Doctorat.',
        ]} />
        <GradeTable rows={GRADE_ROWS} />
      </SectionCard>

      <SectionCard icon={Scale} title="Change of Faculty / Suspension of Studies" accent="amber">
        <InfoList items={[
          'Students are generally not permitted to change the major for which admission was offered.',
          'Application for change of programme is considered at the end of the academic year and takes effect from the next year.',
          'A student authorized to transfer is credited with courses passed that fit the new programme\'s curriculum.',
          'Students wishing to suspend studies must apply before the end of the semester(s) to be suspended.',
          'Qualification for suspension: academic good standing + mitigating circumstances.',
          'Abandoning studies for 4 consecutive weeks without cause = suspension; must re-apply to Senate.',
          'Absence for 2 consecutive sessions without cause = automatic forfeiture of student status.',
          'Deferment may not exceed 4 semesters; after which registration lapses and re-application is required.',
        ]} />
      </SectionCard>
    </div>
  );
}

function ProgrammesTab() {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Click a faculty or school to expand its offered programmes. Professional minors are available in Computer Science, Chemical Process Technology, Materials Science, Horticulture, Medical Laboratory Technology, and Library Science.
      </p>
      {PROGRAMMES.map((p) => (
        <div key={p.faculty} className="card overflow-hidden transition-all">
          <button
            onClick={() => setOpen(open === p.faculty ? null : p.faculty)}
            className="w-full flex items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{p.icon}</span>
              <span className="font-semibold text-slate-800 dark:text-white">{p.faculty}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-blue text-xs">{p.degrees.length} programmes</span>
              <ChevronRight
                size={18}
                className={`text-slate-400 transition-transform duration-200 ${open === p.faculty ? 'rotate-90' : ''}`}
              />
            </div>
          </button>
          {open === p.faculty && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="grid sm:grid-cols-2 gap-2">
                {p.degrees.map((d) => (
                  <div key={d} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg">
                    <GraduationCap size={14} className="text-brand-500 mt-0.5 shrink-0" />
                    {d}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ExaminationsTab() {
  return (
    <div className="space-y-6">
      <SectionCard icon={Scroll} title="Eligibility for Examinations">
        <p className="mb-3">All duly registered students are eligible to sit for examinations <strong>except</strong>:</p>
        <InfoList items={[
          'A student who absents himself from the University for upwards of 6 weeks without official permission.',
          'A student who fails to attend at least 70% of tutorials or practicals in a course.',
        ]} />
      </SectionCard>

      <SectionCard icon={ClipboardList} title="Examination Regulations">
        <InfoList items={[
          'Students must be punctual. Arrival more than 30 minutes after start → not admitted.',
          'Students must bring their own pens, rulers, erasers, pencils and any permitted materials.',
          'Lecture notes, cellular phones, textbooks, jotters, bags, and calculators are NOT allowed unless indicated.',
          'No communication between students inside the examination hall.',
          'Strict silence must be observed. Attract invigilator only by raising a hand.',
          'Smoking is strictly forbidden in the examination hall.',
          'All rough work must be done in answer books, crossed through, and submitted with the answer booklet.',
          'Students must use their Registration Number (not name) for each examination.',
          'Only blue or black ink is allowed for examination answer booklets.',
          'Students must not leave during the first 30 minutes and the last 50 minutes of any examination.',
          'Students must remain seated until invigilators complete collection of answer booklets.',
          'Students must sign against their registration number on the attendance sheet.',
          '70% attendance at lectures, tutorials and practicals is required to qualify to sit for an examination.',
        ]} />
      </SectionCard>

      <SectionCard icon={AlertCircle} title="Examination Misconduct & Sanctions" accent="rose">
        <p className="mb-3">In conformity with Decree No. 93/027 of 19 January 1993, the following constitute offences:</p>
        <InfoList items={[
          'Impersonating a student in any University examination.',
          'Attempting to give or receive pre-knowledge of examination questions.',
          'Attempting to influence the marking of scripts or the award of marks.',
          'Assisting or receiving assistance from another student during examination.',
        ]} />
        <p className="mt-4 font-semibold text-slate-700 dark:text-slate-300 text-sm">If found guilty, the Vice-Chancellor may:</p>
        <InfoList items={[
          'Give public notice of the offence committed.',
          'Issue a written warning, with partial or total suspension of university aid.',
          'Suspend the student from all examinations for the session.',
          'Recommend temporary suspension from the University for 1 or 2 sessions.',
          'Recommend permanent dismissal from the University, barring re-admission to any institution.',
        ]} />
      </SectionCard>

      <SectionCard icon={Scale} title="Absence from Examination" accent="amber">
        <InfoList items={[
          'Students who fail to present themselves for registered examinations without justification are deemed to have failed.',
          'Mis-reading the timetable is NOT accepted as a valid excuse for absence.',
          'Students absent due to illness confirmed by UB\'s Chief Medical Officer may sit the examination at the next opportunity without repeating the course.',
          'A student who falls ill during an examination must report in writing to the Dean or Faculty Director.',
          'Make-up examinations are approved by Senate on recommendation of the Faculty Board.',
        ]} />
      </SectionCard>
    </div>
  );
}

function LibraryTab() {
  return (
    <div className="space-y-6">
      <SectionCard icon={Library} title="The Buea University Library (BUL)">
        <p className="mb-3">The BUL comprises:</p>
        <div className="grid sm:grid-cols-2 gap-2 mb-4">
          {['The Main Library', 'Faculty/School Libraries', 'University Archives', 'Departmental Libraries', 'University Bookshop', 'University Press'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm bg-brand-50 dark:bg-brand-900/20 px-3 py-2 rounded-lg text-brand-700 dark:text-brand-300">
              <Library size={14} />
              {item}
            </div>
          ))}
        </div>
        <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">The library is open for study and research to:</p>
        <InfoList items={[
          'Members of the University of Buea Council',
          'Current members of staff and their affiliated schools',
          'Registered students of UB and its affiliated schools',
          'Graduates and retired staff members in good standing',
          'Persons engaged in academic research (by proof)',
        ]} />
      </SectionCard>

      <SectionCard icon={Calendar} title="Opening Hours" accent="slate">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-3">During Semester Period</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Mon – Fri</span><span className="font-mono font-semibold">8:00 AM – 9:00 PM</span></div>
              <div className="flex justify-between"><span>Saturdays</span><span className="font-mono font-semibold">8:00 AM – 3:00 PM</span></div>
              <div className="flex justify-between text-slate-400"><span>Public Holidays</span><span>Closed</span></div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-3">During Vacations</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Mon – Fri</span><span className="font-mono font-semibold">8:00 AM – 3:00 PM</span></div>
              <div className="flex justify-between text-slate-400"><span>Weekends</span><span>Closed</span></div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={BookOpen} title="Loan Facilities">
        <InfoList items={[
          'Up to 5 books may be borrowed at a time for up to 2 weeks.',
          'Items may be renewed if not requested by another user.',
          'Recalled items must be returned within 3 days of the recall notice.',
          'Fine for late return: 100 FCFA per item per day.',
          'Lost or damaged items: charged double the cost of 3 items plus administrative costs.',
          'Students must return all library items before completing their programme to receive their degree.',
          'All periodicals may NOT normally be borrowed.',
          'Users must possess valid (current) library and identity cards at all times.',
        ]} />
      </SectionCard>

      <SectionCard icon={ShieldCheck} title="Conduct Within the Library" accent="amber">
        <InfoList items={[
          'Noise, disturbance or behaviour contrary to university rules is strictly forbidden.',
          'Smoking, eating and drinking are prohibited in any area of the library.',
          'Personal textbooks or printed matter must be deposited at the property room.',
          'No book or library property may be taken out without authorization.',
          'Users may not deface, mutilate, or write on any library material.',
          'The use of electronic equipment not belonging to the library is prohibited.',
          'Users may not reserve reading places. Absence > 15 minutes: space freed for others.',
          'The speaking of Pidgin English in the library is prohibited.',
          'Distribution of handbills or newspapers without library authorization is forbidden.',
          'The taking of photographs within the library requires prior authority of the Librarian.',
        ]} />
      </SectionCard>
    </div>
  );
}

function ConductTab() {
  return (
    <div className="space-y-6">
      <SectionCard icon={ShieldCheck} title="Code of Conduct">
        <InfoList items={[
          'Students must conduct themselves decently and responsibly at all times, on or off campus.',
          'No student shall engage in physical scuffles with fellow students, university staff, or the public.',
          'Students should be neat and presentable at all times, especially in class and in the restaurant.',
          'All students must contribute to the cleanliness of facilities. Use dustbins; no littering.',
          'No item of furniture may be moved out of Common Room, Restaurant, Classrooms, or Library without permission.',
          'The full cost of any lost or damaged property will be borne by the responsible student.',
          'Junior staff of the University (messengers, drivers, security, yardmen) must not be insulted or assaulted.',
          'No student may be absent from class without prior authorization, except for justified health reasons.',
          'Students must be punctual and show due respect to their teachers.',
          'No smoking in administrative buildings, restaurant, classrooms, lecture halls, laboratories, or library.',
          'No liquor may be sold or consumed on campus before noon. Drunkenness on or off campus → severe discipline.',
          'Possession and/or consumption of dangerous drugs is prohibited → summary dismissal.',
          'Students found stealing shall be severely disciplined and may be handed over to law enforcement.',
        ]} />
      </SectionCard>

      <div className="grid md:grid-cols-3 gap-4">
        <SectionCard icon={Users} title="Rights of Students">
          <InfoList items={[
            'Right of membership to the University Community.',
            'Right to receive tuition in duly registered courses.',
            'Right to evaluate teaching.',
            'Right to be examined per approved rules and regulations.',
            'Right to be heard per rules governing freedom of speech and natural justice.',
          ]} />
        </SectionCard>
        <SectionCard icon={Award} title="Privileges" accent="amber">
          <InfoList items={[
            'Use the name of the University in all lawful transactions.',
            'Use university facilities to attain academic objectives.',
            'Be certified at the end of degree programme upon satisfying requirements.',
            'Receive medical care on campus (if registered at UB Health Centre).',
            'Live in University Halls of Residence upon payment of prescribed fees.',
          ]} />
        </SectionCard>
        <SectionCard icon={Scale} title="Obligations" accent="rose">
          <InfoList items={[
            'Observe rules governing academic programmes (registration, examinations).',
            'Respect and obey constituted University authorities.',
            'Show consideration for students and staff.',
            'Treat off-campus premises responsibly and observe their rules.',
            'Abstain from anything that brings the University into disrepute.',
            'Pay fees at rates determined by University authorities.',
          ]} />
        </SectionCard>
      </div>

      <SectionCard icon={AlertCircle} title="Disciplinary Offences" accent="rose">
        <InfoList items={[
          'Any act incompatible with the rules governing university property and dignity.',
          'Unauthorized absence from class.',
          'Direct or indirect participation in rows, acts of violence, or destruction of property.',
          'Deliberate organization of boycott of classes or disturbances at lectures.',
          'Unwanted demonstrations on campus or highways.',
          'Any acts of subversion.',
          'Examination fraud.',
        ]} />
        <p className="text-xs text-slate-400 mt-3">Punishment for breach of discipline ranges from a simple warning to outright dismissal, per Decree No. 93/027 of 19 January 1993.</p>
      </SectionCard>
    </div>
  );
}

function ITServicesTab() {
  return (
    <div className="space-y-6">
      <SectionCard icon={Laptop} title="The IT Centre (ITC)">
        <p className="mb-3">
          The Information Technology Centre of the University of Buea is the <strong>nerve centre of computing power</strong> at UB,
          serving as a gateway to the external world. Operational since <strong>29 July 2002</strong>, it was the first of its kind in the
          entire South West Region. The Centre runs a fully equipped ultra-modern Cyber Centre with Internet and office automation services.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">Internet connectivity is ensured by CAMTEL through an optic fibre trunk with an uplink and downlink of 5 Mbps.</p>
      </SectionCard>

      <SectionCard icon={Star} title="Aims of the IT Centre" accent="slate">
        <InfoList items={[
          'Facilitate the teaching and learning process.',
          'Facilitate research for both lecturers and students.',
          'Assure the development and maintenance of IT infrastructure of the University.',
          'Ease communication with the outside world.',
          'Promote and upgrade individual knowledge in Information and Communication Technology.',
          'Reflect the dynamic and well-kept image of UB both nationally and internationally.',
          'Make Internet services affordable to students and the entire university community.',
          'Demonstrate UB\'s involvement in the electronic media and technological know-how.',
        ]} />
      </SectionCard>

      <SectionCard icon={Laptop} title="IT Centre Services & Pricing">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 mt-2">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Service</th>
                <th className="px-4 py-3 text-left font-semibold">Specification</th>
                <th className="px-4 py-3 text-right font-semibold">Price (FCFA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                ['Internet Access', '60 minutes', '150'],
                ['Printing (B&W)', 'Per page', '50/page'],
                ['Printing (Colour)', 'Per page', '100–500'],
                ['Scanning', 'Picture/Document', '150'],
                ['Wide Campus Wireless', 'Staff/Students/Public', '200'],
                ['IT Support', 'Entire University', '—'],
              ].map(([svc, spec, price]) => (
                <tr key={svc} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">{svc}</td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{spec}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-brand-600 dark:text-brand-400">{price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard icon={FlaskConical} title="CISCO Academy" accent="amber">
        <p>
          The University runs a local CISCO Network Academy in collaboration with the Regional Academy at the University of Yaoundé I,
          the <strong>UNDP</strong>, and the <strong>CISCO System USA</strong>. Upon completion, graduates become
          <strong> CISCO Certified Network Associates (CCNA)</strong> and IT Technicians.
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Courses offered: <strong>CISCO CCNA (Routing and Switching)</strong> and <strong>IT Essentials</strong>. The Academy has a well-equipped laboratory with internet facilities.</p>
      </SectionCard>
    </div>
  );
}

function HeritageTab() {
  return (
    <div className="space-y-6">
      <SectionCard icon={Music2} title="UB Anthem">
        <div className="bg-brand-50 dark:bg-brand-900/20 rounded-2xl p-6 text-slate-700 dark:text-slate-200 leading-loose italic font-serif">
          <p>O Cameroon, Our glorious home</p>
          <p>Of mountain ranges, of plains and sea;</p>
          <p>May God be with thee.</p>
          <br />
          <p>And we your proud children,</p>
          <p>How thankful we should be,</p>
          <p>To enroll in UB,</p>
          <p className="font-bold not-italic">The Place to Be.</p>
          <br />
          <p>Though masters of our fate,</p>
          <p>And our own destiny,</p>
          <p>We pledge our loyalty,</p>
          <p>And service to UB.</p>
          <br />
          <p>O Cameroon, Our glorious home,</p>
          <p>Of mountain ranges, of plains and sea;</p>
          <p>May God be with thee.</p>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-right">Composed by Ndumbe Mosaso</p>
      </SectionCard>

      <SectionCard icon={Scroll} title="Matriculation Hymn">
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 text-slate-700 dark:text-slate-200 leading-loose italic font-serif text-sm">
          <p>We all have come from far and wide</p>
          <p>To Fako's fertile fields to seek</p>
          <p>The towering heights of academy</p>
          <p>We hope someday we'll thrive</p>
          <br />
          <p>We know beginnings to be hard</p>
          <p>We need hard work, abounding faith</p>
          <p>To take us through the times ahead</p>
          <p>Until someday we'll triumph</p>
          <br />
          <p>With gladsome heart and hopefulness</p>
          <p>And teaches all so full of cheer</p>
          <p>The lecture halls shall transformed</p>
          <p>To places so cheerful</p>
          <br />
          <p>And learning shall be full of fun</p>
          <p>We hope the future shall be bright</p>
          <p>Someday we shall all stand up here</p>
          <p>And shout out we made it</p>
          <br />
          <p className="font-semibold not-italic">Quality, excellence</p>
          <p>Our community shall be proud</p>
          <p>Our endeavors will all acclaim</p>
          <p>When hope and steadfastness have thrived</p>
          <p>And proudly we shall stand</p>
          <br />
          <p>Looking back at those yesteryears</p>
          <p>When we all did humbly begin</p>
          <p>To build the Varsity of Buea</p>
          <p className="font-bold not-italic">God Bless we all made it</p>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-right">Lyrics by Hansel Ndumbe Eyoh · Buea, May 1993</p>
      </SectionCard>

      <SectionCard icon={Scroll} title="Matriculation Oath">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 mb-2">The Registrar shall say:</p>
            <p className="italic text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 px-4 py-3 rounded-xl text-sm leading-relaxed">
              "In the belief that the University of Buea stands for excellence, truth, moral rectitude and for the integrity of the individual and the nation;
              That the University of Buea exists to serve the social, cultural and political institutions of Cameroon;
              That the University of Buea exists to improve the quality of life of Cameroonians by preserving existing knowledge through teaching and developing new knowledge through research;
              We call on all registered students to rise and take the matriculation oath of the University of Buea."
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 mb-2">The Students shall rise and say:</p>
            <p className="italic text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/20 px-4 py-3 rounded-xl text-sm leading-relaxed font-medium">
              "I do on my honor promise to obey the rules and regulations guiding student conduct and discipline in the University of Buea;
              I understand that the University of Buea expects its students to be honest in all their academic work and agree to adhere to this commitment to academic honesty and to the general regulations governing academic programmes."
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 mb-2">The Vice-Chancellor shall say:</p>
            <p className="italic text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 px-4 py-3 rounded-xl text-sm leading-relaxed">
              "In the name of the Chancellor of the University of Buea and by virtue of the powers vested in me as Vice-Chancellor,
              I declare all these students duly matriculated at the University of Buea for the current academic year."
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

const TAB_COMPONENTS = {
  overview: OverviewTab,
  registration: RegistrationTab,
  academics: AcademicsTab,
  programmes: ProgrammesTab,
  examinations: ExaminationsTab,
  library: LibraryTab,
  conduct: ConductTab,
  services: ITServicesTab,
  heritage: HeritageTab,
};

// ──────────────────────────────────────────────────────────────────────────────
// Main About Page
// ──────────────────────────────────────────────────────────────────────────────
export default function About() {
  const [activeTab, setActiveTab] = useState('overview');
  const TabComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute top-8 right-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative p-8 md:p-14 flex flex-col md:flex-row items-center gap-8">
          <div className="shrink-0">
            <div className="w-28 h-28 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-5xl shadow-xl">
              🏛️
            </div>
          </div>
          <div>
            <p className="text-brand-200 text-sm font-semibold tracking-widest uppercase mb-2">Est. 1992 · Chartered 1993</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">University of Buea</h1>
            <p className="text-xl text-brand-100 mb-5 max-w-2xl">
              <em>"The Place to Be"</em> — The only English-speaking university of its kind in Cameroon,
              nestled on the eastern slopes of Mount Cameroon.
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-medium">
              <span className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 backdrop-blur-sm">
                <MapPin size={15} /> Buea, South West Region
              </span>
              <span className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 backdrop-blur-sm">
                <Users size={15} /> 30,000+ Students
              </span>
              <span className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 backdrop-blur-sm">
                <Building2 size={15} /> 7 Faculties · 1 School · 2 Colleges
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-sm">
        <div className="flex flex-wrap gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in" key={activeTab}>
        <TabComponent />
      </div>
    </div>
  );
}

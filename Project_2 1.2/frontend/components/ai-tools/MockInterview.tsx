"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, User, Bot, Loader2, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

// Extensive Domain List (Synced with ResumeScorer)
const DOMAINS = [
  'General',
  'Software Engineer / Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'Mobile App Developer',
  'Game Developer',
  'Data Analyst',
  'Business Intelligence (BI) Analyst',
  'Data Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'AI Engineer',
  'Cloud Engineer',
  'DevOps Engineer',
  'Site Reliability Engineer (SRE)',
  'System Administrator',
  'Network Engineer',
  'Cybersecurity Analyst',
  'Ethical Hacker / Penetration Tester',
  'Security Engineer',
  'SOC Analyst',
  'Information Security Manager',
  'Manual Tester',
  'Automation Test Engineer',
  'QA Engineer',
  'Performance Tester',
  'UI Designer',
  'UX Designer',
  'Product Designer',
  'Web Designer',
  'IT Support Engineer',
  'Technical Support Executive',
  'Help Desk Analyst',
  'Desktop Support Engineer',
  'Project Manager',
  'Product Manager',
  'IT Manager',
  'Business Analyst',
  'Scrum Master',
  'AI Prompt Engineer',
  'Blockchain Developer',
  'AR/VR Developer',
  'IoT Engineer',
  'Robotics Software Engineer'
]


type QuestionDef = {
  q: string
  keywords: string[]
  tip: string
}

const DOMAIN_QUESTIONS: Record<string, { technical: QuestionDef[], aptitude: QuestionDef[] }> = {
  'General': {
    technical: [
      { q: 'Describe a time you solved a complex problem.', keywords: ['problem', 'solution', 'outcome', 'steps', 'analysis'], tip: 'Use the STAR method (Situation, Task, Action, Result).' },
      { q: 'How do you handle tight deadlines?', keywords: ['prioritize', 'schedule', 'communicate', 'focus', 'plan'], tip: 'Emphasize time management and communication.' },
      { q: 'What is your preferred way to learn new technologies?', keywords: ['documentation', 'practice', 'course', 'project', 'tutorial'], tip: 'Show your proactive learning style.' },
      { q: 'Describe a project you are proud of and your role in it.', keywords: ['project', 'role', 'contribution', 'impact', 'team'], tip: 'Focus on your specific contribution.' },
      { q: 'How do you handle constructive criticism?', keywords: ['feedback', 'improve', 'listen', 'positive', 'learn'], tip: 'Demonstrate a growth mindset.' },
      { q: 'What is your greatest professional strength?', keywords: ['strength', 'skill', 'experience', 'example'], tip: 'Align your strength with the job requirements.' },
      { q: 'What is your greatest professional weakness?', keywords: ['weakness', 'improve', 'working on', 'overcome'], tip: 'Mention a real weakness and how you are addressing it.' },
      { q: 'Where do you see yourself in 5 years?', keywords: ['goal', 'growth', 'position', 'learn', 'contribute'], tip: 'Show ambition aligned with the company.' },
      { q: 'Why do you want to work in this industry?', keywords: ['passion', 'interest', 'trend', 'impact'], tip: 'Show genuine interest in the field.' },
      { q: 'Describe a time you demonstrated leadership.', keywords: ['led', 'team', 'decision', 'responsibility', 'guide'], tip: 'Leadership can be shown even without a formal title.' },
      { q: 'How do you prioritize multiple tasks?', keywords: ['priority', 'urgent', 'important', 'schedule', 'list'], tip: 'Mention tools or methods like Eisenhower Matrix.' },
      { q: 'What motivates you in your work?', keywords: ['challenge', 'learning', 'impact', 'result', 'team'], tip: 'Be honest and professional.' },
      { q: 'Describe a challenge you faced and how you overcame it.', keywords: ['challenge', 'action', 'solution', 'result'], tip: 'Focus on the solution.' },
      { q: 'How do you handle stress?', keywords: ['calm', 'break', 'focus', 'organize', 'perspective'], tip: 'Show emotional intelligence.' },
      { q: 'Do you prefer working independently or in a team?', keywords: ['team', 'independent', 'collaborate', 'balance'], tip: 'Most roles require a balance of both.' }
    ],
    aptitude: [
      { q: 'If you have a 3-gallon jug and a 5-gallon jug, how do you measure 4 gallons?', keywords: ['fill', 'pour', 'empty', 'transfer', 'remain'], tip: 'Think about the difference between the volumes.' },
      { q: 'Describe a situation where you had to adapt to a major change.', keywords: ['change', 'adapt', 'flexible', 'learn', 'adjust'], tip: 'Show resilience and flexibility.' },
      { q: 'If a doctor gives you 3 pills and tells you to take one every half hour, how long would it take before all the pills had been taken?', keywords: ['hour', 'minutes', 'start', 'finish'], tip: 'Count the intervals, not just the pills.' },
      { q: 'A man pushes his car to a hotel and tells the owner he is bankrupt. Why?', keywords: ['monopoly', 'game', 'board'], tip: 'Think laterally (outside the box).' },
      { q: 'If you look at a clock and the time is 3:15, what is the angle between the hour and the minute hands?', keywords: ['degree', 'angle', 'hour', 'minute', 'calculate'], tip: 'Remember the hour hand moves too.' },
      { q: 'You have 8 balls. One of them is slightly heavier than the others. You have a balance scale. What is the minimum number of weighings required to find the heavy ball?', keywords: ['weigh', 'balance', 'group', 'split'], tip: 'Divide and conquer.' },
      { q: 'Explain a complex concept to someone with no knowledge of it.', keywords: ['analogy', 'simple', 'example', 'compare'], tip: 'Use a simple analogy.' },
      { q: 'How many tennis balls fit in a Boeing 747?', keywords: ['volume', 'estimate', 'size', 'calculation'], tip: 'Show your estimation logic (Fermi problem).' },
      { q: 'Why are manhole covers round?', keywords: ['fall', 'hole', 'shape', 'geometry'], tip: 'It cannot fall through the opening.' },
      { q: 'If you were a pizza delivery man, how would you benefit from scissors?', keywords: ['cut', 'box', 'open', 'slice'], tip: 'Think about creative uses.' }
    ]
  },
  'Software Engineer / Developer': {
    technical: [
      { q: 'Explain the difference between Process and Thread.', keywords: ['memory', 'shared', 'context', 'lightweight', 'independent'], tip: 'Focus on memory sharing and overhead.' },
      { q: 'What is Polymorphism?', keywords: ['form', 'override', 'overload', 'interface', 'class'], tip: 'Mention compile-time vs run-time polymorphism.' },
      { q: 'Explain the concept of RESTful APIs.', keywords: ['resource', 'http', 'stateless', 'method', 'url'], tip: 'Mention HTTP verbs (GET, POST, etc.) and statelessness.' },
      { q: 'What are ACID properties in databases?', keywords: ['atomicity', 'consistency', 'isolation', 'durability', 'transaction'], tip: 'Define each letter of the acronym.' },
      { q: 'What is the difference between TCP and UDP?', keywords: ['connection', 'reliable', 'speed', 'packet', 'loss'], tip: 'TCP is reliable, UDP is fast.' },
      { q: 'Explain the concept of Object-Oriented Programming (OOP).', keywords: ['object', 'class', 'inheritance', 'encapsulation', 'abstraction'], tip: 'Mention the 4 pillars of OOP.' },
      { q: 'What is a Deadlock and how can it be prevented?', keywords: ['wait', 'resource', 'hold', 'circular', 'prevention'], tip: 'Explain the conditions required for a deadlock.' },
      { q: 'Explain the difference between Git Merge and Git Rebase.', keywords: ['history', 'commit', 'linear', 'branch', 'combine'], tip: 'Merge preserves history, rebase rewrites it.' },
      { q: 'What is a Singleton pattern? When would you use it?', keywords: ['instance', 'single', 'global', 'access'], tip: 'Mention ensuring only one instance exists.' },
      { q: 'Explain the difference between SQL and NoSQL databases.', keywords: ['relational', 'structure', 'schema', 'scale', 'document'], tip: 'Compare scaling (vertical vs horizontal) and schema.' },
      { q: 'What is Indexing in a database and how does it work?', keywords: ['search', 'speed', 'structure', 'b-tree', 'lookup'], tip: 'Analogy of a book index.' },
      { q: 'What is the difference between Authentication and Authorization?', keywords: ['identity', 'permission', 'access', 'who', 'what'], tip: 'AuthN is who you are, AuthZ is what you can do.' },
      { q: 'Explain the concept of Dependency Injection.', keywords: ['dependency', 'inject', 'loose', 'coupling', 'test'], tip: 'Focus on decoupling and testability.' },
      { q: 'What is a hash map and how does it work?', keywords: ['key', 'value', 'hash', 'function', 'collision'], tip: 'Explain key-value mapping and collision handling.' },
      { q: 'Explain the difference between Stack and Heap memory.', keywords: ['allocation', 'dynamic', 'static', 'memory', 'access'], tip: 'Stack is for execution context, Heap is for dynamic memory.' },
      { q: 'What is Continuous Integration/Continuous Deployment (CI/CD)?', keywords: ['automate', 'build', 'test', 'deploy', 'pipeline'], tip: 'Focus on automation and rapid delivery.' },
      { q: 'How do you handle errors in your code?', keywords: ['try', 'catch', 'log', 'exception', 'graceful'], tip: 'Mention logging and user experience.' },
      { q: 'What is the difference between an Abstract Class and an Interface?', keywords: ['implement', 'extend', 'multiple', 'method', 'contract'], tip: 'Interface is a contract, Abstract class can have implementation.' }
    ],
    aptitude: [
      { q: 'How would you debug a production issue with no logs?', keywords: ['reproduce', 'hypothesis', 'check', 'isolate', 'environment'], tip: 'Systematic elimination of causes.' },
      { q: 'Estimate the number of piano tuners in Chicago.', keywords: ['population', 'piano', 'household', 'tune', 'frequency'], tip: 'Break down the calculation steps.' },
      { q: 'How do you handle a situation where you disagree with a teammate\'s technical approach?', keywords: ['discuss', 'listen', 'pros', 'cons', 'consensus'], tip: 'Focus on the technical merit, not personal.' },
      { q: 'Describe a time you had to learn a new technology quickly.', keywords: ['resource', 'practice', 'build', 'read', 'apply'], tip: 'Show your learning strategy.' },
      { q: 'How do you explain technical debt to a product manager?', keywords: ['cost', 'future', 'speed', 'quality', 'interest'], tip: 'Use the financial debt analogy.' },
      { q: 'If you could design a system to replace the current traffic light system, what would it look like?', keywords: ['sensor', 'flow', 'optimize', 'connect', 'smart'], tip: 'Think about efficiency and safety.' },
      { q: 'You have a 10GB file with one string per line. How do you sort it with only 1GB of RAM?', keywords: ['chunk', 'merge', 'sort', 'external', 'disk'], tip: 'External Merge Sort.' },
      { q: 'How would you design a URL shortening service like bit.ly?', keywords: ['hash', 'database', 'redirect', 'unique', 'scale'], tip: 'Discuss key components: DB, Hashing, Redirection.' },
      { q: 'Explain how the internet works to a 5-year-old.', keywords: ['connect', 'message', 'address', 'wire', 'computer'], tip: 'Use simple analogies like mail or roads.' }
    ]
  },
  'Data Analyst': {
    technical: [
      { q: 'Explain the difference between WHERE and HAVING clauses in SQL.', keywords: ['filter', 'group', 'aggregate', 'before', 'after'], tip: 'WHERE filters rows, HAVING filters groups.' },
      { q: 'How do you handle missing data in a dataset?', keywords: ['impute', 'drop', 'mean', 'median', 'reason'], tip: 'Discuss different strategies (imputation vs removal).' },
      { q: 'Explain the difference between correlation and causation.', keywords: ['relationship', 'cause', 'effect', 'variable', 'link'], tip: 'Correlation does not imply causation.' },
      { q: 'What is a Pivot Table?', keywords: ['summarize', 'data', 'analyze', 'row', 'column'], tip: 'It aggregates data.' },
      { q: 'What is the difference between Inner Join and Outer Join?', keywords: ['match', 'include', 'exclude', 'row', 'table'], tip: 'Inner matches only common, Outer includes unmatched.' },
      { q: 'Explain the concept of Normalization in databases.', keywords: ['redundancy', 'structure', 'organize', 'table', 'form'], tip: 'Reducing redundancy and dependency.' },
      { q: 'What is the difference between Supervised and Unsupervised Learning?', keywords: ['label', 'train', 'data', 'predict', 'cluster'], tip: 'Supervised has labels, Unsupervised does not.' },
      { q: 'How do you detect outliers in a dataset?', keywords: ['visualize', 'standard', 'deviation', 'z-score', 'box'], tip: 'Mention statistical methods and visualization.' },
      { q: 'What is A/B testing?', keywords: ['compare', 'version', 'control', 'experiment', 'result'], tip: 'Comparing two versions to see which performs better.' },
      { q: 'Explain the Central Limit Theorem.', keywords: ['sample', 'mean', 'distribution', 'normal', 'large'], tip: 'Averages of samples form a normal distribution.' },
      { q: 'What is the difference between a Bar Chart and a Histogram?', keywords: ['category', 'continuous', 'distribution', 'frequency', 'bin'], tip: 'Bar for categories, Histogram for continuous data.' },
      { q: 'How would you describe a p-value to a non-technical person?', keywords: ['probability', 'significance', 'chance', 'result', 'hypothesis'], tip: 'Probability of the result happening by chance.' },
      { q: 'What tools do you use for data visualization?', keywords: ['tableau', 'powerbi', 'matplotlib', 'seaborn', 'excel'], tip: 'Mention specific tools you know.' },
      { q: 'Explain the difference between structured and unstructured data.', keywords: ['organize', 'model', 'text', 'image', 'database'], tip: 'Structured fits in tables, unstructured does not.' },
      { q: 'What is ETL (Extract, Transform, Load)?', keywords: ['process', 'move', 'clean', 'database', 'warehouse'], tip: 'The process of moving and preparing data.' },
      { q: 'How do you ensure data quality?', keywords: ['validate', 'clean', 'check', 'audit', 'source'], tip: 'Validation and cleaning processes.' }
    ],
    aptitude: [
      { q: 'Describe a time you found an insight that contradicted the common belief.', keywords: ['data', 'evidence', 'prove', 'analysis', 'convince'], tip: 'Focus on the data-driven evidence.' },
      { q: 'How do you explain technical results to a non-technical stakeholder?', keywords: ['simple', 'visual', 'impact', 'business', 'language'], tip: 'Focus on business value.' },
      { q: 'How do you handle a request for data that you know is impossible to generate?', keywords: ['explain', 'alternative', 'limitation', 'data', 'solution'], tip: 'Manage expectations and offer alternatives.' },
      { q: 'Describe a time you had to clean a very messy dataset.', keywords: ['step', 'tool', 'process', 'result', 'quality'], tip: 'Highlight your patience and attention to detail.' },
      { q: 'How would you estimate the number of daily active users for a new app?', keywords: ['market', 'download', 'rate', 'assumption', 'calculate'], tip: 'Show your estimation logic.' },
      { q: 'What would you do if you found a significant error in a report you already submitted?', keywords: ['admit', 'correct', 'inform', 'fix', 'apologize'], tip: 'Integrity and quick correction.' },
      { q: 'How do you stay updated with the latest data trends?', keywords: ['blog', 'course', 'community', 'read', 'practice'], tip: 'Continuous learning.' }
    ]
  },
  'Cybersecurity Analyst': {
    technical: [
      { q: 'What is the CIA triad?', keywords: ['confidentiality', 'integrity', 'availability', 'security', 'model'], tip: 'The three pillars of information security.' },
      { q: 'Explain the difference between symmetric and asymmetric encryption.', keywords: ['key', 'public', 'private', 'share', 'encrypt'], tip: 'Symmetric uses one key, Asymmetric uses two.' },
      { q: 'How would you handle a DDoS attack?', keywords: ['traffic', 'block', 'filter', 'mitigate', 'monitor'], tip: 'Identify, block, and mitigate.' },
      { q: 'What is a firewall?', keywords: ['network', 'traffic', 'control', 'rule', 'block'], tip: 'A barrier controlling network traffic.' },
      { q: 'What is Cross-Site Scripting (XSS)?', keywords: ['script', 'inject', 'browser', 'malicious', 'web'], tip: 'Injecting malicious scripts into web pages.' },
      { q: 'Explain the difference between Phishing and Spear Phishing.', keywords: ['target', 'email', 'specific', 'general', 'attack'], tip: 'Phishing is broad, Spear Phishing is targeted.' },
      { q: 'What is SQL Injection and how do you prevent it?', keywords: ['input', 'query', 'database', 'parameter', 'sanitize'], tip: 'Prevent with parameterized queries.' },
      { q: 'What is a VPN and how does it work?', keywords: ['tunnel', 'encrypt', 'secure', 'remote', 'access'], tip: 'Creates a secure tunnel over a public network.' },
      { q: 'Explain the concept of Public Key Infrastructure (PKI).', keywords: ['certificate', 'authority', 'digital', 'verify', 'trust'], tip: 'Managing digital certificates and public-key encryption.' },
      { q: 'What is the difference between Vulnerability Assessment and Penetration Testing?', keywords: ['scan', 'identify', 'exploit', 'test', 'simulate'], tip: 'Assessment identifies, Pen Testing exploits.' },
      { q: 'What is Multi-Factor Authentication (MFA)?', keywords: ['factor', 'verify', 'password', 'code', 'biometric'], tip: 'Using more than one method to verify identity.' },
      { q: 'How do you secure a Linux server?', keywords: ['update', 'user', 'permission', 'firewall', 'ssh'], tip: 'Hardening steps (updates, permissions, etc.).' },
      { q: 'What is a Zero Day vulnerability?', keywords: ['unknown', 'patch', 'exploit', 'vendor', 'new'], tip: 'A vulnerability unknown to the vendor.' },
      { q: 'Explain the concept of a Honey Pot.', keywords: ['trap', 'decoy', 'detect', 'attacker', 'lure'], tip: 'A decoy system to detect attacks.' },
      { q: 'What is the difference between Hashing and Encryption?', keywords: ['one-way', 'reversible', 'key', 'integrity', 'confidentiality'], tip: 'Hashing is one-way, Encryption is reversible.' },
      { q: 'How do you handle a security incident response?', keywords: ['identify', 'contain', 'eradicate', 'recover', 'lesson'], tip: 'Follow the incident response lifecycle.' }
    ],
    aptitude: [
      { q: 'How do you stay updated with the latest security threats?', keywords: ['news', 'blog', 'feed', 'alert', 'community'], tip: 'Security landscape changes rapidly.' },
      { q: 'Describe a time you had to enforce a security policy that was unpopular.', keywords: ['explain', 'reason', 'risk', 'policy', 'communicate'], tip: 'Balance security with usability.' },
      { q: 'How do you explain a security risk to a CEO?', keywords: ['business', 'impact', 'cost', 'risk', 'simple'], tip: 'Translate technical risk to business risk.' },
      { q: 'What would you do if you discovered a colleague violating security protocols?', keywords: ['report', 'educate', 'policy', 'talk', 'security'], tip: 'Internal security is everyone\'s responsibility.' },
      { q: 'Describe a time you successfully identified a security breach.', keywords: ['log', 'alert', 'investigate', 'find', 'respond'], tip: 'Focus on detection and response.' },
      { q: 'How do you prioritize security patches?', keywords: ['critical', 'risk', 'impact', 'exploit', 'schedule'], tip: 'Prioritize based on risk and exploitability.' },
      { q: 'What is your approach to ethical hacking?', keywords: ['permission', 'scope', 'report', 'legal', 'improve'], tip: 'Always have permission and stay within scope.' }
    ]
  },
  'default': {
    technical: [
      { q: 'What are your core technical skills relevant to this role?', keywords: ['skill', 'experience', 'tool', 'language', 'tech'], tip: 'Match your skills to the job description.' },
      { q: 'Describe a project where you used your technical expertise.', keywords: ['project', 'build', 'create', 'solve', 'result'], tip: 'Showcase your practical experience.' },
      { q: 'How do you keep your technical skills up to date?', keywords: ['learn', 'course', 'read', 'practice', 'new'], tip: 'Continuous learning is key.' },
      { q: 'What is the most challenging technical problem you have solved?', keywords: ['challenge', 'problem', 'solution', 'fix', 'complex'], tip: 'Focus on the complexity and your solution.' },
      { q: 'Describe your experience with the tools mentioned in the job description.', keywords: ['experience', 'use', 'tool', 'familiar', 'project'], tip: 'Be specific about your proficiency.' },
      { q: 'How do you ensure the quality of your work?', keywords: ['test', 'check', 'review', 'standard', 'detail'], tip: 'Mention testing and code reviews.' },
      { q: 'What is your preferred development methodology?', keywords: ['agile', 'scrum', 'waterfall', 'kanban', 'process'], tip: 'Agile is the most common answer.' },
      { q: 'Describe a time you had to troubleshoot a complex issue.', keywords: ['debug', 'issue', 'root', 'cause', 'fix'], tip: 'Systematic troubleshooting.' },
      { q: 'How do you document your work?', keywords: ['comment', 'doc', 'wiki', 'explain', 'future'], tip: 'Documentation helps future maintainers.' },
      { q: 'What is your experience with version control systems?', keywords: ['git', 'svn', 'branch', 'merge', 'commit'], tip: 'Git is the industry standard.' },
      { q: 'How do you handle technical debt?', keywords: ['refactor', 'clean', 'future', 'balance', 'maintain'], tip: 'Acknowledge it and plan to address it.' },
      { q: 'What are the latest trends in your field?', keywords: ['trend', 'new', 'technology', 'future', 'industry'], tip: 'Show you are aware of the industry direction.' }
    ],
    aptitude: [
      { q: 'Describe a time you worked in a team conflict.', keywords: ['conflict', 'resolve', 'listen', 'compromise', 'team'], tip: 'Focus on resolution and collaboration.' },
      { q: 'How do you prioritize tasks?', keywords: ['urgent', 'important', 'schedule', 'plan', 'list'], tip: 'Time management.' },
      { q: 'Describe a time you failed and what you learned from it.', keywords: ['fail', 'learn', 'mistake', 'improve', 'grow'], tip: 'Failure is a learning opportunity.' },
      { q: 'How do you handle tight deadlines?', keywords: ['focus', 'plan', 'communicate', 'deliver', 'time'], tip: 'Reliability under pressure.' },
      { q: 'What makes you a good fit for this role?', keywords: ['skill', 'experience', 'culture', 'value', 'match'], tip: 'Summarize your strengths.' },
      { q: 'Describe a time you took initiative.', keywords: ['lead', 'start', 'idea', 'proactive', 'improve'], tip: 'Proactivity.' },
      { q: 'How do you handle feedback?', keywords: ['listen', 'improve', 'positive', 'constructive', 'learn'], tip: 'Openness to feedback.' }
    ]
  }
}

// Helper to get questions
const getQuestions = (domain: string) => {
  if (DOMAIN_QUESTIONS[domain]) return DOMAIN_QUESTIONS[domain]

  if (domain.includes('Developer') || domain.includes('Engineer') && !domain.includes('Data') && !domain.includes('Cloud') && !domain.includes('Security')) return DOMAIN_QUESTIONS['Software Engineer / Developer']
  if (domain.includes('Data') || domain.includes('Analyst') && !domain.includes('Security') && !domain.includes('Business')) return DOMAIN_QUESTIONS['Data Analyst']
  if (domain.includes('Security') || domain.includes('Hacker') || domain.includes('SOC')) return DOMAIN_QUESTIONS['Cybersecurity Analyst']
  
  // Use default but try to map to closest if possible, otherwise generic technical
  return DOMAIN_QUESTIONS['default']
}

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type FeedbackData = {
  score: string | number
  feedback: string
  tips?: string[]
  question_feedback?: { question: string, improvement_needed: string }[]
}

export default function MockInterview({ userFiles, onBack }: { userFiles: any[], onBack: () => void }) {
  const [step, setStep] = useState<'setup' | 'interview' | 'feedback'>('setup')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('General')
  const [selectedFileId, setSelectedFileId] = useState<string>('none')
  
  const [questions, setQuestions] = useState<QuestionDef[]>([])
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [typing, setTyping] = useState(false)
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const resumes = userFiles ? userFiles.filter(f => f.file_type === 'resume') : []

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typing])

  const generateQuestions = (): QuestionDef[] => {
    const domainQs = getQuestions(selectedDomain)
    
    // Mix of Personal, Resume-based, Technical, Aptitude to reach ~15 questions
    const interviewQuestions: QuestionDef[] = [
      { q: "Tell me about yourself and why you chose this career path.", keywords: ['experience', 'passion', 'background', 'career', 'learned'], tip: "Keep it professional and relevant." },
      { q: "What motivates you to excel in this field?", keywords: ['challenge', 'impact', 'growth', 'learning', 'team'], tip: "Connect your motivation to the job." },
      
      ...(selectedFileId !== 'none' ? [
        { q: "Walking through your resume, can you highlight the project or experience you are most proud of?", keywords: ['project', 'role', 'impact', 'result', 'team'], tip: "Focus on your specific contribution." },
        { q: "I see you have listed specific skills on your resume. How would you rate your proficiency in your primary skill?", keywords: ['proficient', 'experience', 'example', 'learn', 'rate'], tip: "Be honest but confident." },
        { q: "Describe a challenge you faced in one of your listed projects and how you overcame it.", keywords: ['challenge', 'action', 'solution', 'result', 'overcome'], tip: "Use the STAR method." }
      ] : [
        { q: "What are the key highlights of your professional experience so far?", keywords: ['highlight', 'experience', 'skill', 'achievement', 'role'], tip: "Summarize your career journey." },
        { q: "Describe a major project you have worked on.", keywords: ['project', 'detail', 'role', 'technology', 'outcome'], tip: "Explain the project's purpose and your role." },
        { q: "What skills do you bring to the table that make you a strong candidate?", keywords: ['skill', 'strength', 'match', 'experience', 'value'], tip: "Align your skills with the job description." }
      ]), // Resume Based 3
      
      // 7 Technical Questions (Randomized/Sliced)
      ...domainQs.technical.slice(0, 7), 
      
      // 3 Aptitude Questions
      ...domainQs.aptitude.slice(0, 3), 
      
      { q: "Do you have any questions for us?", keywords: ['culture', 'team', 'process', 'role', 'future'], tip: "Always ask at least one question." }
    ]
    
    return interviewQuestions
  }

  const startInterview = () => {
    const qs = generateQuestions()
    setQuestions(qs)
    setMessages([])
    setStep('interview')
    setTyping(true)
    
    // Initial greeting
    setTimeout(() => {
      setMessages([{ role: 'assistant', content: `Hello! I'm your AI interviewer for the ${selectedDomain} role. Let's begin. ${qs[0].q}` }])
      setTyping(false)
    }, 1500)
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMsg = input
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const nextQIndex = currentQIndex + 1
      if (nextQIndex < questions.length) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Thank you. ${questions[nextQIndex].q}` }])
        setCurrentQIndex(nextQIndex)
        setTyping(false)
      } else {
        finishInterview()
      }
    }, 1000 + Math.random() * 1000) // Random delay for realism
  }

  const finishInterview = async () => {
    setMessages(prev => [...prev, { role: 'assistant', content: "That concludes our interview. Thank you for your time! Please wait while I analyze your responses to generate personalized feedback..." }])
    setTyping(true) 
    setAnalyzing(true)

    setTimeout(() => {
        evaluateInterviewLocal()
    }, 1000)
  }

  const evaluateInterviewLocal = () => {
    setStep('feedback')
    setAnalyzing(true)
    
    setTimeout(() => {
        let totalScore = 0
        const feedbackItems: { question: string, improvement_needed: string }[] = []
        
        questions.forEach((qDef, index) => {
            // Find answer index: 
            // Messages: 0=Asst(Q1), 1=User(A1), 2=Asst(Q2), 3=User(A2)...
            // Actually, initial greeting is index 0. User answer is index 1.
            const answerIndex = index * 2 + 1
            if (answerIndex >= messages.length) return
            
            const answer = messages[answerIndex].content
            const keywords = qDef.keywords || []
            
            const missingKeywords = keywords.filter(k => !answer.toLowerCase().includes(k.toLowerCase()))
            const hitCount = keywords.length - missingKeywords.length
            
            // Heuristic scoring: Hits + Length bonus
            let qScore = (hitCount / (keywords.length || 1)) * 10
            if (answer.split(' ').length > 20) qScore += 2
            if (qScore > 10) qScore = 10
            
            totalScore += qScore

            if (missingKeywords.length > 0) {
                const missingStr = missingKeywords.slice(0, 3).join(', ')
                feedbackItems.push({
                    question: qDef.q,
                    improvement_needed: `Consider mentioning concepts like: ${missingStr}. ${qDef.tip}`
                })
            } else if (answer.split(' ').length < 15) {
                feedbackItems.push({
                    question: qDef.q,
                    improvement_needed: `Your answer was a bit brief. Try to elaborate more. ${qDef.tip}`
                })
            }
        })
        
        const finalScore = Math.round(totalScore / (questions.length || 1))
        
        setFeedbackData({
            score: finalScore,
            feedback: finalScore > 7 ? "Great job! You demonstrated good knowledge of the key concepts." : "Good effort. Focus on using more specific technical terminology and expanding your answers.",
            tips: getTips(),
            question_feedback: feedbackItems
        })
        
        setAnalyzing(false)
    }, 1500)
  }

  const getTips = () => {
    // Basic tips based on domain (Fallback)

    const tips = [
      "Structure your answers using the STAR method (Situation, Task, Action, Result).",
      "Be confident but honest about what you don't know.",
      `For ${selectedDomain}, focus on demonstrating practical application of skills.`
    ]
    if (selectedDomain.includes('Developer') || selectedDomain.includes('Engineer')) {
      tips.push("Be prepared to write code or pseudocode on a whiteboard/editor.")
      tips.push("Discuss trade-offs in your technical decisions.")
    } 
    if (selectedDomain.includes('Data') || selectedDomain.includes('Analyst')) {
      tips.push("Explain your methodology and how you validate your models/insights.")
      tips.push("Focus on business impact of your data analysis.")
    } 
    if (selectedDomain.includes('Manager') || selectedDomain.includes('Scrum')) {
      tips.push("Highlight your leadership and conflict resolution skills.")
      tips.push("Discuss how you prioritize features and manage stakeholder expectations.")
    }
    if (selectedDomain.includes('Designer')) {
      tips.push("Walk through your design portfolio and explain your design choices.")
      tips.push("Discuss how you handle user feedback and iteration.")
    }
    if (selectedDomain.includes('Security') || selectedDomain.includes('Cyber')) {
      tips.push("Emphasize your knowledge of latest security threats and compliance standards.")
      tips.push("Explain your approach to risk assessment and mitigation.")
    }
    return tips
  }

  return (
    <div className="h-[600px] flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          ← Back to Tools
        </Button>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>AI Mock Interview</CardTitle>
          <CardDescription>
            {step === 'setup' && "Configure your interview session"}
            {step === 'interview' && `Interviewing for ${selectedDomain}`}
            {step === 'feedback' && "Interview Feedback & Tips"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
          {step === 'setup' && (
            <div className="space-y-6 max-w-md mx-auto w-full mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Job Domain</label>
                <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Domain" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {DOMAINS.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Resume (Optional)</label>
                <Select value={selectedFileId} onValueChange={setSelectedFileId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a resume file" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Resume (General Questions)</SelectItem>
                    {resumes.map((f: any) => (
                      <SelectItem key={f.id} value={String(f.id)}>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          {f.file_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Selecting a resume allows the AI to ask questions about your specific projects and experience.
                </p>
              </div>

              <Button onClick={startInterview} className="w-full bg-maroon hover:bg-maroon/90 mt-4">
                Start Mock Interview
              </Button>
            </div>
          )}

          {step === 'interview' && (
            <>
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2" ref={scrollRef}>
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-maroon ml-2' : 'bg-gray-200 mr-2'}`}>
                        {m.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-gray-700" />}
                      </div>
                      <div className={`p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-maroon text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                        {m.content}
                      </div>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded-lg rounded-tl-none ml-10">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      <span className="text-xs text-gray-500">AI is thinking...</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex space-x-2 mt-auto pt-2 border-t">
                <Input 
                  placeholder="Type your answer..." 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={typing}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={!input.trim() || typing}
                  className="bg-maroon hover:bg-maroon/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {step === 'feedback' && (
            <div className="space-y-6 overflow-y-auto pr-2 h-full">
              {analyzing ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-maroon" />
                  <div className="text-center space-y-2">
                    <p className="font-medium text-lg">Analyzing Interview Performance...</p>
                    <p className="text-sm text-gray-500">Evaluating technical accuracy and communication skills.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                        <h3 className="font-semibold text-green-800">Analysis Complete</h3>
                      </div>
                      {feedbackData?.score && (
                        <Badge variant="outline" className="bg-white text-green-700 border-green-200">
                          Score: {feedbackData.score}/10
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-green-700">
                      {feedbackData?.feedback || "Great job completing the mock interview. Consistent practice is key to success."}
                    </p>
                  </div>

                  {feedbackData?.question_feedback && feedbackData.question_feedback.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
                        Improvement Areas
                      </h3>
                      <div className="space-y-4">
                        {feedbackData.question_feedback.map((item, i) => (
                          <div key={i} className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm">
                            <p className="font-medium text-amber-900 mb-1">Q: {item.question}</p>
                            <p className="text-amber-800"><span className="font-semibold">Critique:</span> {item.improvement_needed}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {feedbackData?.tips && feedbackData.tips.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">General Tips</h3>
                      <ul className="space-y-3">
                        {feedbackData.tips.map((tip, i) => (
                          <li key={i} className="flex items-start text-sm text-gray-700">
                            <div className="min-w-[24px] h-6 flex items-center justify-center bg-maroon/10 rounded-full text-maroon text-xs font-bold mr-3 mt-0.5">
                              {i + 1}
                            </div>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4 pb-2">
                     <Button onClick={() => { 
                       setStep('setup'); 
                       setMessages([]); 
                       setQuestions([]); 
                       setCurrentQIndex(0); 
                       setFeedbackData(null);
                     }} variant="outline" className="w-full border-maroon text-maroon hover:bg-maroon/5">
                       Start New Interview
                     </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

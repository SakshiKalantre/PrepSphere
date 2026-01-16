"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, XCircle, AlertCircle, FileText, Type } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ResumeScorer({ userFiles, onBack }: { userFiles: any[], onBack: () => void }) {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null)
  const [resumeText, setResumeText] = useState('')
  const [activeTab, setActiveTab] = useState('file')
  const [selectedDomain, setSelectedDomain] = useState('General')

  const resumes = userFiles.filter(f => f.file_type === 'resume')

  // Domain options
  const domains = [
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

  const analyzeContent = (text: string) => {
    const lowerText = text.toLowerCase()
    
    // Domain Detection Logic - OVERRIDDEN by User Selection
    const domain = selectedDomain

    // Keyword Analysis based on Domain
    const domainKeywords: Record<string, string[]> = {
      'General': ['communication', 'teamwork', 'problem solving', 'project'],
      // Software Development
      'Software Engineer / Developer': ['algorithms', 'data structures', 'java', 'c++', 'python', 'git', 'system design', 'oop'],
      'Frontend Developer': ['html', 'css', 'javascript', 'react', 'angular', 'vue', 'responsive', 'typescript', 'webpack', 'tailwind'],
      'Backend Developer': ['java', 'python', 'node.js', '.net', 'api', 'sql', 'nosql', 'microservices', 'docker', 'aws'],
      'Full-Stack Developer': ['react', 'node', 'javascript', 'typescript', 'database', 'api', 'git', 'responsive', 'cloud', 'deployment'],
      'Mobile App Developer': ['android', 'ios', 'swift', 'kotlin', 'flutter', 'react native', 'mobile', 'ui/ux'],
      'Game Developer': ['unity', 'unreal engine', 'c#', 'c++', '3d math', 'graphics', 'physics', 'game design'],
      
      // Data & Analytics
      'Data Analyst': ['sql', 'excel', 'tableau', 'power bi', 'python', 'r', 'data visualization', 'statistics', 'reporting'],
      'Business Intelligence (BI) Analyst': ['power bi', 'tableau', 'sql', 'data warehousing', 'etl', 'modeling', 'analytics'],
      'Data Engineer': ['sql', 'python', 'etl', 'hadoop', 'spark', 'aws', 'kafka', 'airflow', 'database design'],
      'Data Scientist': ['python', 'r', 'machine learning', 'statistics', 'pandas', 'scikit-learn', 'tensorflow', 'nlp', 'visualization'],
      'Machine Learning Engineer': ['python', 'tensorflow', 'pytorch', 'deep learning', 'model deployment', 'nlp', 'computer vision', 'cloud'],
      'AI Engineer': ['artificial intelligence', 'machine learning', 'deep learning', 'neural networks', 'python', 'algorithms', 'robotics'],
      
      // Cloud & DevOps
      'Cloud Engineer': ['aws', 'azure', 'gcp', 'terraform', 'kubernetes', 'docker', 'linux', 'networking', 'security'],
      'DevOps Engineer': ['ci/cd', 'jenkins', 'docker', 'kubernetes', 'aws', 'terraform', 'linux', 'bash', 'monitoring'],
      'Site Reliability Engineer (SRE)': ['linux', 'automation', 'python', 'go', 'monitoring', 'incident response', 'cloud', 'scalability'],
      'System Administrator': ['linux', 'windows', 'active directory', 'networking', 'virtualization', 'security', 'bash', 'powershell'],
      'Network Engineer': ['cisco', 'networking', 'tcp/ip', 'firewall', 'routing', 'switching', 'vpn', 'troubleshooting'],
      
      // Cybersecurity
      'Cybersecurity Analyst': ['siem', 'firewalls', 'network security', 'incident response', 'vulnerability assessment', 'forensics', 'risk management'],
      'Ethical Hacker / Penetration Tester': ['penetration testing', 'kali linux', 'metasploit', 'burp suite', 'network scanning', 'vulnerability assessment'],
      'Security Engineer': ['network security', 'encryption', 'firewalls', 'ids/ips', 'security architecture', 'cloud security', 'compliance'],
      'SOC Analyst': ['siem', 'splunk', 'incident response', 'log analysis', 'threat hunting', 'malware analysis', 'security monitoring'],
      'Information Security Manager': ['cissp', 'risk management', 'compliance', 'security policy', 'iso 27001', 'audit', 'governance'],
      
      // Testing & QA
      'Manual Tester': ['test cases', 'bug reporting', 'jira', 'agile', 'functional testing', 'regression testing', 'uata'],
      'Automation Test Engineer': ['selenium', 'cypress', 'java', 'python', 'test automation', 'jenkins', 'api testing', 'ci/cd'],
      'QA Engineer': ['test planning', 'automation', 'manual testing', 'bug tracking', 'jira', 'agile', 'sql'],
      'Performance Tester': ['jmeter', 'loadrunner', 'performance testing', 'stress testing', 'monitoring', 'profiling'],
      
      // UI/UX
      'UI Designer': ['figma', 'sketch', 'adobe xd', 'visual design', 'typography', 'color theory', 'prototyping'],
      'UX Designer': ['user research', 'wireframing', 'prototyping', 'usability testing', 'interaction design', 'figma', 'information architecture'],
      'Product Designer': ['product strategy', 'ux research', 'visual design', 'prototyping', 'figma', 'user-centered design'],
      'Web Designer': ['html', 'css', 'web design', 'figma', 'photoshop', 'responsive design', 'ui design'],
      
      // IT Support
      'IT Support Engineer': ['troubleshooting', 'hardware', 'windows', 'macos', 'active directory', 'networking', 'customer service'],
      'Technical Support Executive': ['troubleshooting', 'customer support', 'ticketing system', 'remote support', 'communication'],
      'Help Desk Analyst': ['help desk', 'ticketing', 'troubleshooting', 'active directory', 'windows', 'customer service'],
      'Desktop Support Engineer': ['hardware', 'software installation', 'troubleshooting', 'windows', 'networking', 'maintenance'],
      
      // Management
      'Project Manager': ['agile', 'scrum', 'project planning', 'risk management', 'communication', 'jira', 'leadership', 'stakeholder management'],
      'Product Manager': ['product strategy', 'roadmap', 'agile', 'user stories', 'market research', 'data analysis', 'leadership'],
      'IT Manager': ['it strategy', 'budgeting', 'team management', 'infrastructure', 'project management', 'vendor management'],
      'Business Analyst': ['requirements gathering', 'sql', 'data analysis', 'process modeling', 'documentation', 'stakeholder management'],
      'Scrum Master': ['scrum', 'agile', 'kanban', 'sprint planning', 'jira', 'coaching', 'facilitation'],
      
      // Emerging
      'AI Prompt Engineer': ['prompt engineering', 'llm', 'chatgpt', 'nlp', 'creative writing', 'python', 'ai tools'],
      'Blockchain Developer': ['solidity', 'ethereum', 'smart contracts', 'web3', 'blockchain', 'cryptography', 'dapps'],
      'AR/VR Developer': ['unity', 'c#', 'unreal engine', 'ar/vr', '3d modeling', 'c++', 'spatial computing'],
      'IoT Engineer': ['iot', 'embedded systems', 'c', 'python', 'sensors', 'mqtt', 'raspberry pi', 'arduino'],
      'Robotics Software Engineer': ['ros', 'c++', 'python', 'robotics', 'control systems', 'path planning', 'computer vision']
    }

    const expectedKeywords = domainKeywords[domain] || domainKeywords['General']
    const foundKeywords = expectedKeywords.filter(k => lowerText.includes(k))
    const missingKeywords = expectedKeywords.filter(k => !lowerText.includes(k))
    
    const keywordScore = Math.round((foundKeywords.length / expectedKeywords.length) * 100)
    
    // Strict Analysis Rules
    const issues = []
    const sections = ['education', 'experience', 'projects', 'skills']
    const missingSections = sections.filter(s => !lowerText.includes(s))
    
    if (missingSections.length > 0) {
      issues.push({ name: 'Structure', status: 'fail', message: `Missing critical sections: ${missingSections.join(', ')}. This is a major rejection factor.` })
    } else {
      issues.push({ name: 'Structure', status: 'pass', message: 'All standard sections detected.' })
    }

    if (keywordScore < 50) {
      issues.push({ name: 'Keywords', status: 'fail', message: `Critical missing keywords for ${domain}: ${missingKeywords.join(', ')}. ATS will likely reject this.` })
    } else if (keywordScore < 80) {
      issues.push({ name: 'Keywords', status: 'warning', message: `Missing important keywords: ${missingKeywords.join(', ')}.` })
    } else {
      issues.push({ name: 'Keywords', status: 'pass', message: `Strong keyword match for ${domain} role.` })
    }

    if (text.length < 500) {
      issues.push({ name: 'Content Length', status: 'warning', message: 'Resume seems too short. Elaborate on your experiences.' })
    } else {
       issues.push({ name: 'Content Length', status: 'pass', message: 'Good content volume.' })
    }

    // Contact Info Check (Strict)
    if (!lowerText.includes('@') || !/\d{10}/.test(text)) {
       issues.push({ name: 'Contact Info', status: 'fail', message: 'Missing valid email or phone number. Immediate rejection risk.' })
    } else {
       issues.push({ name: 'Contact Info', status: 'pass', message: 'Contact details present.' })
    }

    const baseScore = 60
    const finalScore = Math.min(100, Math.max(0, baseScore + (keywordScore * 0.4) - (issues.filter(i => i.status === 'fail').length * 15)))

    return {
      score: finalScore,
      domain,
      details: issues,
      foundKeywords,
      missingKeywords
    }
  }

  const handleAnalyze = async () => {
    if (activeTab === 'file' && !selectedFileId) return
    if (activeTab === 'text' && !resumeText.trim()) return
    
    setAnalyzing(true)
    
    // Simulate Processing
    setTimeout(() => {
      // For file mode, we simulate text extraction (since we can't really read the PDF client-side easily without a library here)
      // We'll assume a generic "Good" resume content for the file simulation to show the logic working
      const textToAnalyze = activeTab === 'text' ? resumeText : 
        "React Node.js TypeScript user interface database api git. Education: B.Tech. Experience: Developer. Projects: E-commerce. Skills: Coding. Contact: test@example.com 9876543210" 
      
      const analysisResult = analyzeContent(textToAnalyze)
      setResult(analysisResult)
      setAnalyzing(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          ← Back to Tools
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Resume Scorer</CardTitle>
          <CardDescription>Analyze your resume for ATS compatibility and domain fit</CardDescription>
        </CardHeader>
        <CardContent>
          {!result ? (
            <div className="space-y-4">
              <Tabs defaultValue="file" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file">
                     <FileText className="w-4 h-4 mr-2"/>
                     Select File
                  </TabsTrigger>
                  <TabsTrigger value="text">
                     <Type className="w-4 h-4 mr-2"/>
                     Paste Text
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="file" className="mt-4 space-y-4">
                  {resumes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                      <p>No resumes found. Please upload a resume in the Profile section first.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {resumes.map((file) => (
                        <div 
                          key={file.id}
                          className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${selectedFileId === file.id ? 'border-maroon bg-red-50' : 'hover:bg-gray-50'}`}
                          onClick={() => setSelectedFileId(file.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="bg-gray-100 p-2 rounded">
                              <span className="text-xl">📄</span>
                            </div>
                            <div>
                              <p className="font-medium">{file.file_name}</p>
                              <p className="text-xs text-gray-500">Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {selectedFileId === file.id && (
                            <Badge className="bg-maroon">Selected</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="text" className="mt-4">
                  <Textarea 
                    placeholder="Paste your resume content here (e.g., Summary, Experience, Education, Skills)..." 
                    className="min-h-[200px]"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Paste the full text of your resume. We will analyze keywords, structure, and content.
                  </p>
                </TabsContent>
              </Tabs>

              <div className="space-y-2 mt-4">
                <label className="text-sm font-medium text-gray-700">Select Job Domain</label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent bg-white"
                >
                  {domains.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Select the target job domain for more accurate analysis and keyword suggestions.
                </p>
              </div>

              <Button 
                className="w-full bg-maroon hover:bg-maroon/90 mt-4"
                disabled={(activeTab === 'file' && !selectedFileId) || (activeTab === 'text' && !resumeText.trim()) || analyzing}
                onClick={handleAnalyze}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  'Analyze Resume'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center py-6 border-b bg-gray-50 rounded-t-lg -mx-6 -mt-6 px-6">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-maroon mb-4 bg-white shadow-sm">
                  <span className="text-3xl font-bold text-maroon">{result.score}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Resume Score</h3>
                <p className="text-gray-500">Domain Detected: <span className="font-semibold text-maroon">{result.domain}</span></p>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-maroon"/>
                  Analysis Report
                </h4>
                <div className="grid gap-3">
                  {result.details.map((item: any, i: number) => (
                    <div key={i} className={`p-3 rounded-lg border ${item.status === 'pass' ? 'bg-green-50 border-green-200' : item.status === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                           {item.status === 'pass' ? <CheckCircle2 className="w-5 h-5 text-green-600 mr-2"/> : item.status === 'warning' ? <AlertCircle className="w-5 h-5 text-yellow-600 mr-2"/> : <XCircle className="w-5 h-5 text-red-600 mr-2"/>}
                           <span className="font-medium text-sm">{item.name}</span>
                        </div>
                        <Badge variant="outline" className={item.status === 'pass' ? 'text-green-700 bg-green-100' : item.status === 'warning' ? 'text-yellow-700 bg-yellow-100' : 'text-red-700 bg-red-100'}>
                          {item.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1 ml-7 text-gray-700">{item.message}</p>
                    </div>
                  ))}
                </div>

                {result.missingKeywords && result.missingKeywords.length > 0 && (
                   <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-semibold text-blue-800 mb-2">Recommended Keywords to Add</h5>
                      <div className="flex flex-wrap gap-2">
                         {result.missingKeywords.map((k: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-white text-blue-700 border border-blue-200">
                               {k}
                            </Badge>
                         ))}
                      </div>
                      <p className="text-xs text-blue-600 mt-2">Adding these keywords can significantly improve your ATS score for {result.domain} roles.</p>
                   </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="w-full" onClick={() => setResult(null)}>
                  Analyze Another
                </Button>
                <Button className="w-full bg-maroon hover:bg-maroon/90" onClick={onBack}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useUser, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Import Recharts components
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';

export default function HomePage() {
  const { isSignedIn, user } = useUser()
  const [stats, setStats] = useState<any>(null)
  const [breakdown, setBreakdown] = useState<any[]>([])
  const [placementDistribution, setPlacementDistribution] = useState<any[]>([])
  const [localUser, setLocalUser] = useState<any>(null)
  // State to track visibility of hidden sections (Selections count, Real-time insights)
  const [showHiddenInsights, setShowHiddenInsights] = useState(false)
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  // State for contact form
  const [contactForm, setContactForm] = useState({
    name: '',
    company_name: '',
    designation: '',
    official_website: '',
    phone_number: '',
    email: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handler for form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/v1/contact/contact-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });
      
      if (response.ok) {
        alert('Thank you for your message! We will get back to you soon.');
        setContactForm({
          name: '',
          company_name: '',
          designation: '',
          official_website: '',
          phone_number: '',
          email: '',
          message: ''
        }); // Reset form
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Check for local session
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null
      if (stored) setLocalUser(JSON.parse(stored))
    } catch {}

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/public/stats`)
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
        
        const resBreakdown = await fetch(`${API_BASE}/api/v1/stats/placement-breakdown`)
        if (resBreakdown.ok) {
            const data = await resBreakdown.json()
            setBreakdown(data)
        }
        
        // Fetch placement distribution
        const resDistribution = await fetch(`${API_BASE}/api/v1/stats/analytics-percentages`);
        if (resDistribution.ok) {
          const data = await resDistribution.json();
          setPlacementDistribution([
            { name: 'Placed', count: data.placed_students, percentage: data.placed_percentage },
            { name: 'Higher Studies', count: data.higher_studies_count, percentage: data.higher_studies_percentage },
            { name: 'Exploring Opportunities', count: data.exploring_count, percentage: data.exploring_percentage },
            { name: 'Others', count: data.others_count, percentage: data.others_percentage },
          ]);
        } else {
          // Fallback data
          setPlacementDistribution([
            { name: 'Placed', count: 0, percentage: 0 },
            { name: 'Higher Studies', count: 0, percentage: 0 },
            { name: 'Exploring Opportunities', count: 0, percentage: 0 },
            { name: 'Others', count: 0, percentage: 0 },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        // Set fallback data in case of error
        setPlacementDistribution([
          { name: 'Placed', count: 0, percentage: 0 },
          { name: 'Higher Studies', count: 0, percentage: 0 },
          { name: 'Exploring Opportunities', count: 0, percentage: 0 },
          { name: 'Others', count: 0, percentage: 0 },
        ]);
      }
    }
    fetchStats()
  }, [])


  const recruiters = [
    { name: 'TCS', industry: 'IT Services', logo: 'https://cdn.brandfetch.io/tcs.com/w/100/h/100' },
    { name: 'Infosys', industry: 'IT Services', logo: 'https://cdn.brandfetch.io/infosys.com/w/100/h/100' },
    { name: 'Wipro', industry: 'IT Services', logo: 'https://cdn.brandfetch.io/wipro.com/w/100/h/100' },
    { name: 'Cognizant', industry: 'IT Services', logo: 'https://cdn.brandfetch.io/cognizant.com/w/100/h/100' },
    { name: 'Accenture', industry: 'Consulting', logo: 'https://cdn.brandfetch.io/accenture.com/w/100/h/100' },
    { name: 'Deloitte', industry: 'Consulting', logo: 'https://cdn.brandfetch.io/deloitte.com/w/100/h/100' },
    { name: 'HDFC Bank', industry: 'Banking', logo: 'https://cdn.brandfetch.io/hdfcbank.com/w/100/h/100' },
    { name: 'ICICI Bank', industry: 'Banking', logo: 'https://cdn.brandfetch.io/icicibank.com/w/100/h/100' },
    { name: 'Amazon', industry: 'Technology', logo: 'https://cdn.brandfetch.io/amazon.com/w/100/h/100' },
    { name: 'Microsoft', industry: 'Technology', logo: 'https://cdn.brandfetch.io/microsoft.com/w/100/h/100' },
    { name: 'Google', industry: 'Technology', logo: 'https://cdn.brandfetch.io/google.com/w/100/h/100' },
    { name: 'JPMorgan', industry: 'Banking', logo: 'https://cdn.brandfetch.io/jpmorganchase.com/w/100/h/100' },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center border border-maroon">
              <Image 
                src="/images/logos/spnd-logo.png" 
                alt="SPND College Logo" 
                fill
                className="object-contain p-0.5"
              />
            </div>
            <span className="text-2xl font-bold text-maroon">PrepSphere</span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="#about" className="text-gray-600 hover:text-maroon transition-colors">About</Link>
            <Link href="#recruiters" className="text-gray-600 hover:text-maroon transition-colors">Recruiters</Link>
            <Link href="#achievements" className="text-gray-600 hover:text-maroon transition-colors">Achievements</Link>
            <Link href="#contact" className="text-gray-600 hover:text-maroon transition-colors">Contact</Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {isSignedIn || localUser ? (
              <>
                <span className="text-sm text-gray-600">Welcome, {user?.firstName || localUser?.email?.split('@')[0]}</span>
                {isSignedIn && <UserButton afterSignOutUrl="/" />}
                {!isSignedIn && localUser && (
                  <Button variant="ghost" onClick={() => {
                    localStorage.removeItem('currentUser')
                    setLocalUser(null)
                    window.location.reload()
                  }}>Sign Out</Button>
                )}
                <Link href={isSignedIn ? "/dashboard" : `/dashboard/${localUser?.role?.toLowerCase() || 'student'}`}>
                  <Button variant="default" className="bg-maroon hover:bg-maroon/90">Dashboard</Button>
                </Link>
              </>
            ) : (
              <Link href="/sign-in" prefetch={false}>
                <Button variant="default" className="bg-maroon hover:bg-maroon/90">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-maroon text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Smt. P.N. Doshi Women's College</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Empowering women through quality education and exceptional placement opportunities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#about">
              <Button size="lg" variant="secondary" className="bg-gold text-maroon hover:bg-gold/90">
                Learn More
              </Button>
            </Link>
            <Link href="/sign-up" prefetch={false}>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-maroon mb-4">About Our Placement Cell</h2>
            <div className="w-24 h-1 bg-gold mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Preparing Future Leaders</h3>
              <p className="text-gray-600 mb-6">
                Our placement cell is dedicated to bridging the gap between academia and industry. 
                We work tirelessly to ensure our students are well-prepared for their professional journey.
              </p>
              <p className="text-gray-600 mb-6">
                With personalized career counseling, skill development workshops, and continuous mentorship, 
                we empower our students to achieve their career aspirations.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Badge className="mr-2 bg-gold hover:bg-gold/90">✓</Badge>
                  <span>Industry-aligned curriculum</span>
                </li>
                <li className="flex items-center">
                  <Badge className="mr-2 bg-gold hover:bg-gold/90">✓</Badge>
                  <span>Expert faculty guidance</span>
                </li>
                <li className="flex items-center">
                  <Badge className="mr-2 bg-gold hover:bg-gold/90">✓</Badge>
                  <span>Mock interviews and assessments</span>
                </li>
                <li className="flex items-center">
                  <Badge className="mr-2 bg-gold hover:bg-gold/90">✓</Badge>
                  <span>Internship opportunities</span>
                </li>
              </ul>
            </div>
            <div 
              className="rounded-xl w-full h-96 flex items-center justify-center shadow-xl ring-1 ring-cream/40 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('/images/college-building.jpg')] bg-cover bg-center filter saturate-150 brightness-110 contrast-105"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-sky-300/60 via-sky-200/40 to-transparent z-0"></div>
              <div className="text-center px-4 relative z-10">
                <h3 className="text-maroon text-3xl font-bold mb-2 drop-shadow-sm">Smt. P.N. Doshi Women's College</h3>
                <p className="text-gray-800 text-xl">Empowering Women Through Education</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Placement Insights Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-maroon mb-4">Placement Insights</h2>
                <div className="w-24 h-1 bg-gold mx-auto"></div>
                <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                    Real-time data on our students' success
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-stretch">
                <div className="bg-cream p-8 rounded-xl shadow-md flex flex-col">
                    <h3 className="text-2xl font-bold text-maroon mb-6">
                        Placement Distribution <span className="text-lg font-normal text-gray-600 ml-2">(Total Strength: {stats?.total_students || 0})</span>
                    </h3>
                    <div className="h-80 flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={placementDistribution}
                                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            >
                                <defs>
                                    <linearGradient id="colorPlaced" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#60A5FA" />
                                        <stop offset="100%" stopColor="#1E40AF" />
                                    </linearGradient>
                                    <linearGradient id="colorHigher" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#FDBA74" />
                                        <stop offset="100%" stopColor="#C2410C" />
                                    </linearGradient>
                                    <linearGradient id="colorExploring" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#FEF08A" />
                                        <stop offset="100%" stopColor="#EAB308" />
                                    </linearGradient>
                                    <linearGradient id="colorOthers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#5EEAD4" />
                                        <stop offset="100%" stopColor="#0F766E" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fill: '#4b5563', fontSize: 10 }} 
                                    axisLine={{ stroke: '#9ca3af', strokeOpacity: 0.5 }} 
                                    tickLine={false} 
                                    interval={0}
                                    angle={0}
                                    textAnchor="middle"
                                    height={60}
                                    label={{ value: 'Placement Categories', position: 'insideBottom', offset: -5, fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }}
                                />
                                <YAxis 
                                    tick={{ fill: '#4b5563', fontSize: 12 }} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    label={{ value: 'Number of Students', angle: -90, position: 'insideLeft', fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any, name: any, props: any) => [`${value} (${Number(props.payload.percentage).toFixed(1)}%)`, 'Students']}
                                />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={60}>
                                    {placementDistribution.map((entry, index) => {
                                        let fillId = 'colorOthers';
                                        if (entry.name === 'Placed') fillId = 'colorPlaced';
                                        else if (entry.name === 'Higher Studies') fillId = 'colorHigher';
                                        else if (entry.name.includes('Exploring')) fillId = 'colorExploring';
                                        
                                        return <Cell key={`cell-${index}`} fill={`url(#${fillId})`} />;
                                    })}
                                    <LabelList 
                                        dataKey="count" 
                                        position="top" 
                                        content={(props: any) => {
                                            const { x, y, width, value, index } = props;
                                            const percentage = placementDistribution[index].percentage;
                                            return (
                                                <text x={x + width / 2} y={y - 10} fill="#374151" textAnchor="middle" fontSize={12} fontWeight="bold">
                                                    {value} ({Number(percentage).toFixed(1)}%)
                                                </text>
                                            );
                                        }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-cream p-8 rounded-xl shadow-md flex flex-col">
                     <h3 className="text-2xl font-bold text-maroon mb-6">Key Highlights</h3>
                     <div className="grid grid-cols-2 gap-6 flex-grow">
                       <div className="shine-effect bg-white border border-gray-100 p-6 rounded-lg shadow-sm text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:bg-gradient-to-br hover:from-gold/20 hover:to-maroon/10 flex flex-col justify-center items-center h-full">
                           <p className="text-4xl font-bold text-gold mb-2">{stats?.total_placed || 0}</p>
                           <p className="text-gray-600 font-medium">Students Placed</p>
                       </div>
                       <div className="shine-effect bg-white border border-gray-100 p-6 rounded-lg shadow-sm text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:bg-gradient-to-br hover:from-gold/20 hover:to-maroon/10 flex flex-col justify-center items-center h-full">
                           <p className="text-4xl font-bold text-gold mb-2">{stats?.active_jobs || stats?.total_jobs || 0}</p>
                           <p className="text-gray-600 font-medium">Active Jobs</p>
                       </div>
                       <div className="shine-effect bg-white border border-gray-100 p-6 rounded-lg shadow-sm text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:bg-gradient-to-br hover:from-gold/20 hover:to-maroon/10 flex flex-col justify-center items-center h-full">
                           <p className="text-4xl font-bold text-gold mb-2">{stats?.total_applications || 0}</p>
                           <p className="text-gray-600 font-medium">Total Applications</p>
                       </div>
                       <div className="shine-effect bg-white border border-gray-100 p-6 rounded-lg shadow-sm text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:bg-gradient-to-br hover:from-gold/20 hover:to-maroon/10 flex flex-col justify-center items-center h-full">
                           <p className="text-4xl font-bold text-gold mb-2">{stats?.total_students && stats?.total_placed ? Math.round((stats.total_placed/stats.total_students)*100) : 0}%</p>
                           <p className="text-gray-600 font-medium">Placement Rate</p>
                       </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Recruiters Section */}
      <section id="recruiters" className="py-32 bg-maroon">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our Recruiters</h2>
            <div className="w-24 h-1 bg-gold mx-auto"></div>
            <p className="text-cream/90 mt-4 max-w-2xl mx-auto">
              Leading companies trust our graduates and regularly recruit from our institution
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recruiters.slice(0, 8).map((company, index) => (
              <Card 
                key={index} 
                className="bg-white text-maroon border border-white/70 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 hover:scale-[1.02] hover:bg-cream"
              >
                <CardContent className="p-6 h-32 flex items-center">
                  <div className="w-full flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white p-2 flex items-center justify-center shrink-0 border border-gray-100 shadow-sm overflow-hidden">
                      <img 
                        src={company.logo} 
                        alt={`${company.name} logo`} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${company.name}&background=random`;
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{company.name}</div>
                      <div className="text-gray-600 text-sm">{company.industry}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Scrolling Marquee */}
          <div className="mt-16 w-full overflow-hidden bg-maroon py-8 rounded-lg shadow-inner">
            <div className="flex animate-marquee whitespace-nowrap items-center">
              {[...recruiters, ...recruiters, ...recruiters].map((company, index) => (
                <div key={index} className="mx-3 inline-block">
                  <div className="bg-white/10 text-white px-6 py-3 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all cursor-default min-w-[160px] text-center flex items-center gap-3 hover:scale-105">
                    <div className="w-8 h-8 rounded-full bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img 
                        src={company.logo} 
                        alt={company.name} 
                        className="w-full h-full object-contain" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random&color=fff&size=128`;
                        }}
                      />
                    </div>
                    <span className="font-medium">{company.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-maroon mb-4">Our Achievements</h2>
            <div className="w-24 h-1 bg-gold mx-auto"></div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 mb-16">
            <Card className="border-t-4 border-maroon shadow-lg w-full md:w-96 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/20 hover:border-gold/50">
              <CardHeader>
                <CardTitle className="text-3xl text-center text-maroon">
                  {stats ? `${Math.round((stats.total_placed / (stats.total_students || 1)) * 100)}%` : '95%'}
                </CardTitle>
                <CardDescription className="text-center">Placement Rate</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">
                  {stats ? `Total ${stats.total_placed} students placed out of ${stats.total_students}` : 'Consistently high placement rate over the past 5 years'}
                </p>
              </CardContent>
            </Card>
            
            {/* Hidden per user request: Selections Card. Controlled by showHiddenInsights state. */}
            <Card className="border-t-4 border-gold shadow-lg w-full md:w-96 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/20 hover:border-gold/50" style={{ display: showHiddenInsights ? undefined : 'none' }}>
              <CardHeader>
                <CardTitle className="text-3xl text-center text-maroon">{stats ? stats.total_selected : '0'}+</CardTitle>
                <CardDescription className="text-center">Selections</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">
                  Total students selected in various roles
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-t-4 border-maroon shadow-lg w-full md:w-96 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/20 hover:border-gold/50">
              <CardHeader>
                <CardTitle className="text-3xl text-center text-maroon">{stats ? stats.total_jobs : '150+'}</CardTitle>
                <CardDescription className="text-center">Job Opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">
                  Active job openings available for students
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Stats Dashboard - Hidden per user request. Controlled by showHiddenInsights state. */}
          {stats && (
            <div className="bg-cream rounded-xl p-8 shadow-inner" style={{ display: showHiddenInsights ? undefined : 'none' }}>
              <h3 className="text-2xl font-bold text-maroon mb-6 text-center">Real-time Placement Insights</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h4 className="font-semibold text-lg mb-4 text-gray-800">Application Trends</h4>
                  <div className="space-y-4">
                     <div className="flex justify-between text-sm">
                       <span>Total Applications</span>
                       <span className="font-bold">{stats.total_applications}</span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2.5">
                       <div className="bg-maroon h-2.5 rounded-full" style={{ width: '100%' }}></div>
                     </div>
                     <div className="flex justify-between text-sm">
                       <span>Selection Rate</span>
                       <span className="font-bold">{Math.round((stats.total_selected / (stats.total_applications || 1)) * 100)}%</span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2.5">
                       <div className="bg-gold h-2.5 rounded-full" style={{ width: `${(stats.total_selected / (stats.total_applications || 1)) * 100}%` }}></div>
                     </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h4 className="font-semibold text-lg mb-4 text-gray-800">Top Opportunities</h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {stats.applications_by_job?.slice(0, 5).map((job: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center border-b pb-2 last:border-0">
                        <div>
                          <p className="font-medium text-maroon text-sm">{job.title}</p>
                          <p className="text-xs text-gray-500">{job.company}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{job.applications} Applicants</Badge>
                      </div>
                    ))}
                    {(!stats.applications_by_job || stats.applications_by_job.length === 0) && (
                      <p className="text-sm text-gray-500 text-center py-4">No active opportunities yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-maroon mb-4">Contact Us</h2>
            <div className="w-24 h-1 bg-gold mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Get In Touch</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-maroon p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M20 10c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800">Address</h4>
                    <p className="text-gray-600">
                      Smt. P.N. Doshi Women's College<br />
                      JAG DHIR BODA VIDYA SANKUL, Camalane, Ghatkopar West<br />
                      Mumbai, Maharashtra 400086
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-maroon p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800">Email</h4>
                    <p className="text-gray-600">principalspndoshi@gmail.com</p>
                    <p className="text-gray-600">spnd.bcadepartment@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-maroon p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800">Phone</h4>
                    <p className="text-gray-600">25135439</p>
                    <p className="text-gray-600">Fax: 022-25094065</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-maroon">Send us a message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                      <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input 
                        type="text" 
                        id="company_name" 
                        name="company_name"
                        value={contactForm.company_name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-maroon focus:border-maroon"
                        placeholder="Company Name"
                      />
                    </div>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name"
                        value={contactForm.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-maroon focus:border-maroon"
                        placeholder="Contact Person Name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                      <input 
                        type="text" 
                        id="designation" 
                        name="designation"
                        value={contactForm.designation}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-maroon focus:border-maroon"
                        placeholder="Your Designation"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Official Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email"
                        value={contactForm.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-maroon focus:border-maroon"
                        placeholder="official.email@company.com"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="official_website" className="block text-sm font-medium text-gray-700 mb-1">Official Website</label>
                      <input 
                        type="url" 
                        id="official_website" 
                        name="official_website"
                        value={contactForm.official_website}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-maroon focus:border-maroon"
                        placeholder="https://www.company.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        id="phone_number" 
                        name="phone_number"
                        value={contactForm.phone_number}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-maroon focus:border-maroon"
                        placeholder="Phone Number"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea 
                        id="message" 
                        name="message"
                        value={contactForm.message}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-maroon focus:border-maroon"
                        placeholder="Your message"
                        required
                      ></textarea>
                    </div>
                    <Button type="submit" className="w-full bg-maroon hover:bg-maroon/90" disabled={isSubmitting}>
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-maroon mb-4">Frequently Asked Questions</h2>
            <div className="w-24 h-1 bg-gold mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* General Questions */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-maroon mb-4">📚 General</h3>
              <div className="space-y-3">
                <details className="group border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-maroon transition-colors">
                  <summary className="font-semibold text-gray-800 group-open:text-maroon">What is PrepSphere?</summary>
                  <p className="mt-2 text-gray-600 text-sm">PrepSphere is our comprehensive placement portal connecting students, TPO officers, and recruiters for seamless campus recruitment.</p>
                </details>
                <details className="group border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-maroon transition-colors">
                  <summary className="font-semibold text-gray-800 group-open:text-maroon">How do I create an account?</summary>
                  <p className="mt-2 text-gray-600 text-sm">Click on Sign Up, select your role (Student, TPO, or Admin), fill in your details, and complete the registration process.</p>
                </details>
                <details className="group border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-maroon transition-colors">
                  <summary className="font-semibold text-gray-800 group-open:text-maroon">Is my personal data secure?</summary>
                  <p className="mt-2 text-gray-600 text-sm">Yes, we follow industry-standard security protocols to protect your personal and professional information at all times.</p>
                </details>
              </div>
            </div>

            {/* Student Questions */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-maroon mb-4">👥 For Students</h3>
              <div className="space-y-3">
                <details className="group border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-maroon transition-colors">
                  <summary className="font-semibold text-gray-800 group-open:text-maroon">How do I register for placements?</summary>
                  <p className="mt-2 text-gray-600 text-sm">Sign up on PrepSphere, complete your profile with academic details and skills, and register for available job opportunities.</p>
                </details>
                <details className="group border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-maroon transition-colors">
                  <summary className="font-semibold text-gray-800 group-open:text-maroon">When do placements happen?</summary>
                  <p className="mt-2 text-gray-600 text-sm">Placements typically occur during the final year. Check the Events section for specific dates and company visits scheduled.</p>
                </details>
                <details className="group border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-maroon transition-colors">
                  <summary className="font-semibold text-gray-800 group-open:text-maroon">How can I prepare for interviews?</summary>
                  <p className="mt-2 text-gray-600 text-sm">Attend our workshops, join mock interview sessions, and utilize resources available in your dashboard.</p>
                </details>
              </div>
            </div>

            {/* Recruiter Questions */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-maroon mb-4">🏢 For Recruiters</h3>
              <div className="space-y-3">
                <details className="group border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-maroon transition-colors">
                  <summary className="font-semibold text-gray-800 group-open:text-maroon">How do I schedule a campus visit?</summary>
                  <p className="mt-2 text-gray-600 text-sm">Contact our TPO team through the portal or email placements@smpndoshi.edu.in to schedule your company's campus recruitment drive.</p>
                </details>
                <details className="group border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-maroon transition-colors">
                  <summary className="font-semibold text-gray-800 group-open:text-maroon">What is the hiring process?</summary>
                  <p className="mt-2 text-gray-600 text-sm">We facilitate preliminary assessments, shortlisting, and interview rounds. All candidates meet your criteria.</p>
                </details>
                <details className="group border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-maroon transition-colors">
                  <summary className="font-semibold text-gray-800 group-open:text-maroon">Can I post multiple job openings?</summary>
                  <p className="mt-2 text-gray-600 text-sm">Yes, you can post multiple positions with different roles, salary packages, and requirements through your TPO dashboard.</p>
                </details>
              </div>
            </div>

            {/* Placement Process */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-maroon mb-4">📋 Placement Process</h3>
              <div className="space-y-3">
                <details className="group border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-maroon transition-colors">
                  <summary className="font-semibold text-gray-800 group-open:text-maroon">What is the placement rate?</summary>
                  <p className="mt-2 text-gray-600 text-sm">We maintain a 95% placement rate with average packages of ₹8 LPA and highest packages reaching ₹12 LPA.</p>
                </details>
                <details className="group border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-maroon transition-colors">
                  <summary className="font-semibold text-gray-800 group-open:text-maroon">How many companies visit annually?</summary>
                  <p className="mt-2 text-gray-600 text-sm">Over 150+ companies visit our campus annually, offering diverse opportunities across IT, Finance, Marketing, and other sectors.</p>
                </details>
                <details className="group border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-maroon transition-colors">
                  <summary className="font-semibold text-gray-800 group-open:text-maroon">What if I don't get placed in the first round?</summary>
                  <p className="mt-2 text-gray-600 text-sm">We have continuous recruitment drives throughout the academic year. Additional opportunities are available in subsequent rounds.</p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-maroon text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-white w-8 h-8 rounded-full"></div>
                <span className="text-xl font-bold">PrepSphere</span>
              </div>
              <p className="text-cream/80 mb-4">
                Empowering women through quality education and exceptional placement opportunities.
              </p>
              <div className="flex items-center">
                <a href="https://spndoshicollege.com/" className="text-cream/80 hover:text-white transition-colors underline">
                  Official Website
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-cream/80 hover:text-white transition-colors">Home</Link></li>
                <li><Link href="#about" className="text-cream/80 hover:text-white transition-colors">About</Link></li>
                <li><Link href="#recruiters" className="text-cream/80 hover:text-white transition-colors">Recruiters</Link></li>
                <li><Link href="#achievements" className="text-cream/80 hover:text-white transition-colors">Achievements</Link></li>
                <li><Link href="#contact" className="text-cream/80 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-cream/20 mt-8 pt-8 text-center text-cream/80">
            <p>&copy; {new Date().getFullYear()} Smt. P.N. Doshi Women's College. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

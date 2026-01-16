"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import LogoutButton from '@/components/LogoutButton'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users, 
  FileCheck, 
  Briefcase, 
  Calendar, 
  Bell, 
  Plus,
  Edit,
  Eye,
  Activity,
  BarChart,
  PieChart,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  Building,
  Check,
  Search,
  X,
  MessageCircle
} from 'lucide-react'

const API_BASE_DEFAULT = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function TPODashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profiles')
  const [isCreatingJob, setIsCreatingJob] = useState(false)
  const [jobs, setJobs] = useState<Array<any>>([])
  const [jobForm, setJobForm] = useState({ title:'', company:'', location:'', salary:'', type:'Full-time', description:'', requirements:'', deadline:'', job_url:'' })
  const [tpoUserId, setTpoUserId] = useState<number | null>(null)
  const [pendingProfiles, setPendingProfiles] = useState<Array<any>>([])
  const [pendingResumes, setPendingResumes] = useState<Array<any>>([])
  const [verifiedResumes, setVerifiedResumes] = useState<Array<any>>([])
  const [resumeFilter, setResumeFilter] = useState<'pending'|'verified'>('pending')
  const [approvedStudents, setApprovedStudents] = useState<Array<any>>([])
  const [tpoProfile, setTpoProfile] = useState({ tpoName:'', phone:'' })
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationFilters, setNotificationFilters] = useState({ degree: '', year: '' })
  const [notificationHistory, setNotificationHistory] = useState<Array<any>>([])
  const [editingJobId, setEditingJobId] = useState<number | null>(null)
  const [editJobForm, setEditJobForm] = useState<{ title:string; company:string; location:string; status:string }>({ title:'', company:'', location:'', status:'Active' })
  const [originalJobForm, setOriginalJobForm] = useState<{ title:string; company:string; location:string; status:string } | null>(null)
  const [openApplicantsJobId, setOpenApplicantsJobId] = useState<number | null>(null)
  const [applicants, setApplicants] = useState<Array<any>>([])
  const [tpoEvents, setTpoEvents] = useState<Array<any>>([])
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [eventForm, setEventForm] = useState({ title:'', description:'', location:'', date:'', time:'', form_url:'', category:'' })
  const [editingEventId, setEditingEventId] = useState<number | null>(null)
  const [editEventForm, setEditEventForm] = useState({ title:'', description:'', location:'', date:'', time:'', status:'Upcoming' })
  const [originalEventForm, setOriginalEventForm] = useState<{ title:string; description:string; location:string; date:string; time:string; status:string } | null>(null)
  const [openEventId, setOpenEventId] = useState<number | null>(null)
  const [eventRegs, setEventRegs] = useState<Array<any>>([])
  const [eventFilter, setEventFilter] = useState<'Upcoming'|'Completed'|'Cancelled'|'All'>('Upcoming')
  const [placementFilter, setPlacementFilter] = useState<'All'|'Placed'|'Not Placed'>('All')
  const [editingPlacementId, setEditingPlacementId] = useState<number | null>(null)
  const [overrideForm, setOverrideForm] = useState({ placement_status: 'Placed', company_name: '', justification: '' })
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsData, setDetailsData] = useState<any>(null)
  const [detailsUserId, setDetailsUserId] = useState<number | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectUserId, setRejectUserId] = useState<number | null>(null)
  const [rejectFileId, setRejectFileId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)
  const [approveLoadingId, setApproveLoadingId] = useState<number | null>(null)
  
  // Messaging State
  const [isMessaging, setIsMessaging] = useState(false)
  const [messageRecipient, setMessageRecipient] = useState({ email: '', name: '' })
  const [messageBody, setMessageBody] = useState('')
  const [messageTitle, setMessageTitle] = useState('')

  // State to track visibility of hidden statistics fields (Total Jobs, Applications)
  const [showHiddenStats, setShowHiddenStats] = useState(false)
  const [stats, setStats] = useState({
    total_jobs: 0,
    total_applications: 0,
    total_selected: 0,
    total_students: 0,
    total_placed: 0,
    applications_by_job: []
  })

  const fetchTpoAndData = async () => {
    try {
      let email: string | null = null
      if (user) {
        // @ts-ignore
        email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || null
      }
      if (!email) {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null
        const current = stored ? JSON.parse(stored) : null
        email = current?.email || null
      }
      if (email) {
        const u = await fetch(`${API_BASE_DEFAULT}/api/v1/users/by-email/${encodeURIComponent(email)}`)
        if (u.ok) {
          const userData = await u.json()
          setTpoUserId(userData.id)
          // load tpo profile
          try {
            const prf = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/${userData.id}/profile`)
            if (prf.ok) {
              const pjson = await prf.json()
              setTpoProfile({ tpoName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(), phone: pjson.phone || userData.phone_number || '' })
            }
          } catch {}
        }
      }
      const p = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/pending-profiles`)
      if (p.ok) {
        const rows = await p.json()
        setPendingProfiles(rows.map((r:any)=>({
          id: r.user_id,
          name: `${r.first_name} ${r.last_name}`.trim(),
          email: r.email,
          degree: r.degree,
          year: r.year,
          status: 'Pending'
        })))
      }
      const pr = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/pending-resumes`)
      if (pr.ok) {
        const rows = await pr.json()
        setPendingResumes(rows.map((r:any)=>({
          id: r.id,
          name: `${r.first_name} ${r.last_name}`.trim(),
          email: r.email,
          fileName: r.file_name,
          uploaded: new Date(r.uploaded_at).toLocaleString(),
          status: r.status || (r.is_verified ? 'Verified' : 'Pending')
        })))
      }
      const vr = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/verified-resumes`)
      if (vr.ok) {
        const rows = await vr.json()
        setVerifiedResumes(rows.map((r:any)=>({
          id: r.id,
          name: `${r.first_name} ${r.last_name}`.trim(),
          email: r.email,
          fileName: r.file_name,
          uploaded: new Date(r.uploaded_at).toLocaleString(),
          status: r.status || 'Verified'
        })))
      }
      const aps = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/approved-students`)
      if (aps.ok) {
        const rows = await aps.json()
        setApprovedStudents(rows)
      }
      const tj = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/jobs`)
      if (tj.ok) {
        const jobsRows = await tj.json()
        setJobs(jobsRows)
      }
      const evs = await fetch(`${API_BASE_DEFAULT}/api/v1/events${eventFilter==='All'?'':`?status=${encodeURIComponent(eventFilter)}`}`)
      if (evs.ok) {
        const rows = await evs.json()
        setTpoEvents(rows)
      }
      const st = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/stats/summary`)
      if (st.ok) {
        const statsData = await st.json()
        setStats(statsData)
      }
      const notif = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/notifications/history`)
      if (notif.ok) {
        setNotificationHistory(await notif.json())
      }
    } catch {}
  }

  // Real-time sync for approved students and overview stats
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeTab === 'approved' || activeTab === 'overview') {
      fetchTpoAndData()
      interval = setInterval(fetchTpoAndData, 5000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [activeTab])

  useEffect(() => {
    let poll: any
    const refresh = async () => {
      // Optimize: Only fetch if the tab is visible
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        await fetchTpoAndData()
      } catch {}
    }
    if (activeTab === 'profiles' || activeTab === 'resumes') {
      refresh()
      // Increased polling interval to 10s to reduce load
      poll = setInterval(refresh, 10000)
    }
    return () => { if (poll) clearInterval(poll) }
  }, [activeTab])

  const jobPostings = [
    {
      id: 1,
      title: 'Software Engineer',
      company: 'TechCorp',
      location: 'Mumbai',
      applicants: 24,
      posted: '2024-01-05',
      status: 'Active'
    },
    {
      id: 2,
      title: 'Data Analyst',
      company: 'DataSystems',
      location: 'Pune',
      applicants: 18,
      posted: '2024-01-03',
      status: 'Active'
    }
  ]

  const createEvent = async () => {
    try {
      if (!eventForm.title.trim()) { alert('Title is required'); return }
      
      // Get creator ID
      let creator = tpoUserId
      if (!creator) {
        try {
          let email: string | null = null
          if (user) {
            // @ts-ignore
            email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || null
          }
          if (!email) {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null
            const current = stored ? JSON.parse(stored) : null
            email = current?.email || null
          }
          if (email) {
            const u = await fetch(`${API_BASE_DEFAULT}/api/v1/users/by-email/${encodeURIComponent(email)}`)
            if (u.ok) { const uj = await u.json(); creator = uj.id; setTpoUserId(uj.id) }
          }
        } catch {}
      }
      
      if (!creator) {
        alert('Unable to determine user ID. Please ensure you are logged in.');
        return;
      }
      
      const dateStr = (eventForm.date || '').slice(0,10)
      
      // Construct the proper payload with correct field names for the backend schema
      const payloadFull: any = { 
        title: eventForm.title.trim(), 
        description: eventForm.description || '', 
        location: eventForm.location || '', 
        event_time: (eventForm.time || '').trim(), 
        status: 'Upcoming', 
        created_by: creator
      }
      
      // Add date if valid
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        payloadFull.event_date = `${dateStr}T00:00:00`; // Convert to datetime format
      }
      
      // Add optional fields if they exist
      if (eventForm.form_url) payloadFull.form_url = eventForm.form_url;
      if (eventForm.category) payloadFull.category = eventForm.category;
      
      let res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/events`, { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(payloadFull) 
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Create event error:', errorText);
        alert(`Failed to create event: ${res.status} - ${errorText}`);
        return;
      }
      
      const row = await res.json()
      setTpoEvents(prev => [row, ...prev])
      try {
        const evs = await fetch(`${API_BASE_DEFAULT}/api/v1/events`)
        if (evs.ok) setTpoEvents(await evs.json())
      } catch {}
      setIsCreatingEvent(false)
      setEventForm({ title:'', description:'', location:'', date:'', time:'', form_url:'', category:'' })
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event')
    }
  }

  useEffect(() => {
    let timer: any
    const refreshEventRegs = async () => {
      try {
        if (openEventId) {
          const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/events/${openEventId}/registrations`)
          if (res.ok) setEventRegs(await res.json())
        }
      } catch {}
    }
    refreshEventRegs()
    if (openEventId) timer = setInterval(refreshEventRegs, 7000)
    return () => { if (timer) clearInterval(timer) }
  }, [openEventId])

  useEffect(() => {
    if (!openEventId) return
    setTpoEvents(prev => prev.map(e => e.id === openEventId ? { ...e, registered: eventRegs.length } : e))
  }, [eventRegs, openEventId])
  useEffect(() => {
    let timer: any
    const refreshApplicants = async () => {
      try {
        if (openApplicantsJobId) {
          const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/jobs/${openApplicantsJobId}/applications`)
          if (res.ok) setApplicants(await res.json())
        }
      } catch {}
    }
    refreshApplicants()
    if (openApplicantsJobId) {
      timer = setInterval(refreshApplicants, 10000)
    }
    return () => { if (timer) clearInterval(timer) }
  }, [openApplicantsJobId])

  useEffect(() => {
    if (!openApplicantsJobId) return
    setJobs(prev => prev.map(j => j.id === openApplicantsJobId ? { ...j, applicants: applicants.length } : j))
  }, [applicants, openApplicantsJobId])

  useEffect(() => {
    let poll: any
    const refreshJobs = async () => {
      try {
        if (activeTab === 'jobs') {
          const tj = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/jobs`)
          if (tj.ok) setJobs(await tj.json())
        }
      } catch {}
    }
    refreshJobs()
    if (activeTab === 'jobs') poll = setInterval(refreshJobs, 5000)
    return () => { if (poll) clearInterval(poll) }
  }, [activeTab])

  useEffect(() => {
    if (!isLoaded) return
    
    if (user) {
      // Security Check: Ensure user is TPO
      const role = (user.unsafeMetadata?.role as string) || ''
      if (role !== 'TPO') {
         // Redirect unauthorized users to student dashboard
         router.push('/dashboard')
         return
      }
      fetchTpoAndData()
    }
  }, [user, isLoaded, router])

  const handleApproveProfile = async (userId: number) => {
    try {
      if (!tpoUserId) {
        alert('TPO user ID not available. Please refresh the page.')
        return
      }
      setApproveLoadingId(userId)
      const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/profiles/${userId}/approve`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: 'Approved by TPO', sent_by: tpoUserId }) })
      if (res.ok) {
        fetchTpoAndData()
        alert('Profile approved successfully')
      } else {
        const error = await res.json().catch(() => ({}))
        alert(`Failed to approve profile: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      alert(`Failed to approve profile: ${error}`)
    }
    finally { setApproveLoadingId(null) }
  }

  const handleApproveResume = async (fileId: number) => {
    try {
      if (!tpoUserId) {
        alert('TPO user ID not available. Please refresh the page.')
        return
      }
      const res = await fetch(`${API_BASE_DEFAULT}/api/v1/files/${fileId}/verify`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_verified: true, verified_by: tpoUserId, verification_notes: 'Verified by TPO' }) })
      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        alert(`Failed to approve resume: ${error.error || 'Unknown error'}`)
      } else {
        fetchTpoAndData()
        alert('Resume approved successfully')
      }
    } catch (error) {
      alert(`Failed to approve resume: ${error}`)
    }
  }

  const postJob = async () => {
    try {
      const payload = { ...jobForm, created_by: tpoUserId }
      const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/jobs`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      if (res.ok) {
        const row = await res.json()
        setJobs(prev=>[row, ...prev])
        setIsCreatingJob(false)
        setJobForm({ title:'', company:'', location:'', salary:'', type:'Full-time', description:'', requirements:'', deadline:'', job_url:'' })
      }
    } catch {}
  }

  const handleSendMessage = async () => {
    try {
      if (!messageBody.trim()) { alert('Message is required'); return }
      const res = await fetch(`${API_BASE_DEFAULT}/api/v1/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_email: messageRecipient.email,
          title: messageTitle || 'Message from TPO',
          message: messageBody,
          sent_by: tpoUserId
        })
      })
      if (res.ok) {
        alert('Message sent successfully')
        setIsMessaging(false)
        setMessageBody('')
        setMessageTitle('')
      } else {
        const err = await res.json().catch(() => ({}))
        alert(`Failed to send message: ${err.error || 'Unknown error'}`)
      }
    } catch (e) {
      alert(`Failed to send message: ${e}`)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-maroon w-10 h-10 rounded-full"></div>
            <span className="text-2xl font-bold text-maroon">PrepSphere</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">TPO Dashboard</span>
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">TPO Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <Button 
                    variant={activeTab === 'overview' ? 'default' : 'ghost'} 
                    className={`w-full justify-start ${activeTab === 'overview' ? 'bg-maroon hover:bg-maroon/90' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    <Activity className="mr-2 h-4 w-4" />
                    Overview
                  </Button>
                  <Button 
                    variant={activeTab === 'tpoProfile' ? 'default' : 'ghost'}  
                    className={`w-full justify-start ${activeTab === 'tpoProfile' ? 'bg-maroon hover:bg-maroon/90' : ''}`}
                    onClick={() => setActiveTab('tpoProfile')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    My Profile
                  </Button>
                  <Button 
                    variant={activeTab === 'profiles' ? 'default' : 'ghost'} 
                    className={`w-full justify-start ${activeTab === 'profiles' ? 'bg-maroon hover:bg-maroon/90' : ''}`}
                    onClick={() => setActiveTab('profiles')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Approve Profiles
                  </Button>
                  <Button 
                    variant={activeTab === 'resumes' ? 'default' : 'ghost'} 
                    className={`w-full justify-start ${activeTab === 'resumes' ? 'bg-maroon hover:bg-maroon/90' : ''}`}
                    onClick={() => setActiveTab('resumes')}
                  >
                    <FileCheck className="mr-2 h-4 w-4" />
                    Review Resumes
                  </Button>
                  <Button 
                    variant={activeTab === 'approved' ? 'default' : 'ghost'} 
                    className={`w-full justify-start ${activeTab === 'approved' ? 'bg-maroon hover:bg-maroon/90' : ''}`}
                    onClick={() => setActiveTab('approved')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Approved Students
                  </Button>
                  <Button 
                    variant={activeTab === 'jobs' ? 'default' : 'ghost'} 
                    className={`w-full justify-start ${activeTab === 'jobs' ? 'bg-maroon hover:bg-maroon/90' : ''}`}
                    onClick={() => setActiveTab('jobs')}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Job Postings
                  </Button>
                  <Button 
                    variant={activeTab === 'events' ? 'default' : 'ghost'} 
                    className={`w-full justify-start ${activeTab === 'events' ? 'bg-maroon hover:bg-maroon/90' : ''}`}
                    onClick={() => setActiveTab('events')}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Events
                  </Button>
                  <Button 
                    variant={activeTab === 'notifications' ? 'default' : 'ghost'} 
                    className={`w-full justify-start ${activeTab === 'notifications' ? 'bg-maroon hover:bg-maroon/90' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

            {/* Content */}
            <div className="md:w-3/4">
              {activeTab === 'overview' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-maroon">Dashboard Overview</h2>
                  <Button variant="outline" onClick={async()=>{
                    try {
                      const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/stats/summary.pdf`)
                      if (res.ok) {
                        const blob = await res.blob()
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'tpo_summary.pdf'
                        document.body.appendChild(a)
                        a.click()
                        a.remove()
                        URL.revokeObjectURL(url)
                      }
                    } catch {}
                  }}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total_jobs}</div>
                      <p className="text-xs text-muted-foreground">Currently active postings</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total_applications}</div>
                      <p className="text-xs text-muted-foreground">Across all active jobs</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total_students}</div>
                      <p className="text-xs text-muted-foreground">Approved profiles</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Placed Students</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total_placed}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.total_students ? Math.round((stats.total_placed / stats.total_students) * 100) : 0}% placement rate
                      </p>
                    </CardContent>
                  </Card>
                  {/* Hidden per user request: Total Jobs Card. Controlled by showHiddenStats state. */}
                  <Card style={{ display: showHiddenStats ? undefined : 'none' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total_jobs}</div>
                      <p className="text-xs text-muted-foreground">Active listings</p>
                    </CardContent>
                  </Card>
                  {/* Hidden per user request: Applications Card. Controlled by showHiddenStats state. */}
                  <Card style={{ display: showHiddenStats ? undefined : 'none' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Applications</CardTitle>
                      <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total_applications}</div>
                      <p className="text-xs text-muted-foreground">{stats.total_selected} selected</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Applications by Job</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {stats.applications_by_job.slice(0, 5).map((job:any) => (
                          <div key={job.id} className="flex items-center">
                            <div className="ml-4 space-y-1 flex-1">
                              <p className="text-sm font-medium leading-none">{job.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {job.selected} selected / {job.applications} applicants
                              </p>
                            </div>
                            <div className="font-medium">
                              {job.applications > 0 ? Math.round((job.selected / job.applications) * 100) : 0}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Placements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {approvedStudents.filter((s:any) => s.placement_status === 'Placed').slice(0, 5).map((student:any) => (
                          <div key={student.user_id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="bg-green-100 p-2 rounded-full">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium leading-none">{student.first_name} {student.last_name}</p>
                                <p className="text-sm text-muted-foreground">{student.company_name || 'Placed'}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Placed</Badge>
                          </div>
                        ))}
                        {approvedStudents.filter((s:any) => s.placement_status === 'Placed').length === 0 && (
                          <p className="text-muted-foreground text-center py-4">No recent placements</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
            {activeTab === 'tpoProfile' && (
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                    <CardDescription>Update your contact information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tpoName">TPO Name</Label>
                        {isEditingProfile ? (
                          <Input id="tpoName" value={tpoProfile.tpoName} onChange={(e)=>setTpoProfile({...tpoProfile, tpoName: e.target.value})} />
                        ) : (
                          <p className="mt-1 text-gray-700">{tpoProfile.tpoName || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        {isEditingProfile ? (
                          <Input id="phone" value={tpoProfile.phone} onChange={(e)=>setTpoProfile({...tpoProfile, phone: e.target.value})} />
                        ) : (
                          <p className="mt-1 text-gray-700">{tpoProfile.phone || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" onClick={()=>setIsEditingProfile(true)}>Edit</Button>
                      <Button className="bg-maroon hover:bg-maroon/90" onClick={async()=>{
                        try {
                          if (!tpoUserId) return
                          await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/${tpoUserId}/profile`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ phone: tpoProfile.phone || null }) })
                          const parts = (tpoProfile.tpoName || '').split(' ')
                          const first = parts[0] || null
                          const last = parts.slice(1).join(' ') || null
                          await fetch(`${API_BASE_DEFAULT}/api/v1/users/${tpoUserId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ first_name: first, last_name: last, phone_number: tpoProfile.phone || null }) })
                          setIsEditingProfile(false)
                        } catch {}
                      }}>Save</Button>
                      <Button variant="outline" onClick={async()=>{
                        try {
                          const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/stats/summary.pdf`)
                          if (res.ok) {
                            const blob = await res.blob()
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'tpo_summary.pdf'
                            document.body.appendChild(a)
                            a.click()
                            a.remove()
                            URL.revokeObjectURL(url)
                          }
                        } catch {}
                      }}>Download Statistical Report</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            {activeTab === 'profiles' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-maroon">Pending Student Profiles</h2>
                  <div className="flex space-x-2">
                    <Input placeholder="Search profiles..." className="w-64" />
                    <Button className="bg-maroon hover:bg-maroon/90">
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {pendingProfiles.map((profile) => (
                    <Card key={profile.id} className="border-none shadow-md">
                      <CardContent className="p-6">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-xl font-semibold">{profile.name}</h3>
                            <p className="text-gray-600">{profile.email}</p>
                            <p className="text-gray-600 mt-1">{profile.degree} • {profile.year}</p>
                          </div>
                          <Badge variant="secondary" className="bg-gold text-maroon">
                            {profile.status}
                          </Badge>
                        </div>
                        
                        <div className="mt-6 flex space-x-3">
                          <Button className="bg-maroon hover:bg-maroon/90" onClick={()=>handleApproveProfile(profile.id)} disabled={approveLoadingId===profile.id}>
                            <Check className="mr-2 h-4 w-4" />
                            {approveLoadingId===profile.id ? 'Approving...' : 'Approve'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => {
                            setMessageRecipient({ email: profile.email, name: profile.name })
                            setIsMessaging(true)
                          }}>
                            <MessageCircle className="h-4 w-4 mr-2" /> Send Message
                          </Button>
                          <Button variant="outline" onClick={async()=>{
                            try {
                              setDetailsUserId(profile.id)
                              setDetailsOpen(true)
                              setDetailsLoading(true)
                              const ures = await fetch(`${API_BASE_DEFAULT}/api/v1/users/${profile.id}`)
                              const pres = await fetch(`${API_BASE_DEFAULT}/api/v1/users/${profile.id}/profile`)
                              let u:any=null, p:any=null
                              if (ures.ok) { u = await ures.json() }
                              if (pres.ok) { p = await pres.json() }
                              setDetailsData({ user: u, profile: p })
                            } catch {}
                            finally { setDetailsLoading(false) }
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                          <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={()=>{
                            setRejectUserId(profile.id)
                            setRejectReason('')
                            setRejectOpen(true)
                          }}>
                            <X className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'resumes' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-maroon">Pending Resume Reviews</h2>
                  <div className="flex space-x-2">
                    <Input placeholder="Search resumes..." className="w-64" />
                    <Button variant={resumeFilter==='pending'?'default':'outline'} onClick={()=>setResumeFilter('pending')}>Pending</Button>
                    <Button variant={resumeFilter==='verified'?'default':'outline'} onClick={()=>setResumeFilter('verified')}>Verified</Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {(resumeFilter==='pending'?pendingResumes:verifiedResumes).map((resume) => (
                    <Card key={resume.id} className="border-none shadow-md">
                      <CardContent className="p-6">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-xl font-semibold">{resume.name}</h3>
                            <p className="text-gray-600">{resume.email}</p>
                            <p className="text-gray-600 mt-1">File: {resume.fileName}</p>
                          </div>
                          <Badge variant="secondary" className={resume.status==='Verified'?"bg-green-100 text-green-800":"bg-gold text-maroon"}>
                            {resume.status}
                          </Badge>
                        </div>
                        
                        <div className="mt-4 flex items-center text-gray-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Uploaded {resume.uploaded}</span>
                        </div>
                        
                        <div className="mt-6 flex space-x-3">
                          {resume.status!=='Verified' && (
                            <Button className="bg-maroon hover:bg-maroon/90" onClick={()=>handleApproveResume(resume.id)}>
                              <Check className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                          )}
                          <Button variant="outline" onClick={async()=>{
                            try {
                              // Try presigned first
                              const pres = await fetch(`${API_BASE_DEFAULT}/api/v1/files/${resume.id}/presigned`)
                              if (pres.ok) {
                                const { url } = await pres.json()
                                const w = window.open(url, '_blank')
                                if (!w) { const a=document.createElement('a'); a.href=url; a.target='_blank'; document.body.appendChild(a); a.click(); a.remove() }
                                return
                              }
                              // Fallbacks
                              const metaRes = await fetch(`${API_BASE_DEFAULT}/api/v1/files/${resume.id}`)
                              if (metaRes.ok) {
                                const meta = await metaRes.json()
                                if (meta.file_url) {
                                  const w = window.open(meta.file_url, '_blank')
                                  if (!w) { const a=document.createElement('a'); a.href=meta.file_url; a.target='_blank'; document.body.appendChild(a); a.click(); a.remove() }
                                  return
                                }
                              }
                              const url = `${API_BASE_DEFAULT}/api/v1/files/${resume.id}/download`
                              const w = window.open(url, '_blank')
                              if (!w) { const a=document.createElement('a'); a.href=url; a.target='_blank'; document.body.appendChild(a); a.click(); a.remove() }
                            } catch { alert('Failed to open file') }
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Resume
                          </Button>
                          <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={()=>{
                            setRejectFileId(resume.id)
                            setRejectReason('')
                            setRejectOpen(true)
                          }}>
                            <X className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'approved' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-maroon">Approved Students</h2>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select 
                      className="border rounded p-1 text-sm"
                      value={placementFilter}
                      onChange={(e) => setPlacementFilter(e.target.value as any)}
                    >
                      <option value="All">All Status</option>
                      <option value="Placed">Placed</option>
                      <option value="Not Placed">Not Placed</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {approvedStudents
                    .filter((s:any) => placementFilter === 'All' || s.placement_status === placementFilter)
                    .map((s)=> (
                    <Card key={s.user_id} className={`border-none shadow-md ${s.placement_status === 'Placed' ? 'bg-green-50 ring-2 ring-green-100' : ''}`}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold">{s.first_name} {s.last_name}</h3>
                            <p className="text-gray-600">{s.email}</p>
                            <p className="text-gray-600 mt-1">{s.degree} • {s.year}</p>
                            
                            <div className="mt-4 flex flex-wrap gap-4 items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Placement Status:</span>
                                    <Badge variant={s.placement_status === 'Placed' ? 'default' : 'secondary'} className={s.placement_status === 'Placed' ? 'bg-green-600' : ''}>
                                        {s.placement_status}
                                    </Badge>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 w-6 p-0 ml-2" 
                                        onClick={() => {
                                            setEditingPlacementId(s.user_id);
                                            setOverrideForm({
                                                placement_status: s.placement_status,
                                                company_name: s.company_name || '',
                                                justification: ''
                                            });
                                        }}
                                    >
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                </div>
                                {s.placement_status === 'Placed' && (
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm font-medium">{s.company_name || 'Unknown Company'}</span>
                                    </div>
                                )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => {
                              setMessageRecipient({ email: s.email, name: `${s.first_name} ${s.last_name}` })
                              setIsMessaging(true)
                            }}>
                              <MessageCircle className="h-4 w-4 mr-2" /> Send Message
                            </Button>
                            <Badge variant="secondary" className={s.placement_status==='Placed'?"bg-green-100 text-green-800":"bg-gold text-maroon"}>
                                {s.placement_status}
                            </Badge>
                            
                            {s.resume_id && (
                                <Button variant="outline" size="sm" onClick={()=> window.open(`${API_BASE_DEFAULT}/api/v1/files/${s.resume_id}/download`, '_blank')}>
                                    <FileCheck className="h-4 w-4 mr-2" /> View Resume
                                </Button>
                            )}
                            
                            {s.offer_letter_url && (
                                <>
                                <Button variant="outline" size="sm" className="text-green-700 border-green-200 hover:bg-green-50" onClick={async()=> {
                                    if (s.offer_letter_id) {
                                        try {
                                            const pres = await fetch(`${API_BASE_DEFAULT}/api/v1/files/${s.offer_letter_id}/presigned`)
                                            if (pres.ok) {
                                                const { url } = await pres.json()
                                                const w = window.open(url, '_blank')
                                                if (!w) { const a=document.createElement('a'); a.href=url; a.target='_blank'; document.body.appendChild(a); a.click(); a.remove() }
                                                return
                                            }
                                            const url = `${API_BASE_DEFAULT}/api/v1/files/${s.offer_letter_id}/download`
                                            const w = window.open(url, '_blank')
                                            if (!w) { const a=document.createElement('a'); a.href=url; a.target='_blank'; document.body.appendChild(a); a.click(); a.remove() }
                                        } catch { window.open(s.offer_letter_url, '_blank') }
                                    } else {
                                        window.open(s.offer_letter_url, '_blank')
                                    }
                                }}>
                                    <CheckCircle className="h-4 w-4 mr-2" /> View Offer Letter
                                </Button>
                                <Button variant="outline" size="sm" onClick={async()=>{
                                    try {
                                      setDetailsUserId(s.user_id)
                                      setDetailsOpen(true)
                                      setDetailsLoading(true)
                                      const ures = await fetch(`${API_BASE_DEFAULT}/api/v1/users/${s.user_id}`)
                                      let u = null
                                      let p = null
                                      if (ures.ok) { u = await ures.json() }
                                      const pres = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/${s.user_id}/profile`)
                                      if (pres.ok) { p = await pres.json() }
                                      setDetailsData({ user: u, profile: p })
                                    } catch {}
                                    finally { setDetailsLoading(false) }
                                  }}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </Button>
                                </>
                            )}
                            {!s.offer_letter_url && (
                                <Button variant="outline" size="sm" onClick={async()=>{
                                    try {
                                      setDetailsUserId(s.user_id)
                                      setDetailsOpen(true)
                                      setDetailsLoading(true)
                                      const ures = await fetch(`${API_BASE_DEFAULT}/api/v1/users/${s.user_id}`)
                                      let u = null
                                      let p = null
                                      if (ures.ok) { u = await ures.json() }
                                      const pres = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/${s.user_id}/profile`)
                                      if (pres.ok) { p = await pres.json() }
                                      setDetailsData({ user: u, profile: p })
                                    } catch {}
                                    finally { setDetailsLoading(false) }
                                  }}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {approvedStudents.length === 0 && <p className="text-center text-gray-500">No approved students found.</p>}
                </div>
              </div>
            )}
            
            {activeTab === 'jobs' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-maroon">Job Postings</h2>
                  <Button 
                    className="bg-maroon hover:bg-maroon/90"
                    onClick={() => setIsCreatingJob(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Job
                  </Button>
                </div>
                
                {isCreatingJob ? (
                  <Card className="border-none shadow-md mb-6">
                    <CardHeader>
                      <CardTitle>Create New Job Posting</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input id="jobTitle" placeholder="e.g. Software Engineer" value={jobForm.title} onChange={(e)=>setJobForm({...jobForm, title:e.target.value})} />
                          </div>
                          
                          <div>
                            <Label htmlFor="company">Company</Label>
                            <Input id="company" placeholder="Company name" value={jobForm.company} onChange={(e)=>setJobForm({...jobForm, company:e.target.value})} />
                          </div>
                          
                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" placeholder="e.g. Mumbai, Remote" value={jobForm.location} onChange={(e)=>setJobForm({...jobForm, location:e.target.value})} />
                          </div>
                          
                          <div>
                            <Label htmlFor="salary">Salary Range</Label>
                            <Input id="salary" placeholder="e.g. ₹8-12 LPA" value={jobForm.salary} onChange={(e)=>setJobForm({...jobForm, salary:e.target.value})} />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="description">Job Description</Label>
                            <Textarea id="description" rows={4} placeholder="Detailed job description" value={jobForm.description} onChange={(e)=>setJobForm({...jobForm, description:e.target.value})} />
                          </div>
                          
                          <div>
                            <Label htmlFor="requirements">Requirements</Label>
                            <Textarea id="requirements" rows={3} placeholder="Required qualifications and skills" value={jobForm.requirements} onChange={(e)=>setJobForm({...jobForm, requirements:e.target.value})} />
                          </div>
                          
                          <div>
                            <Label htmlFor="deadline">Application Deadline</Label>
                            <Input id="deadline" type="date" value={jobForm.deadline} onChange={(e)=>setJobForm({...jobForm, deadline:e.target.value})} />
                          </div>
                          <div>
                            <Label htmlFor="jobUrl">Job URL</Label>
                            <Input id="jobUrl" placeholder="https://company.com/jobs/..." value={jobForm.job_url} onChange={(e)=>setJobForm({...jobForm, job_url:e.target.value})} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex space-x-3">
                        <Button className="bg-maroon hover:bg-maroon/90" onClick={postJob}>Post Job</Button>
                        <Button variant="outline" onClick={() => setIsCreatingJob(false)}>Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
                
                <div className="grid grid-cols-1 gap-6">
                  {jobs.map((job) => (
                    <Card key={job.id} className={`border-none shadow-md ${job.status === 'Closed' ? 'opacity-75 bg-gray-50' : ''}`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between">
                          <div>
                            {editingJobId === job.id ? (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor={`editJobTitle-${job.id}`}>Job Title</Label>
                                  <Input
                                    id={`editJobTitle-${job.id}`}
                                    className={`${originalJobForm && editJobForm.title !== originalJobForm.title ? 'ring-2 ring-maroon bg-cream' : ''} ${!editJobForm.title.trim() ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    value={editJobForm.title}
                                    onChange={(e)=>setEditJobForm({...editJobForm, title:e.target.value})}
                                  />
                                  {!editJobForm.title.trim() && <p className="mt-1 text-xs text-red-600">Required</p>}
                                </div>
                                <div>
                                  <Label htmlFor={`editJobCompany-${job.id}`}>Company</Label>
                                  <Input
                                    id={`editJobCompany-${job.id}`}
                                    className={`${originalJobForm && editJobForm.company !== originalJobForm.company ? 'ring-2 ring-maroon bg-cream' : ''} ${!editJobForm.company.trim() ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    value={editJobForm.company}
                                    onChange={(e)=>setEditJobForm({...editJobForm, company:e.target.value})}
                                  />
                                  {!editJobForm.company.trim() && <p className="mt-1 text-xs text-red-600">Required</p>}
                                </div>
                                <div>
                                  <Label htmlFor={`editJobLocation-${job.id}`}>Location</Label>
                                  <Input
                                    id={`editJobLocation-${job.id}`}
                                    className={`${originalJobForm && editJobForm.location !== originalJobForm.location ? 'ring-2 ring-maroon bg-cream' : ''} ${!editJobForm.location.trim() ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    value={editJobForm.location}
                                    onChange={(e)=>setEditJobForm({...editJobForm, location:e.target.value})}
                                  />
                                  {!editJobForm.location.trim() && <p className="mt-1 text-xs text-red-600">Required</p>}
                                </div>
                              </div>
                            ) : (
                              <>
                                <h3 className="text-xl font-semibold">{job.title}</h3>
                                <p className="text-gray-600">{job.company} • {job.location}</p>
                              </>
                            )}
                          </div>
                          <Badge variant="secondary" className="bg-gold text-maroon">
                            {editingJobId === job.id ? editJobForm.status : job.status}
                          </Badge>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-4">
                          <div className="flex items-center text-gray-600">
                            <Users className="mr-2 h-4 w-4" />
                            <span>{openApplicantsJobId === job.id ? applicants.length : (job.applicants ?? 0)} Applicants</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Posted {job.posted}</span>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex space-x-3">
                          <Button variant="outline" onClick={async()=>{
                            try {
                              if (openApplicantsJobId === job.id) { setOpenApplicantsJobId(null); setApplicants([]); return }
                              const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/jobs/${job.id}/applications`)
                              if (res.ok) {
                                const rows = await res.json()
                                setApplicants(rows)
                                setOpenApplicantsJobId(job.id)
                              }
                            } catch {}
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Applicants
                          </Button>
                          {openApplicantsJobId === job.id && (
                            <Button variant="outline" onClick={async()=>{
                              try {
                                const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/jobs/${job.id}/applications`)
                                if (res.ok) setApplicants(await res.json())
                              } catch {}
                            }}>Refresh</Button>
                          )}
                          {editingJobId === job.id ? (
                            <>
                              <Button variant="outline" disabled={!editJobForm.title.trim() || !editJobForm.company.trim() || !editJobForm.location.trim()} onClick={async()=>{
                                try {
                                  const payload:any = { title: editJobForm.title || null, company: editJobForm.company || null, location: editJobForm.location || null, status: editJobForm.status || null }
                                  const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/jobs/${job.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
                                  if (res.ok) {
                                    const updated = await res.json()
                                    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, ...updated } : j))
                                    setEditingJobId(null)
                                    setOriginalJobForm(null)
                                    alert('Job updated successfully')
                                  }
                                } catch {}
                              }}>
                                <Check className="mr-2 h-4 w-4" />
                                Save
                              </Button>
                              <Button variant="outline" onClick={()=>{ setEditingJobId(null); setOriginalJobForm(null) }}>
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button variant="outline" onClick={()=>{ setEditingJobId(job.id); setEditJobForm({ title: job.title || '', company: job.company || '', location: job.location || '', status: job.status || 'Active' }); setOriginalJobForm({ title: job.title || '', company: job.company || '', location: job.location || '', status: job.status || 'Active' }) }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                          )}
                          {(job.status === 'Closed' || job.status === 'Inactive') ? (
                            <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={async()=>{
                                try {
                                  const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/jobs/${job.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status: 'Active' }) })
                                  if (res.ok) {
                                    await res.json()
                                    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'Active' } : j))
                                  }
                                } catch {}
                            }}>
                                <Check className="mr-2 h-4 w-4" />
                                Reopen
                            </Button>
                          ) : (
                            <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white" onClick={async()=>{
                                try {
                                  const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/jobs/${job.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status: 'Closed' }) })
                                  if (res.ok) {
                                    await res.json()
                                    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'Closed' } : j))
                                  }
                                } catch {}
                            }}>
                                <X className="mr-2 h-4 w-4" />
                                Close
                            </Button>
                          )}
                        </div>
                        {openApplicantsJobId === job.id && (
                          <div className="mt-4 border-t pt-4">
                            {applicants.length === 0 ? (
                              <p className="text-sm text-gray-600">No applications yet</p>
                            ) : (
                              <div className="space-y-2">
                                {applicants.map((a)=> (
                                  <div key={a.id} className="flex justify-between text-sm">
                                    <span>{a.first_name} {a.last_name} • {a.email}</span>
                                    <span className="text-gray-600">{new Date(a.applied_at).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'events' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-maroon">Events Management</h2>
                  <Button className="bg-maroon hover:bg-maroon/90" onClick={()=> setIsCreatingEvent(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </Button>
                </div>
                <div className="flex gap-2 mb-4">
                  <Button variant={eventFilter==='Upcoming'?'default':'outline'} onClick={async()=>{ setEventFilter('Upcoming'); const evs = await fetch(`${API_BASE_DEFAULT}/api/v1/events?status=Upcoming`); if (evs.ok) setTpoEvents(await evs.json()) }}>Upcoming</Button>
                  <Button variant={eventFilter==='Completed'?'default':'outline'} onClick={async()=>{ setEventFilter('Completed'); const evs = await fetch(`${API_BASE_DEFAULT}/api/v1/events?status=Completed`); if (evs.ok) setTpoEvents(await evs.json()) }}>Completed</Button>
                  <Button variant={eventFilter==='Cancelled'?'default':'outline'} onClick={async()=>{ setEventFilter('Cancelled'); const evs = await fetch(`${API_BASE_DEFAULT}/api/v1/events?status=Cancelled`); if (evs.ok) setTpoEvents(await evs.json()) }}>Cancelled</Button>
                  <Button variant={eventFilter==='All'?'default':'outline'} onClick={async()=>{ setEventFilter('All'); const evs = await fetch(`${API_BASE_DEFAULT}/api/v1/events`); if (evs.ok) setTpoEvents(await evs.json()) }}>All</Button>
                </div>
                {isCreatingEvent && (
                  <Card className="border-none shadow-md mb-6">
                    <CardHeader>
                      <CardTitle>Create New Event</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="evTitle">Title</Label>
                            <Input id="evTitle" value={eventForm.title} onChange={(e)=>setEventForm({...eventForm, title:e.target.value})} />
                          </div>
                          <div>
                            <Label htmlFor="evLocation">Location</Label>
                            <Input id="evLocation" value={eventForm.location} onChange={(e)=>setEventForm({...eventForm, location:e.target.value})} />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="evDate">Date</Label>
                            <Input id="evDate" type="date" value={eventForm.date} onChange={(e)=>setEventForm({...eventForm, date:e.target.value})} />
                          </div>
                          <div>
                            <Label htmlFor="evTime">Time</Label>
                            <Input id="evTime" placeholder="e.g. 10:00 AM" value={eventForm.time} onChange={(e)=>setEventForm({...eventForm, time:e.target.value})} />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="evDesc">Description</Label>
                          <Textarea id="evDesc" rows={3} value={eventForm.description} onChange={(e)=>setEventForm({...eventForm, description:e.target.value})} />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="evFormUrl">Google Form URL</Label>
                          <Input id="evFormUrl" placeholder="https://forms.gle/..." value={eventForm.form_url} onChange={(e)=>setEventForm({...eventForm, form_url:e.target.value})} />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="evCategory">Category</Label>
                          <Input id="evCategory" placeholder="e.g. Workshop, Talk" value={eventForm.category} onChange={(e)=>setEventForm({...eventForm, category:e.target.value})} />
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <Button className="bg-maroon hover:bg-maroon/90" disabled={!eventForm.title.trim()} onClick={createEvent}>Submit</Button>
                        <Button variant="outline" onClick={()=> setIsCreatingEvent(false)}>Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tpoEvents.map((event) => (
                    <Card key={event.id} className="border-none shadow-md">
                      <CardContent className="p-6">
                        <div className="flex justify-between">
                          <div>
                            {editingEventId === event.id ? (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor={`editEventTitle-${event.id}`}>Title</Label>
                                  <Input
                                    id={`editEventTitle-${event.id}`}
                                    className={`${originalEventForm && editEventForm.title !== originalEventForm.title ? 'ring-2 ring-maroon bg-cream' : ''} ${!editEventForm.title.trim() ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    value={editEventForm.title}
                                    onChange={(e)=>setEditEventForm({...editEventForm, title:e.target.value})}
                                  />
                                  {!editEventForm.title.trim() && <p className="mt-1 text-xs text-red-600">Required</p>}
                                </div>
                                <div>
                                  <Label htmlFor={`editEventLocation-${event.id}`}>Location</Label>
                                  <Input
                                    id={`editEventLocation-${event.id}`}
                                    className={`${originalEventForm && editEventForm.location !== originalEventForm.location ? 'ring-2 ring-maroon bg-cream' : ''} ${!editEventForm.location.trim() ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    value={editEventForm.location}
                                    onChange={(e)=>setEditEventForm({...editEventForm, location:e.target.value})}
                                  />
                                  {!editEventForm.location.trim() && <p className="mt-1 text-xs text-red-600">Required</p>}
                                </div>
                                <div>
                                  <Label htmlFor={`editEventDate-${event.id}`}>Date</Label>
                                  <Input
                                    id={`editEventDate-${event.id}`}
                                    type="date"
                                    className={`${originalEventForm && editEventForm.date !== originalEventForm.date ? 'ring-2 ring-maroon bg-cream' : ''} ${!editEventForm.date.trim() ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    value={editEventForm.date}
                                    onChange={(e)=>setEditEventForm({...editEventForm, date:e.target.value})}
                                  />
                                  {!editEventForm.date.trim() && <p className="mt-1 text-xs text-red-600">Required</p>}
                                </div>
                                <div>
                                  <Label htmlFor={`editEventTime-${event.id}`}>Time</Label>
                                  <Input
                                    id={`editEventTime-${event.id}`}
                                    className={`${originalEventForm && editEventForm.time !== originalEventForm.time ? 'ring-2 ring-maroon bg-cream' : ''} ${!editEventForm.time.trim() ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    value={editEventForm.time}
                                    onChange={(e)=>setEditEventForm({...editEventForm, time:e.target.value})}
                                  />
                                  {!editEventForm.time.trim() && <p className="mt-1 text-xs text-red-600">Required</p>}
                                </div>
                                <div>
                                  <Label htmlFor={`editEventDesc-${event.id}`}>Description</Label>
                                  <Textarea
                                    id={`editEventDesc-${event.id}`}
                                    rows={3}
                                    className={`${originalEventForm && editEventForm.description !== originalEventForm.description ? 'ring-2 ring-maroon bg-cream' : ''}`}
                                    value={editEventForm.description}
                                    onChange={(e)=>setEditEventForm({...editEventForm, description:e.target.value})}
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <h3 className="text-xl font-semibold">{event.title}</h3>
                                <p className="text-gray-600 mt-2">{event.location}</p>
                              </>
                            )}
                          </div>
                          <Badge variant="secondary" className={
                            (event.status||'Upcoming')==='Cancelled' ? 'bg-red-100 text-red-700' :
                            (event.status||'Upcoming')==='Completed' ? 'bg-green-100 text-green-800' :
                            'bg-gold text-maroon'
                          }>
                            {event.status || 'Upcoming'}
                          </Badge>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-4">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>{event.date} at {event.time}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Users className="mr-2 h-4 w-4" />
                            <span>{openEventId === event.id ? eventRegs.length : ''} {openEventId === event.id ? 'Registered' : ''}</span>
                          </div>
                          {event.form_url && (
                            <div className="flex items-center text-gray-600">
                              <a className="underline text-maroon" href={event.form_url} target="_blank" rel="noreferrer">Form Link</a>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-6 flex space-x-3">
                          <Button className="bg-maroon hover:bg-maroon/90" onClick={async()=>{
                            try {
                              if (openEventId === event.id) { setOpenEventId(null); setEventRegs([]); return }
                              const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/events/${event.id}/registrations`)
                              if (res.ok) {
                                const rows = await res.json()
                                setEventRegs(rows)
                                setOpenEventId(event.id)
                              }
                            } catch {}
                          }}>View Details</Button>
                          {editingEventId === event.id ? (
                            <>
                              <Button variant="outline" disabled={!editEventForm.title.trim() || !editEventForm.location.trim() || !editEventForm.date.trim() || !editEventForm.time.trim()} onClick={async()=>{
                                try {
                                  const payload:any = { title: editEventForm.title || null, location: editEventForm.location || null, date: editEventForm.date || null, time: editEventForm.time || null, description: editEventForm.description || null, status: editEventForm.status || null }
                                  const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/events/${event.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
                                  if (res.ok) {
                                    const updated = await res.json()
                                    setTpoEvents(prev => prev.map(e => e.id === event.id ? { ...e, ...updated } : e))
                                    setEditingEventId(null)
                                    setOriginalEventForm(null)
                                    alert('Event updated successfully')
                                  }
                                } catch {}
                              }}>
                                <Check className="mr-2 h-4 w-4" />
                                Save
                              </Button>
                              <Button variant="outline" onClick={()=> { setEditingEventId(null); setOriginalEventForm(null) }}>
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button variant="outline" onClick={()=>{ setEditingEventId(event.id); setEditEventForm({ title: event.title || '', description: event.description || '', location: event.location || '', date: event.date || '', time: event.time || '', status: event.status || 'Upcoming' }); setOriginalEventForm({ title: event.title || '', description: event.description || '', location: event.location || '', date: event.date || '', time: event.time || '', status: event.status || 'Upcoming' }) }}>Edit</Button>
                          )}
                          <Button variant="outline" onClick={async()=>{
                            try {
                              const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/events/${event.id}/reminders`, { method:'POST' })
                              if (res.ok) alert('Reminders sent')
                            } catch { alert('Failed to send reminders') }
                          }}>Send Reminder</Button>
                          <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white" onClick={async()=>{
                            try {
                              const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/events/${event.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status: 'Cancelled' }) })
                              if (res.ok) {
                                setTpoEvents(prev => prev.filter(e => e.id !== event.id))
                              }
                            } catch {}
                          }}>Cancel</Button>
                          <Button variant="outline" onClick={async()=>{
                            try {
                              const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/events/${event.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status: 'Completed' }) })
                              if (res.ok) {
                                const updated = await res.json()
                                setTpoEvents(prev => prev.map(e => e.id === event.id ? { ...e, ...updated } : e))
                              }
                            } catch {}
                          }}>Mark Completed</Button>
                        </div>
                        {openEventId === event.id && (
                          <div className="mt-4 border-t pt-4">
                            {eventRegs.length === 0 ? (
                              <p className="text-sm text-gray-600">No registrations yet</p>
                            ) : (
                              <div className="space-y-2">
                                {eventRegs.map((r)=> (
                                  <div key={r.id} className="flex justify-between text-sm">
                                    <span>{r.first_name} {r.last_name} • {r.email}</span>
                                    <span className="text-gray-600">{new Date(r.registered_at).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-maroon">Send Notifications</h2>
                  <div className="flex space-x-2">
                    <Input placeholder="Search recipients..." className="w-64" />
                    <Button className="bg-maroon hover:bg-maroon/90">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </div>
                
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle>Create New Notification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="notificationTitle">Title</Label>
                        <Input id="notificationTitle" placeholder="Notification title" value={notificationTitle} onChange={(e)=>setNotificationTitle(e.target.value)} />
                      </div>
                      
                      <div>
                        <Label htmlFor="notificationMessage">Message</Label>
                        <Textarea id="notificationMessage" rows={4} placeholder="Notification message" value={notificationMessage} onChange={(e)=>setNotificationMessage(e.target.value)} />
                      </div>
                      
                      <div>
                        <Label>Recipients Filters (Optional)</Label>
                        <div className="mt-2 grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-gray-500">Degree</Label>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              value={notificationFilters.degree}
                              onChange={(e)=>setNotificationFilters(prev=>({...prev, degree: e.target.value}))}
                            >
                              <option value="">All Degrees</option>
                              <option value="B.Tech">B.Tech</option>
                              <option value="M.Tech">M.Tech</option>
                              <option value="MCA">MCA</option>
                              <option value="MBA">MBA</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Year</Label>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              value={notificationFilters.year}
                              onChange={(e)=>setNotificationFilters(prev=>({...prev, year: e.target.value}))}
                            >
                              <option value="">All Years</option>
                              <option value="1st Year">1st Year</option>
                              <option value="2nd Year">2nd Year</option>
                              <option value="3rd Year">3rd Year</option>
                              <option value="Final Year">Final Year</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button className="bg-maroon hover:bg-maroon/90" onClick={async()=>{
                          try {
                            if (!notificationTitle.trim() || !notificationMessage.trim()) { alert('Please provide title and message'); return }
                            const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/notifications/broadcast`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                title: notificationTitle.trim(), 
                                message: notificationMessage.trim(),
                                filters: notificationFilters
                              })
                            })
                            if (res.ok) {
                              const data = await res.json()
                              alert(`Notification sent to ${data.count} students`)
                              setNotificationTitle('')
                              setNotificationMessage('')
                              // Refresh history
                              fetch(`${API_BASE_DEFAULT}/api/v1/tpo/notifications/history`)
                                .then(res => res.ok ? res.json() : [])
                                .then(data => setNotificationHistory(data))
                                .catch(() => {})
                            } else {
                              alert('Failed to send notification')
                            }
                          } catch { alert('Failed to send notification') }
                        }}>Send Notification</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-8">
                  <h3 className="text-xl font-bold text-maroon mb-4">Recent Notifications</h3>
                  <Card>
                    <CardContent className="p-0">
                      {notificationHistory.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No notifications sent yet</div>
                      ) : (
                        <div className="divide-y">
                          {notificationHistory.map((notif, idx) => (
                            <div key={idx} className="p-4 hover:bg-gray-50">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold">{notif.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs text-gray-500 block">{new Date(notif.sent_at).toLocaleString()}</span>
                                  <Badge variant="outline" className="mt-1">{notif.recipient_count} Recipients</Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {detailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Student Profile Details</CardTitle>
              <CardDescription>{detailsUserId ? `User ID: ${detailsUserId}` : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              {detailsLoading ? (
                <p className="text-center text-gray-600">Loading...</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-gray-800 font-medium">{[detailsData?.user?.first_name, detailsData?.user?.last_name].filter(Boolean).join(' ') || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-800 font-medium">{detailsData?.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-800 font-medium">{detailsData?.profile?.phone || detailsData?.user?.phone_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Degree</p>
                      <p className="text-gray-800 font-medium">{detailsData?.profile?.degree || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Year</p>
                      <p className="text-gray-800 font-medium">{detailsData?.profile?.year || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Alternate Email</p>
                      <p className="text-gray-800 font-medium">{detailsData?.profile?.alternate_email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Skills</p>
                    <p className="text-gray-800">{detailsData?.profile?.skills || 'N/A'}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">About</p>
                    <p className="text-gray-800">{detailsData?.profile?.about || 'N/A'}</p>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Approval Status:</span>
                      <Badge variant={detailsData?.profile?.is_approved ? 'default' : 'secondary'} className={detailsData?.profile?.is_approved ? 'bg-green-600' : 'bg-gold text-maroon'}>
                        {detailsData?.profile?.is_approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Placement Status:</span>
                      <Badge variant="secondary">{detailsData?.profile?.placement_status || 'Not Placed'}</Badge>
                    </div>
                  </div>
                  {detailsData?.profile?.company_name && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="text-gray-800 font-medium">{detailsData?.profile?.company_name}</p>
                    </div>
                  )}
                  {detailsData?.profile?.offer_letter_url && (
                    <div className="mt-2">
                      <Button variant="outline" size="sm" onClick={()=> window.open(detailsData?.profile?.offer_letter_url, '_blank')}>
                        <CheckCircle className="h-4 w-4 mr-2" /> View Offer Letter
                      </Button>
                    </div>
                  )}
                  <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={()=>{ setDetailsOpen(false); setDetailsData(null); setDetailsUserId(null) }}>Close</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Reject Profile</CardTitle>
              <CardDescription>Provide a reason to notify the student</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label htmlFor="rejectReason">Reason</Label>
                <Textarea id="rejectReason" rows={4} value={rejectReason} onChange={(e)=>setRejectReason(e.target.value)} placeholder="e.g. Missing academic details, incorrect document, etc." />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={()=>{ setRejectOpen(false); setRejectUserId(null); setRejectFileId(null); setRejectReason('') }}>Cancel</Button>
                  <Button className="bg-maroon hover:bg-maroon/90" disabled={rejectLoading || !rejectReason.trim()} onClick={async()=>{
                    try {
                      if (!rejectUserId && !rejectFileId) return
                      if (!rejectFileId && !tpoUserId) {
                        alert('TPO user ID not available. Please refresh the page.')
                        return
                      }
                      setRejectLoading(true)
                      
                      let res;
                      if (rejectFileId) {
                        // Reject file/resume
                        res = await fetch(`${API_BASE_DEFAULT}/api/v1/files/${rejectFileId}/reject`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reason: rejectReason.trim() }) })
                      } else {
                        // Reject profile
                        res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/profiles/${rejectUserId}/reject`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reason: rejectReason.trim(), sent_by: tpoUserId }) })
                      }
                      
                      if (res.ok) {
                        setRejectOpen(false)
                        setRejectUserId(null)
                        setRejectFileId(null)
                        setRejectReason('')
                        fetchTpoAndData()
                        alert(rejectFileId ? 'Resume rejected' : 'Profile rejected')
                      } else {
                        try {
                          const err = await res.json()
                          alert(err.error || (rejectFileId ? 'Failed to reject resume' : 'Failed to reject profile'))
                        } catch { alert(rejectFileId ? 'Failed to reject resume' : 'Failed to reject profile') }
                      }
                    } catch { alert(rejectFileId ? 'Failed to reject resume' : 'Failed to reject profile') }
                    finally { setRejectLoading(false) }
                  }}>{rejectLoading ? 'Rejecting...' : 'Confirm Reject'}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Message Modal */}
      {isMessaging && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Send Message to {messageRecipient.name}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsMessaging(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Recipient Email</Label>
                <Input value={messageRecipient.email} disabled />
              </div>
              <div>
                <Label>Subject</Label>
                <Input 
                  placeholder="Message Subject" 
                  value={messageTitle} 
                  onChange={(e) => setMessageTitle(e.target.value)} 
                />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea 
                  placeholder="Type your message here..." 
                  className="min-h-[150px]" 
                  value={messageBody} 
                  onChange={(e) => setMessageBody(e.target.value)} 
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsMessaging(false)}>Cancel</Button>
                <Button className="bg-maroon hover:bg-maroon/90" onClick={handleSendMessage}>Send Message</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {editingPlacementId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md bg-white">
                  <CardHeader>
                      <CardTitle>Override Placement Status</CardTitle>
                      <CardDescription>Admin override for student placement</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div>
                          <Label>Status</Label>
                          <select 
                              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={overrideForm.placement_status}
                              onChange={(e) => setOverrideForm({...overrideForm, placement_status: e.target.value})}
                          >
                              <option value="Not Placed">Not Placed</option>
                              <option value="Placed">Placed</option>
                          </select>
                      </div>
                      {overrideForm.placement_status === 'Placed' && (
                          <div>
                              <Label>Company Name</Label>
                              <Input 
                                  value={overrideForm.company_name}
                                  onChange={(e) => setOverrideForm({...overrideForm, company_name: e.target.value})}
                                  placeholder="Enter company name"
                              />
                          </div>
                      )}
                      <div>
                          <Label>Justification (Required)</Label>
                          <Textarea 
                              value={overrideForm.justification}
                              onChange={(e) => setOverrideForm({...overrideForm, justification: e.target.value})}
                              placeholder="Reason for manual override..."
                          />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                          <Button variant="outline" onClick={() => setEditingPlacementId(null)}>Cancel</Button>
                          <Button onClick={async () => {
                              if (!overrideForm.justification) {
                                  alert('Justification is required');
                                  return;
                              }
                              try {
                                  const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/placement/override/${editingPlacementId}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                          ...overrideForm,
                                          tpo_id: tpoUserId
                                      })
                                  });
                                  if (res.ok) {
                                      setEditingPlacementId(null);
                                      alert('Updated successfully');
                                      fetchTpoAndData();
                                  } else {
                                      const err = await res.json();
                                      alert(err.error || 'Failed to update');
                                  }
                              } catch (e) {
                                  alert('Failed to update');
                              }
                          }}>Save Changes</Button>
                      </div>
                  </CardContent>
              </Card>
          </div>
      )}
    </div>
  )
}

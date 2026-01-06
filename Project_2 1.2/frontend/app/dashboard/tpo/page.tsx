"use client"

import { useState, useEffect } from 'react'
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
  Check,
  X,
  Search,
  Filter
} from 'lucide-react'

const API_BASE_DEFAULT = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function TPODashboard() {
  const { user } = useUser()
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
  const [tpoProfile, setTpoProfile] = useState({ alternateEmail:'', phone:'' })
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')
  const [editingJobId, setEditingJobId] = useState<number | null>(null)
  const [editJobForm, setEditJobForm] = useState<{ title:string; company:string; location:string; status:string }>({ title:'', company:'', location:'', status:'Active' })
  const [openApplicantsJobId, setOpenApplicantsJobId] = useState<number | null>(null)
  const [applicants, setApplicants] = useState<Array<any>>([])
  const [tpoEvents, setTpoEvents] = useState<Array<any>>([])
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [eventForm, setEventForm] = useState({ title:'', description:'', location:'', date:'', time:'', form_url:'', category:'' })
  const [editingEventId, setEditingEventId] = useState<number | null>(null)
  const [editEventForm, setEditEventForm] = useState({ title:'', description:'', location:'', date:'', time:'', status:'Upcoming' })
  const [openEventId, setOpenEventId] = useState<number | null>(null)
  const [eventRegs, setEventRegs] = useState<Array<any>>([])
  const [eventFilter, setEventFilter] = useState<'Upcoming'|'Completed'|'Cancelled'|'All'>('Upcoming')

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
              setTpoProfile({ alternateEmail: pjson.alternate_email || '', phone: pjson.phone || '' })
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
          status: r.is_verified ? 'Verified' : 'Pending'
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
          status: 'Verified'
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
    } catch {}
  }

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
      const dateStr = (eventForm.date || '').slice(0,10)
      const payloadFull: any = { title: eventForm.title.trim(), description: eventForm.description || '', location: eventForm.location || '', time: (eventForm.time || '').trim(), status: 'Upcoming', form_url: eventForm.form_url || '', category: eventForm.category || '' }
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) payloadFull.date = dateStr
      let res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/events`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payloadFull) })
      if (!res.ok) {
        try {
          const errText = await res.text()
          console.error('Create event error:', errText)
        } catch {}
        const payloadMinimal = { title: eventForm.title.trim() }
        res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/events`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payloadMinimal) })
        if (!res.ok) {
          try { const errText2 = await res.text(); console.error('Create event minimal error:', errText2) } catch {}
          alert('Failed to create event')
          return
        }
      }
      const row = await res.json()
      setTpoEvents(prev => [row, ...prev])
      try {
        const evs = await fetch(`${API_BASE_DEFAULT}/api/v1/events`)
        if (evs.ok) setTpoEvents(await evs.json())
      } catch {}
      setIsCreatingEvent(false)
      setEventForm({ title:'', description:'', location:'', date:'', time:'', form_url:'', category:'' })
    } catch { alert('Failed to create event') }
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
    if (activeTab === 'jobs') poll = setInterval(refreshJobs, 10000)
    return () => { if (poll) clearInterval(poll) }
  }, [activeTab])

  useEffect(() => {
    const applyRole = async () => {
      try {
        const role = 'TPO'
        if (user && (user.unsafeMetadata?.role !== role)) {
          await user.update({ unsafeMetadata: { role } })
        }
      } catch {}
    }
    applyRole()
    fetchTpoAndData()
  }, [user])

  const handleApproveProfile = async (userId: number) => {
    try {
      const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/profiles/${userId}/approve`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: 'Approved by TPO' }) })
      fetchTpoAndData()
    } catch {}
  }

  const handleApproveResume = async (fileId: number) => {
    try {
      await fetch(`${API_BASE_DEFAULT}/api/v1/files/${fileId}/verify`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_verified: true, verified_by: tpoUserId, verification_notes: 'Verified by TPO' }) })
      fetchTpoAndData()
    } catch {}
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
              {activeTab === 'tpoProfile' && (
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                    <CardDescription>Update your contact information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="altEmail">Alternate Email</Label>
                        {isEditingProfile ? (
                          <Input id="altEmail" value={tpoProfile.alternateEmail} onChange={(e)=>setTpoProfile({...tpoProfile, alternateEmail: e.target.value})} />
                        ) : (
                          <p className="mt-1 text-gray-700">{tpoProfile.alternateEmail || 'Not provided'}</p>
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
                          await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/${tpoUserId}/profile`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ alternate_email: tpoProfile.alternateEmail || null, phone: tpoProfile.phone || null }) })
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
                          <Button className="bg-maroon hover:bg-maroon/90" onClick={()=>handleApproveProfile(profile.id)}>
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                          <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={async()=>{
                            const reason = prompt('Enter rejection reason')
                            if (!reason) return
                            try {
                              const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/profiles/${profile.id}/reject`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reason }) })
                              if (res.ok) fetchTpoAndData()
                            } catch {}
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
                          <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={async()=>{
                            const reason = prompt('Enter rejection reason')
                            if (!reason) return
                            try {
                              const res = await fetch(`${API_BASE_DEFAULT}/api/v1/files/${resume.id}/reject`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reason }) })
                              if (res.ok) fetchTpoAndData()
                            } catch {}
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
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {approvedStudents.map((s)=> (
                    <Card key={s.user_id} className="border-none shadow-md">
                      <CardContent className="p-6">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-xl font-semibold">{s.first_name} {s.last_name}</h3>
                            <p className="text-gray-600">{s.email}</p>
                            <p className="text-gray-600 mt-1">{s.degree} • {s.year}</p>
                          </div>
                          <Badge variant="secondary" className={s.placement_status==='Placed'?"bg-green-100 text-green-800":"bg-gold text-maroon"}>
                            {s.placement_status}
                          </Badge>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-gray-600">Latest Resume: {s.resume_name || '—'}</div>
                          {s.resume_id && (
                            <Button variant="outline" onClick={()=> window.open(`${API_BASE_DEFAULT}/api/v1/files/${s.resume_id}/download`, '_blank')}>View Resume</Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                  {jobs.filter((j)=> (j.status || 'Active') !== 'Closed').map((job) => (
                    <Card key={job.id} className="border-none shadow-md">
                      <CardContent className="p-6">
                        <div className="flex justify-between">
                          <div>
                            {editingJobId === job.id ? (
                              <div className="space-y-2">
                                <Input placeholder="Job Title" value={editJobForm.title} onChange={(e)=>setEditJobForm({...editJobForm, title:e.target.value})} />
                                <Input placeholder="Company" value={editJobForm.company} onChange={(e)=>setEditJobForm({...editJobForm, company:e.target.value})} />
                                <Input placeholder="Location" value={editJobForm.location} onChange={(e)=>setEditJobForm({...editJobForm, location:e.target.value})} />
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
                              <Button variant="outline" onClick={async()=>{
                                try {
                                  const payload:any = { title: editJobForm.title || null, company: editJobForm.company || null, location: editJobForm.location || null, status: editJobForm.status || null }
                                  const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/jobs/${job.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
                                  if (res.ok) {
                                    const updated = await res.json()
                                    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, ...updated } : j))
                                    setEditingJobId(null)
                                  }
                                } catch {}
                              }}>
                                <Check className="mr-2 h-4 w-4" />
                                Save
                              </Button>
                              <Button variant="outline" onClick={()=>{ setEditingJobId(null) }}>
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button variant="outline" onClick={()=>{ setEditingJobId(job.id); setEditJobForm({ title: job.title || '', company: job.company || '', location: job.location || '', status: job.status || 'Active' }) }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                          )}
                          <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white" onClick={async()=>{
                            try {
                              const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/jobs/${job.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status: 'Closed' }) })
                              if (res.ok) {
                                await res.json()
                                setJobs(prev => prev.filter(j => j.id !== job.id))
                              }
                            } catch {}
                          }}>
                            <X className="mr-2 h-4 w-4" />
                            Close
                          </Button>
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
                              <div className="space-y-2">
                                <Input placeholder="Title" value={editEventForm.title} onChange={(e)=>setEditEventForm({...editEventForm, title:e.target.value})} />
                                <Input placeholder="Location" value={editEventForm.location} onChange={(e)=>setEditEventForm({...editEventForm, location:e.target.value})} />
                                <Input placeholder="Date" type="date" value={editEventForm.date} onChange={(e)=>setEditEventForm({...editEventForm, date:e.target.value})} />
                                <Input placeholder="Time" value={editEventForm.time} onChange={(e)=>setEditEventForm({...editEventForm, time:e.target.value})} />
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
                              <Button variant="outline" onClick={async()=>{
                                try {
                                  const payload:any = { title: editEventForm.title || null, location: editEventForm.location || null, date: editEventForm.date || null, time: editEventForm.time || null, status: editEventForm.status || null }
                                  const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/events/${event.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
                                  if (res.ok) {
                                    const updated = await res.json()
                                    setTpoEvents(prev => prev.map(e => e.id === event.id ? { ...e, ...updated } : e))
                                    setEditingEventId(null)
                                  }
                                } catch {}
                              }}>
                                <Check className="mr-2 h-4 w-4" />
                                Save
                              </Button>
                              <Button variant="outline" onClick={()=> setEditingEventId(null)}>
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button variant="outline" onClick={()=>{ setEditingEventId(event.id); setEditEventForm({ title: event.title || '', description: event.description || '', location: event.location || '', date: event.date || '', time: event.time || '', status: event.status || 'Upcoming' }) }}>Edit</Button>
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
                        <Label>Recipients</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="secondary">All Students</Badge>
                          <Badge variant="secondary">Final Year</Badge>
                          <Badge variant="secondary">Computer Science</Badge>
                          <Button variant="outline" size="sm">+ Add Recipient</Button>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button className="bg-maroon hover:bg-maroon/90" onClick={async()=>{
                          try {
                            if (!notificationTitle.trim() || !notificationMessage.trim()) { alert('Please provide title and message'); return }
                            const res = await fetch(`${API_BASE_DEFAULT}/api/v1/tpo/notifications/broadcast`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ title: notificationTitle.trim(), message: notificationMessage.trim() })
                            })
                            if (res.ok) {
                              alert('Notification sent to all students')
                              setNotificationTitle('')
                              setNotificationMessage('')
                            } else {
                              alert('Failed to send notification')
                            }
                          } catch { alert('Failed to send notification') }
                        }}>Send Notification</Button>
                        <Button variant="outline">Schedule</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

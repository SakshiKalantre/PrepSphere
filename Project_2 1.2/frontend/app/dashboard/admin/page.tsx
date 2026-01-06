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
  BarChart3, 
  Settings, 
  UserPlus,
  Edit,
  Eye,
  Check,
  X,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('users')
  const [isAddingUser, setIsAddingUser] = useState(false)
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
  const [pendingCertificates, setPendingCertificates] = useState<Array<any>>([])
  const fetchPendingCertificates = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/pending-certificates`)
      if (res.ok) setPendingCertificates(await res.json())
    } catch {}
  }
  useEffect(()=>{ fetchPendingCertificates() },[])
  const handleVerifyCertificate = async (fileId: number) => {
    try {
      await fetch(`${API_BASE}/api/v1/files/${fileId}/verify`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_verified: true, verification_notes: 'Verified by Admin' }) })
      fetchPendingCertificates()
    } catch {}
  }

  const users = [
    {
      id: 1,
      name: 'Anisha Sharma',
      email: 'anisha.sharma@student.edu',
      role: 'Student',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@tpo.edu',
      role: 'TPO',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Priya Patel',
      email: 'priya.patel@admin.edu',
      role: 'Admin',
      status: 'Active'
    }
  ]

  const analytics = {
    totalUsers: 1240,
    totalStudents: 980,
    totalTPO: 12,
    totalAdmin: 3,
    activeJobs: 42,
    upcomingEvents: 8,
    totalApplications: 1250
  }

  useEffect(() => {
    const applyRole = async () => {
      try {
        const role = 'ADMIN'
        if (user && (user.unsafeMetadata?.role !== role)) {
          await user.update({ unsafeMetadata: { role } })
        }
      } catch {}
    }
    applyRole()
  }, [user])

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
            <span className="text-sm text-gray-600">Admin Dashboard</span>
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
                <CardTitle className="text-lg">Admin Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <Button 
                    variant={activeTab === 'users' ? 'default' : 'ghost'} 
                    className={`w-full justify-start ${activeTab === 'users' ? 'bg-maroon hover:bg-maroon/90' : ''}`}
                    onClick={() => setActiveTab('users')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                  <Button 
                    variant={activeTab === 'analytics' ? 'default' : 'ghost'} 
                    className={`w-full justify-start ${activeTab === 'analytics' ? 'bg-maroon hover:bg-maroon/90' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </Button>
                  <Button 
                    variant={activeTab === 'content' ? 'default' : 'ghost'} 
                    className={`w-full justify-start ${activeTab === 'content' ? 'bg-maroon hover:bg-maroon/90' : ''}`}
                    onClick={() => setActiveTab('content')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    College Content
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:w-3/4">
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-maroon">User Management</h2>
                  <div className="flex space-x-2">
                    <Button 
                      className="bg-maroon hover:bg-maroon/90"
                      onClick={() => setIsAddingUser(true)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
                
                {isAddingUser ? (
                  <Card className="border-none shadow-md mb-6">
                    <CardHeader>
                      <CardTitle>Add New User</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" placeholder="User's full name" />
                          </div>
                          
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" placeholder="user@example.com" type="email" />
                          </div>
                          
                          <div>
                            <Label htmlFor="role">Role</Label>
                            <select 
                              id="role" 
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-maroon focus:border-maroon"
                            >
                              <option value="student">Student</option>
                              <option value="tpo">TPO</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" placeholder="Password" type="password" />
                          </div>
                          
                          <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input id="confirmPassword" placeholder="Confirm password" type="password" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex space-x-3">
                        <Button className="bg-maroon hover:bg-maroon/90">Create User</Button>
                        <Button variant="outline" onClick={() => setIsAddingUser(false)}>Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
                
                <div className="flex justify-between items-center mb-6">
                  <div className="flex space-x-2">
                    <Input placeholder="Search users..." className="w-64" />
                    <Button className="bg-maroon hover:bg-maroon/90">
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </Button>
                  </div>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {users.map((user) => (
                    <Card key={user.id} className="border-none shadow-md">
                      <CardContent className="p-6">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-xl font-semibold">{user.name}</h3>
                            <p className="text-gray-600">{user.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className={
                              user.role === 'Student' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'TPO' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }>
                              {user.role}
                            </Badge>
                            <Badge variant="secondary" className="bg-gold text-maroon">
                              {user.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex space-x-3">
                          <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Role
                          </Button>
                          <Button variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                          <Button variant="outline" className="text-red-600 hover:text-red-700">
                            <X className="mr-2 h-4 w-4" />
                            Deactivate
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'analytics' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-maroon">Analytics Dashboard</h2>
                  <div className="flex space-x-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-maroon focus:border-maroon">
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                    </select>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export Report
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-600">Total Users</p>
                          <h3 className="text-3xl font-bold text-maroon">{analytics.totalUsers}</h3>
                        </div>
                        <Users className="h-10 w-10 text-gold" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-600">Students</p>
                          <h3 className="text-3xl font-bold text-maroon">{analytics.totalStudents}</h3>
                        </div>
                        <Users className="h-10 w-10 text-gold" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-600">Active Jobs</p>
                          <h3 className="text-3xl font-bold text-maroon">{analytics.activeJobs}</h3>
                        </div>
                        <BarChart3 className="h-10 w-10 text-gold" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-600">Applications</p>
                          <h3 className="text-3xl font-bold text-maroon">{analytics.totalApplications}</h3>
                        </div>
                        <BarChart3 className="h-10 w-10 text-gold" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-none shadow-md">
                    <CardHeader>
                      <CardTitle>User Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                        <p className="text-gray-500">Chart visualization would appear here</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-none shadow-md">
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="bg-maroon w-8 h-8 rounded-full flex items-center justify-center text-white text-xs mr-3">RS</div>
                          <div>
                            <p className="font-medium">Rahul Sharma applied for Software Engineer</p>
                            <p className="text-sm text-gray-600">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="bg-gold w-8 h-8 rounded-full flex items-center justify-center text-maroon text-xs mr-3">TP</div>
                          <div>
                            <p className="font-medium">TPO posted new job: Data Analyst</p>
                            <p className="text-sm text-gray-600">5 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="bg-maroon w-8 h-8 rounded-full flex items-center justify-center text-white text-xs mr-3">AS</div>
                          <div>
                            <p className="font-medium">Anisha updated her profile</p>
                            <p className="text-sm text-gray-600">1 day ago</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
            {activeTab === 'content' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-maroon">College Content Management</h2>
                  <div className="flex space-x-2">
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Import Content
                    </Button>
                    <Button className="bg-maroon hover:bg-maroon/90">
                      <Download className="mr-2 h-4 w-4" />
                      Export Content
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <Card className="border-none shadow-md">
                    <CardHeader>
                      <CardTitle>Homepage Content</CardTitle>
                      <CardDescription>Manage the content displayed on the main website</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="collegeName">College Name</Label>
                          <Input id="collegeName" defaultValue="Smt. P.N. Doshi Women's College" />
                        </div>
                        
                        <div>
                          <Label htmlFor="aboutContent">About College</Label>
                          <Textarea 
                            id="aboutContent" 
                            rows={6} 
                            defaultValue="Smt. P.N. Doshi Women's College is a premier institution dedicated to empowering women through quality education. Established with a vision to provide excellent academic opportunities, our college has been nurturing young minds for over five decades."
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="placementContent">Placement Cell Information</Label>
                          <Textarea 
                            id="placementContent" 
                            rows={4} 
                            defaultValue="Our placement cell works tirelessly to connect students with top recruiters. With personalized career counseling, skill development workshops, and continuous mentorship, we ensure our students are well-prepared for their professional journey."
                          />
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button className="bg-maroon hover:bg-maroon/90">Save Changes</Button>
                          <Button variant="outline">Preview</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-none shadow-md">
                    <CardHeader>
                      <CardTitle>Recruiters Section</CardTitle>
                      <CardDescription>Manage the companies that recruit from our college</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Current Recruiters</h3>
                        <Button className="bg-maroon hover:bg-maroon/90">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Recruiter
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((item) => (
                          <Card key={item} className="border-none shadow-sm">
                            <CardContent className="p-4 text-center">
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-2" />
                              <h4 className="font-medium">TechCorp {item}</h4>
                              <p className="text-sm text-gray-600">IT Services</p>
                              <div className="mt-2 flex justify-center space-x-2">
                                <Button size="sm" variant="outline">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid grid-cols-1 gap-6 mt-8">
                  <Card className="border-none shadow-md">
                    <CardHeader>
                      <CardTitle>Documents Verification</CardTitle>
                      <CardDescription>Pending certificates waiting for approval</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pendingCertificates.map((c)=> (
                          <div key={c.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{c.file_name}</p>
                              <p className="text-sm text-gray-600">{c.first_name} {c.last_name} • {c.email}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" onClick={async()=>{
                                try {
                                  const info = await fetch(`${API_BASE}/api/v1/files/${c.id}`)
                                  if (!info.ok) { alert('Unable to load file information'); return }
                                  const meta = await info.json()
                                  if (!meta.exists) { alert('File not found on server'); return }
                                  const url = `${API_BASE}/api/v1/files/${c.id}/download`
                                  const w = window.open(url, '_blank')
                                  if (!w) { const a=document.createElement('a'); a.href=url; a.target='_blank'; document.body.appendChild(a); a.click(); a.remove() }
                                } catch { alert('Failed to open file') }
                              }}>View</Button>
                              <Button className="bg-maroon hover:bg-maroon/90" onClick={()=>handleVerifyCertificate(c.id)}>Verify</Button>
                            </div>
                          </div>
                        ))}
                        {pendingCertificates.length===0 && <p className="text-sm text-gray-600">No pending certificates</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

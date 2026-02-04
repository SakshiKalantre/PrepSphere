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
  Upload,
  Plus,
  MessageCircle,
  RefreshCw
} from 'lucide-react'

// Recharts imports
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, LabelList } from 'recharts';

export default function AdminDashboard() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('users')
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [isMessaging, setIsMessaging] = useState(false)
  const [analyticsView, setAnalyticsView] = useState('job') // 'job' or 'event'
  const [messageRecipient, setMessageRecipient] = useState<{ email: string, name: string } | null>(null)
  const [messageRecipientGroup, setMessageRecipientGroup] = useState<'ALL_TPOS'|'ALL_STUDENTS'|'PLACED_STUDENTS'|'UNPLACED_STUDENTS'>('ALL_STUDENTS')
  const [messageTitle, setMessageTitle] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsData, setDetailsData] = useState<any>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsUserId, setDetailsUserId] = useState<number | null>(null)
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const [pendingCertificates, setPendingCertificates] = useState<Array<any>>([])
  const [users, setUsers] = useState<Array<any>>([])
  const [filteredUsers, setFilteredUsers] = useState<Array<any>>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTPO: 0,
    placedStudents: 0,
    unplacedStudents: 0,
    unplacedReasons: {
      higherStudies: 0,
      exploring: 0,
      others: 0
    },
    activeJobs: 0,
    inactiveJobs: 0,
    totalApplications: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    cancelledEvents: 0,
    totalRegistrations: 0,
    placementPercentage: 0,
    totalJobs: 0,
    activeUsers: 0,
    inactiveUsers: 0
  })
  
  const [analyticsPercentages, setAnalyticsPercentages] = useState({
    placed_percentage: 0,
    unplaced_percentage: 0,
    higher_studies_percentage: 0,
    exploring_percentage: 0,
    others_percentage: 0
  })
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)
  
  // Contact Messages State
  const [contactMessages, setContactMessages] = useState<Array<any>>([])

  const fetchPendingCertificates = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/pending-certificates`)
      if (res.ok) setPendingCertificates(await res.json())
    } catch {}
  }

  const fetchUsers = async () => {
    try {
      console.log('Fetching users from:', `${API_BASE}/api/v1/admin/users`);
      const res = await fetch(`${API_BASE}/api/v1/admin/users`)
      if (res.ok) {
        const userData = await res.json();
        console.log('Users data received:', userData);
        setUsers(userData);
      } else {
        console.error('Users API error:', res.status, res.statusText);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  const fetchAnalytics = async () => {
    try {
      console.log('Fetching analytics from:', `${API_BASE}/api/v1/admin/analytics`);
      const res = await fetch(`${API_BASE}/api/v1/admin/analytics`)
      if (res.ok) {
        const data = await res.json();
        console.log('Analytics data received:', data);
        setAnalytics(data);
      } else {
        console.error('Analytics API error:', res.status, res.statusText);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }

  const fetchAnalyticsPercentages = async () => {
    try {
      console.log('Fetching analytics percentages from:', `${API_BASE}/api/v1/admin/analytics-percentages`);
      const res = await fetch(`${API_BASE}/api/v1/admin/analytics-percentages`)
      if (res.ok) {
        const data = await res.json();
        console.log('Analytics percentages data received:', data);
        setAnalyticsPercentages({
          placed_percentage: data.placed_percentage || 0,
          unplaced_percentage: data.unplaced_percentage || 0,
          higher_studies_percentage: data.higher_studies_percentage || 0,
          exploring_percentage: data.exploring_percentage || 0,
          others_percentage: data.others_percentage || 0
        });
      } else {
        console.error('Analytics percentages API error:', res.status, res.statusText);
        // If the endpoint doesn't exist, fall back to calculating from analytics data
        setAnalyticsPercentages({
          placed_percentage: analytics.placedStudents > 0 && analytics.totalStudents > 0 ? (analytics.placedStudents / analytics.totalStudents) * 100 : 0,
          unplaced_percentage: analytics.unplacedStudents > 0 && analytics.totalStudents > 0 ? (analytics.unplacedStudents / analytics.totalStudents) * 100 : 0,
          higher_studies_percentage: analytics.unplacedReasons.higherStudies > 0 && analytics.totalStudents > 0 ? (analytics.unplacedReasons.higherStudies / analytics.totalStudents) * 100 : 0,
          exploring_percentage: analytics.unplacedReasons.exploring > 0 && analytics.totalStudents > 0 ? (analytics.unplacedReasons.exploring / analytics.totalStudents) * 100 : 0,
          others_percentage: analytics.unplacedReasons.others > 0 && analytics.totalStudents > 0 ? (analytics.unplacedReasons.others / analytics.totalStudents) * 100 : 0
        });
      }
    } catch (error) {
      console.error('Error fetching analytics percentages:', error);
      // Fall back to calculating from analytics data
      setAnalyticsPercentages({
        placed_percentage: analytics.placedStudents > 0 && analytics.totalStudents > 0 ? (analytics.placedStudents / analytics.totalStudents) * 100 : 0,
        unplaced_percentage: analytics.unplacedStudents > 0 && analytics.totalStudents > 0 ? (analytics.unplacedStudents / analytics.totalStudents) * 100 : 0,
        higher_studies_percentage: analytics.unplacedReasons.higherStudies > 0 && analytics.totalStudents > 0 ? (analytics.unplacedReasons.higherStudies / analytics.totalStudents) * 100 : 0,
        exploring_percentage: analytics.unplacedReasons.exploring > 0 && analytics.totalStudents > 0 ? (analytics.unplacedReasons.exploring / analytics.totalStudents) * 100 : 0,
        others_percentage: analytics.unplacedReasons.others > 0 && analytics.totalStudents > 0 ? (analytics.unplacedReasons.others / analytics.totalStudents) * 100 : 0
      });
    }
  }

  const fetchContactMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/contact/contact-messages`)
      if (res.ok) {
        setContactMessages(await res.json())
      }
    } catch {}
  }
  
  useEffect(()=>{ 
    fetchPendingCertificates()
    fetchUsers()
    fetchAnalytics()
    fetchAnalyticsPercentages()
  },[API_BASE])

  // Effect to apply filters
  useEffect(() => {
    let result = [...users];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      switch(filterType) {
        case 'active':
          result = result.filter(user => user.status === 'Active');
          break;
        case 'inactive':
          result = result.filter(user => user.status === 'Inactive');
          break;
        case 'students':
          result = result.filter(user => user.role.toLowerCase() === 'student');
          break;
        case 'tpos':
          result = result.filter(user => user.role.toLowerCase() === 'tpo');
          break;
        case 'placed':
          result = result.filter(user => user.profile && user.profile.placement_status === 'Placed');
          break;
        case 'unplaced':
          result = result.filter(user => !user.profile || user.profile.placement_status !== 'Placed');
          break;
        default:
          break;
      }
    }
    
    setFilteredUsers(result);
  }, [users, searchTerm, filterType]);

  const handleVerifyCertificate = async (fileId: number) => {
    try {
      await fetch(`${API_BASE}/api/v1/files/${fileId}/verify`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_verified: true, verification_notes: 'Verified by Admin' }) })
      fetchPendingCertificates()
      fetchAnalytics() // Refresh analytics after verification
    } catch {}
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
                    variant={activeTab === 'contact' ? 'default' : 'ghost'} 
                    className={`w-full justify-start ${activeTab === 'contact' ? 'bg-maroon hover:bg-maroon/90' : ''}`}
                    onClick={() => {
                      setActiveTab('contact');
                      fetchContactMessages();
                    }}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contact Messages
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
                    <Button 
                      className="bg-maroon hover:bg-maroon/90"
                      onClick={() => {
                        setMessageRecipient(null)
                        setIsMessaging(true)
                      }}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Send Notification
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={async () => {
                        try {
                          const response = await fetch(`${API_BASE}/api/v1/admin/export-users`);
                          if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'users_export.csv';
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);
                          } else {
                            alert('Failed to export users data');
                          }
                        } catch (error) {
                          console.error('Export error:', error);
                          alert('Error exporting users data');
                        }
                      }}
                    >
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
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" placeholder="First name" />
                          </div>
                          
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" placeholder="Last name" />
                          </div>
                          
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" placeholder="user@example.com" type="email" />
                          </div>
                          
                          <div>
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input id="phoneNumber" placeholder="Phone number" />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" placeholder="Password" type="password" />
                          </div>
                          
                          <div>
                            <Label htmlFor="role">Role</Label>
                            <select 
                              id="role" 
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-maroon focus:border-maroon"
                            >
                              <option value="STUDENT">Student</option>
                              <option value="TPO">TPO</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex space-x-3">
                        <Button 
                          className="bg-maroon hover:bg-maroon/90" 
                          onClick={async () => {
                            // Get form values
                            const firstName = (document.getElementById('firstName') as HTMLInputElement)?.value;
                            const lastName = (document.getElementById('lastName') as HTMLInputElement)?.value;
                            const email = (document.getElementById('email') as HTMLInputElement)?.value;
                            const phoneNumber = (document.getElementById('phoneNumber') as HTMLInputElement)?.value;
                            const password = (document.getElementById('password') as HTMLInputElement)?.value;
                            const role = (document.getElementById('role') as HTMLSelectElement)?.value;
                            
                            if (!firstName || !lastName || !email || !password || !role) {
                              alert('Please fill in all required fields');
                              return;
                            }
                            
                            try {
                              const response = await fetch(`${API_BASE}/api/v1/admin/create-user`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  first_name: firstName,
                                  last_name: lastName,
                                  email,
                                  phone_number: phoneNumber || '',
                                  role,
                                  password
                                })
                              });
                              
                              const result = await response.json();
                              if (response.ok) {
                                alert('User created successfully');
                                // Refresh the user list
                                fetchUsers();
                                setIsAddingUser(false);
                              } else {
                                alert(result.detail || 'Failed to create user');
                              }
                            } catch (error) {
                              alert('Error creating user');
                            }
                          }}
                        >
                          Create User
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddingUser(false)}>Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
                
                <div className="flex justify-between items-center mb-6">
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Search users..." 
                      className="w-64" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button className="bg-maroon hover:bg-maroon/90">
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </Button>
                  </div>
                  <div className="relative">
                    <Button 
                      variant="outline"
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                    
                    {showFilterDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                        <button 
                          className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterType === 'all' ? 'bg-gray-100' : ''}`}
                          onClick={() => {setFilterType('all'); setShowFilterDropdown(false);}}
                        >
                          All Users
                        </button>
                        <button 
                          className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterType === 'active' ? 'bg-gray-100' : ''}`}
                          onClick={() => {setFilterType('active'); setShowFilterDropdown(false);}}
                        >
                          Active Users
                        </button>
                        <button 
                          className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterType === 'inactive' ? 'bg-gray-100' : ''}`}
                          onClick={() => {setFilterType('inactive'); setShowFilterDropdown(false);}}
                        >
                          Inactive Users
                        </button>
                        <button 
                          className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterType === 'students' ? 'bg-gray-100' : ''}`}
                          onClick={() => {setFilterType('students'); setShowFilterDropdown(false);}}
                        >
                          Students Only
                        </button>
                        <button 
                          className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterType === 'tpos' ? 'bg-gray-100' : ''}`}
                          onClick={() => {setFilterType('tpos'); setShowFilterDropdown(false);}}
                        >
                          TPOs Only
                        </button>
                        <button 
                          className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterType === 'placed' ? 'bg-gray-100' : ''}`}
                          onClick={() => {setFilterType('placed'); setShowFilterDropdown(false);}}
                        >
                          Placed Students
                        </button>
                        <button 
                          className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterType === 'unplaced' ? 'bg-gray-100' : ''}`}
                          onClick={() => {setFilterType('unplaced'); setShowFilterDropdown(false);}}
                        >
                          Unplaced Students
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {filteredUsers.map((user) => (
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
                            {/* Placed badge for students who have uploaded offer letter */}
                            {(user.role === 'Student' || user.role === 'STUDENT') && user.has_verified_offer_letter && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Placed
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-6 flex flex-wrap gap-2">
                          <Button variant="outline" onClick={async()=>{
                            try {
                              setDetailsUserId(user.id)
                              setDetailsOpen(true)
                              setDetailsLoading(true)
                              const ures = await fetch(`${API_BASE}/api/v1/users/${user.id}`)
                              const pres = await fetch(`${API_BASE}/api/v1/users/${user.id}/profile`)
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
                          {user.has_verified_resume && (
                            <Button variant="outline" onClick={async () => {
                              try {
                                const url = `${API_BASE}/api/v1/files/${user.resume_file_id}/download`
                                const w = window.open(url, '_blank')
                                if (!w) { 
                                  const a = document.createElement('a'); 
                                  a.href = url; 
                                  a.target = '_blank'; 
                                  document.body.appendChild(a); 
                                  a.click(); 
                                  a.remove() 
                                }
                              } catch { 
                                alert('Failed to open resume') 
                              }
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Resume
                            </Button>
                          )}
                          {user.has_verified_offer_letter && (
                            <Button variant="outline" onClick={async () => {
                              try {
                                const url = `${API_BASE}/api/v1/files/${user.offer_letter_file_id}/download`
                                const w = window.open(url, '_blank')
                                if (!w) { 
                                  const a = document.createElement('a'); 
                                  a.href = url; 
                                  a.target = '_blank'; 
                                  document.body.appendChild(a); 
                                  a.click(); 
                                  a.remove() 
                                }
                              } catch { 
                                alert('Failed to open offer letter') 
                              }
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Offer Letter
                            </Button>
                          )}
                          <Button variant="outline" onClick={() => {
                            setMessageRecipient({ email: user.email, name: user.name })
                            setIsMessaging(true)
                          }}>
                            <MessageCircle className="h-4 w-4 mr-2" /> Send Message
                          </Button>
                          {user.status === 'Active' ? (
                            <Button 
                              variant="outline" 
                              className="text-red-600 hover:text-red-700"
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to deactivate ${user.name}?`)) {
                                  try {
                                    const response = await fetch(`${API_BASE}/api/v1/admin/user/${user.id}/deactivate`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                    });
                                    
                                    const result = await response.json();
                                    if (response.ok) {
                                      // Update the local users state to reflect the change
                                      setUsers(prevUsers => 
                                        prevUsers.map(u => 
                                          u.id === user.id 
                                            ? { ...u, status: result.is_active ? 'Active' : 'Inactive', is_active: result.is_active }
                                            : u
                                        )
                                      );
                                      alert('User deactivated successfully');
                                    } else {
                                      alert(result.detail || 'Failed to deactivate user');
                                    }
                                  } catch (error) {
                                    alert('Error deactivating user');
                                  }
                                }
                              }}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Deactivate
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              className="text-green-600 hover:text-green-700"
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to activate ${user.name}?`)) {
                                  try {
                                    const response = await fetch(`${API_BASE}/api/v1/admin/user/${user.id}/activate`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                    });
                                    
                                    const result = await response.json();
                                    if (response.ok) {
                                      // Update the local users state to reflect the change
                                      setUsers(prevUsers => 
                                        prevUsers.map(u => 
                                          u.id === user.id 
                                            ? { ...u, status: result.is_active ? 'Active' : 'Inactive', is_active: result.is_active }
                                            : u
                                        )
                                      );
                                      alert('User activated successfully');
                                    } else {
                                      alert(result.detail || 'Failed to activate user');
                                    }
                                  } catch (error) {
                                    alert('Error activating user');
                                  }
                                }
                              }}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Activate
                            </Button>
                          )}
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
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        fetchAnalytics();
                        fetchAnalyticsPercentages();
                      }}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh Data
                    </Button>
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-maroon focus:border-maroon">
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                    </select>
                    <Button 
                      variant="outline" 
                      onClick={async () => {
                        try {
                          const response = await fetch(`${API_BASE}/api/v1/admin/analytics/report-text`);
                          if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'admin-analytics-report.txt';
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);
                          } else {
                            alert('Failed to download report');
                          }
                        } catch (error) {
                          console.error('Export report error:', error);
                          alert('Error downloading report');
                        }
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export Report
                    </Button>
                  </div>
                </div>
                
                            
                {/* User Analytics Cards */}
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
                          <p className="text-gray-600">Total Students</p>
                          <h3 className="text-3xl font-bold text-maroon">{analytics.totalStudents}</h3>
                        </div>
                        <Users className="h-10 w-10 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                              
                  <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-600">Total TPOs</p>
                          <h3 className="text-3xl font-bold text-maroon">{analytics.totalTPO}</h3>
                        </div>
                        <Users className="h-10 w-10 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                              
                  <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-600">Total Admins</p>
                          <h3 className="text-3xl font-bold text-maroon">1</h3>
                        </div>
                        <Users className="h-10 w-10 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                            
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-600">Active Users</p>
                          <h3 className="text-3xl font-bold text-maroon">{analytics.activeUsers}</h3>
                        </div>
                        <Users className="h-10 w-10 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                              
                  <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-600">Inactive Users</p>
                          <h3 className="text-3xl font-bold text-maroon">{analytics.inactiveUsers}</h3>
                        </div>
                        <Users className="h-10 w-10 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                            
                {/* Analytics Toggle */}
                <div className="mb-8">
                  <div className="flex justify-center mb-6">
                    <div className="inline-flex rounded-md bg-gray-100 p-1">
                      <button
                        className={`px-6 py-3 rounded-md text-base font-medium transition-colors ${analyticsView === 'job' ? 'bg-maroon text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                        onClick={() => setAnalyticsView('job')}
                      >
                        Job Analytics
                      </button>
                      <button
                        className={`px-6 py-3 rounded-md text-base font-medium transition-colors ${analyticsView === 'event' ? 'bg-maroon text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                        onClick={() => setAnalyticsView('event')}
                      >
                        Event Analytics
                      </button>
                    </div>
                  </div>
                  
                  {/* Job Analytics View */}
                  {analyticsView === 'job' && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                                <p className="text-gray-600">Inactive Jobs</p>
                                <h3 className="text-3xl font-bold text-maroon">{analytics.inactiveJobs}</h3>
                              </div>
                              <BarChart3 className="h-10 w-10 text-gold" />
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-none shadow-md">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-gray-600">Placed Students</p>
                                <h3 className="text-3xl font-bold text-maroon">{analytics.placedStudents}</h3>
                              </div>
                              <Users className="h-10 w-10 text-green-500" />
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-none shadow-md">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-gray-600">Unplaced Students</p>
                                <h3 className="text-3xl font-bold text-maroon">{analytics.unplacedStudents}</h3>
                              </div>
                              <Users className="h-10 w-10 text-red-500" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Unplaced Students by Reason - Full Width */}
                      <div className="mb-6">
                        <Card className="border-none shadow-lg rounded-xl overflow-hidden bg-white">
                          <CardHeader className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-100 pb-4">
                            <CardTitle className="text-xl font-bold text-gray-800">Unplaced Students Analysis</CardTitle>
                          </CardHeader>
                          <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                              {/* Total Unplaced Circle */}
                              <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-full h-40 w-40 border-4 border-red-100 shadow-sm">
                                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total</span>
                                <span className="text-4xl font-extrabold text-red-600">{analytics.unplacedStudents}</span>
                                <span className="text-xs text-gray-400 mt-1">Unplaced</span>
                              </div>
                              
                              {/* Reasons Grid */}
                              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-blue-600 font-semibold">Higher Studies</span>
                                    <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">Reason</span>
                                  </div>
                                  <div className="text-2xl font-bold text-gray-800">{analytics.unplacedReasons.higherStudies}</div>
                                  <div className="w-full bg-blue-200 h-1.5 mt-3 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-blue-500 h-full rounded-full" 
                                      style={{ width: `${analytics.unplacedStudents ? ((analytics.unplacedReasons.higherStudies) / analytics.unplacedStudents * 100) : 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-purple-600 font-semibold">Exploring</span>
                                    <span className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full">Reason</span>
                                  </div>
                                  <div className="text-2xl font-bold text-gray-800">{analytics.unplacedReasons.exploring}</div>
                                  <div className="w-full bg-purple-200 h-1.5 mt-3 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-purple-500 h-full rounded-full" 
                                      style={{ width: `${analytics.unplacedStudents ? ((analytics.unplacedReasons.exploring) / analytics.unplacedStudents * 100) : 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-gray-600 font-semibold">Others</span>
                                    <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">Reason</span>
                                  </div>
                                  <div className="text-2xl font-bold text-gray-800">{analytics.unplacedReasons.others}</div>
                                  <div className="w-full bg-gray-200 h-1.5 mt-3 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-gray-500 h-full rounded-full" 
                                      style={{ width: `${analytics.unplacedStudents ? ((analytics.unplacedReasons.others) / analytics.unplacedStudents * 100) : 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
                          <CardHeader className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-100 pb-4">
                            <CardTitle className="text-xl font-bold text-gray-800">Students Placement Status</CardTitle>
                          </CardHeader>
                          <CardContent className="p-6 bg-white">
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <defs>
                                  <linearGradient id="gradientPlaced" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#34D399" />
                                    <stop offset="100%" stopColor="#059669" />
                                  </linearGradient>
                                  <linearGradient id="gradientUnplaced" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#F87171" />
                                    <stop offset="100%" stopColor="#DC2626" />
                                  </linearGradient>
                                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.2"/>
                                  </filter>
                                </defs>
                                <Pie
                                  data={[
                                    { name: 'Placed', value: Number(analyticsPercentages.placed_percentage) },
                                    { name: 'Unplaced', value: Number(analyticsPercentages.unplaced_percentage) },
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={true}
                                  label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                                  outerRadius={100}
                                  innerRadius={0}
                                  dataKey="value"
                                  stroke="none"
                                  style={{ filter: 'url(#shadow)' }}
                                >
                                  <Cell key={`cell-0`} fill="url(#gradientPlaced)" />
                                  <Cell key={`cell-1`} fill="url(#gradientUnplaced)" />
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                              </PieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
                          <CardHeader className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-100 pb-4">
                            <CardTitle className="text-xl font-bold text-gray-800">Jobs Overview</CardTitle>
                          </CardHeader>
                          <CardContent className="p-6 bg-white">
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <defs>
                                  <linearGradient id="gradientActive" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#60A5FA" />
                                    <stop offset="100%" stopColor="#2563EB" />
                                  </linearGradient>
                                  <linearGradient id="gradientInactive" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#9CA3AF" />
                                    <stop offset="100%" stopColor="#4B5563" />
                                  </linearGradient>
                                  <filter id="shadow2" x="-20%" y="-20%" width="140%" height="140%">
                                    <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.2"/>
                                  </filter>
                                </defs>
                                <Pie
                                  data={[
                                    { name: 'Active', value: analytics.activeJobs },
                                    { name: 'Inactive', value: analytics.inactiveJobs },
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={true}
                                  label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                                  outerRadius={100}
                                  innerRadius={0}
                                  dataKey="value"
                                  stroke="none"
                                  style={{ filter: 'url(#shadow2)' }}
                                >
                                  <Cell key={`cell-0`} fill="url(#gradientActive)" />
                                  <Cell key={`cell-1`} fill="url(#gradientInactive)" />
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                              </PieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6">
                        <Card className="border-none shadow-md">
                          <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Placement Distribution</CardTitle>
                            <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                              Total Strength: <span className="text-maroon font-bold">{analytics.totalStudents}</span>
                            </div>
                          </CardHeader>
                          <CardContent className="h-[350px] bg-gradient-to-b from-white to-slate-100 rounded-b-lg p-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={[
                                  { name: 'Placed', percentage: analyticsPercentages.placed_percentage, count: analytics.placedStudents },
                                  { name: 'Higher Studies', percentage: analyticsPercentages.higher_studies_percentage, count: analytics.unplacedReasons.higherStudies },
                                  { name: 'Exploring Opportunities', percentage: analyticsPercentages.exploring_percentage, count: analytics.unplacedReasons.exploring },
                                  { name: 'Others', percentage: analyticsPercentages.others_percentage, count: analytics.unplacedReasons.others },
                                ]}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
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
                                  tick={{ fill: '#4b5563', fontSize: 12 }} 
                                  axisLine={{ stroke: '#9ca3af', strokeOpacity: 0.5 }} 
                                  tickLine={false} 
                                />
                                <YAxis 
                                  domain={[0, 100]} 
                                  tick={{ fill: '#4b5563', fontSize: 12 }} 
                                  axisLine={false} 
                                  tickLine={false} 
                                />
                                <Tooltip 
                                  cursor={{ fill: 'transparent' }}
                                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                  formatter={(value: any, name: any, props: any) => [
                                    <span key="value" className="font-semibold">
                                      {`${Number(value).toFixed(1)}% `}
                                      <span className="text-gray-500 font-normal">({props.payload.count} students)</span>
                                    </span>, 
                                    'Percentage'
                                  ]}
                                />
                                <Bar dataKey="percentage" radius={[8, 8, 0, 0]} barSize={60}>
                                  {
                                    [
                                      { name: 'Placed' },
                                      { name: 'Higher Studies' },
                                      { name: 'Exploring Opportunities' },
                                      { name: 'Others' },
                                    ].map((entry, index) => {
                                      let fillId = 'colorOthers';
                                      if (entry.name === 'Placed') fillId = 'colorPlaced';
                                      else if (entry.name === 'Higher Studies') fillId = 'colorHigher';
                                      else if (entry.name.includes('Exploring')) fillId = 'colorExploring';
                                      
                                      return <Cell key={`cell-${index}`} fill={`url(#${fillId})`} />;
                                    })
                                  }
                                  <LabelList 
                                    dataKey="percentage" 
                                    position="top" 
                                    content={(props: any) => {
                                      const { x, y, width, value, index } = props;
                                      const data = [
                                        { count: analytics.placedStudents },
                                        { count: analytics.unplacedReasons.higherStudies },
                                        { count: analytics.unplacedReasons.exploring },
                                        { count: analytics.unplacedReasons.others },
                                      ];
                                      const count = data[index]?.count || 0;
                                      return (
                                        <g>
                                          <text x={x + width / 2} y={y - 20} fill="#374151" textAnchor="middle" fontSize="12" fontWeight="bold">
                                            {Number(value).toFixed(1)}%
                                          </text>
                                          <text x={x + width / 2} y={y - 5} fill="#6B7280" textAnchor="middle" fontSize="10">
                                            ({count})
                                          </text>
                                        </g>
                                      );
                                    }}
                                  />
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </div>
                      
                      
                    </div>
                  )}
                  
                  {/* Event Analytics View */}
                  {analyticsView === 'event' && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="border-none shadow-md">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-gray-600">Total Events</p>
                                <h3 className="text-3xl font-bold text-maroon">{analytics.totalEvents}</h3>
                              </div>
                              <BarChart3 className="h-10 w-10 text-gold" />
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-none shadow-md">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-gray-600">Total Event Registration</p>
                                <h3 className="text-3xl font-bold text-maroon">{analytics.totalRegistrations}</h3>
                              </div>
                              <Users className="h-10 w-10 text-gold" />
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-none shadow-md">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-gray-600">Completed Events</p>
                                <h3 className="text-3xl font-bold text-maroon">{analytics.completedEvents}</h3>
                              </div>
                              <BarChart3 className="h-10 w-10 text-gold" />
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-none shadow-md">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-gray-600">Upcoming Events</p>
                                <h3 className="text-3xl font-bold text-maroon">{analytics.upcomingEvents}</h3>
                              </div>
                              <BarChart3 className="h-10 w-10 text-gold" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-md">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-gray-600">Cancelled Events</p>
                                <h3 className="text-3xl font-bold text-maroon">{analytics.cancelledEvents}</h3>
                              </div>
                              <BarChart3 className="h-10 w-10 text-gold" />
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-none shadow-md">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-gray-600">Per Event Avg</p>
                                <h3 className="text-3xl font-bold text-maroon">{analytics.totalEvents > 0 ? Math.round(analytics.totalRegistrations / analytics.totalEvents) : 0}</h3>
                              </div>
                              <Users className="h-10 w-10 text-gold" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
                  
            {activeTab === 'contact' && (
              <div>
                <h2 className="text-2xl font-bold text-maroon mb-6">Contact Messages</h2>
                      
                {contactMessages.length === 0 ? (
                  <Card className="border-none shadow-md">
                    <CardContent className="p-8 text-center">
                      <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No contact messages yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contactMessages.map((message) => {
                      const isNew = !message.is_read;
                      return (
                        <Card 
                          key={message.id} 
                          className={`border-none shadow-md ${isNew ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="space-y-1">
                                <div>
                                  <span className="text-xs font-bold text-gray-500 uppercase">Contact Person:</span>
                                  <span className="ml-2 font-semibold text-lg">{message.name}</span>
                                </div>
                                {message.designation && (
                                  <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Designation:</span>
                                    <span className="ml-2 text-sm text-gray-700">{message.designation}</span>
                                  </div>
                                )}
                                {message.company_name && (
                                  <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Company:</span>
                                    <span className="ml-2 text-sm font-semibold text-maroon">{message.company_name}</span>
                                  </div>
                                )}
                              </div>
                              {isNew && (
                                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">New</span>
                              )}
                            </div>
                            
                            <div className="space-y-2 mb-4">
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase block">Official Email:</span>
                                    <a href={`mailto:${message.email}`} className="text-blue-600 text-sm hover:underline block">{message.email}</a>
                                </div>
                                
                                {message.phone_number && (
                                    <div>
                                        <span className="text-xs font-bold text-gray-500 uppercase block">Phone Number:</span>
                                        <a href={`tel:${message.phone_number}`} className="text-gray-600 text-sm block hover:text-maroon">
                                            {message.phone_number}
                                        </a>
                                    </div>
                                )}
                                
                                {message.official_website && (
                                    <div>
                                        <span className="text-xs font-bold text-gray-500 uppercase block">Official Website:</span>
                                        <a href={message.official_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline block truncate">
                                            {message.official_website}
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Message:</span>
                                <p className="text-gray-800 text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{message.message}</p>
                            </div>

                            <div className="mt-4 pt-2 border-t border-gray-100 flex justify-between items-center">
                              <p className="text-gray-500 text-xs">{new Date(message.created_at).toLocaleString()}</p>
                              <span className={`text-xs px-2 py-1 rounded ${isNew ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                {isNew ? 'Unread' : 'Read'}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
                  
      
      
      
          </div>
        </div>
      </div>
      
      {/* View Details Modal */}
      {detailsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-maroon">User Details</h3>
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
              </div>
              
              {detailsLoading ? (
                <p>Loading...</p>
              ) : detailsData ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg">User Information</h4>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <p><span className="font-medium">Name:</span> {detailsData.user?.first_name} {detailsData.user?.last_name}</p>
                      <p><span className="font-medium">Email:</span> {detailsData.user?.email}</p>
                      <p><span className="font-medium">Phone:</span> {detailsData.user?.phone_number}</p>
                      <p><span className="font-medium">Role:</span> {detailsData.user?.role}</p>
                      <p><span className="font-medium">Status:</span> {detailsData.user?.is_active ? 'Active' : 'Inactive'}</p>
                      <p><span className="font-medium">Created:</span> {detailsData.user?.created_at}</p>
                    </div>
                  </div>
                  
                  {detailsData.profile && (
                    <div>
                      <h4 className="font-semibold text-lg">Profile Information</h4>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <p><span className="font-medium">Degree:</span> {detailsData.profile?.degree}</p>
                        <p><span className="font-medium">Year:</span> {detailsData.profile?.year}</p>
                        <p><span className="font-medium">Skills:</span> {detailsData.profile?.skills}</p>
                        <p><span className="font-medium">About:</span> {detailsData.profile?.about}</p>
                        <p><span className="font-medium">Status:</span> {detailsData.profile?.approval_status}</p>
                        <p><span className="font-medium">Placement:</span> {detailsData.profile?.placement_status}</p>
                        <p><span className="font-medium">Company:</span> {detailsData.profile?.company_name}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p>No details available</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Message Modal */}
      {isMessaging && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-maroon mb-4">
                {messageRecipient ? 'Send Message' : 'Send Bulk Notification'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="messageRecipient">To</Label>
                  {messageRecipient ? (
                    <Input 
                      id="messageRecipient" 
                      readOnly 
                      value={`${messageRecipient.name} (${messageRecipient.email})`} 
                    />
                  ) : (
                    <select
                      id="messageRecipientGroup"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-maroon focus:border-maroon"
                      value={messageRecipientGroup}
                      onChange={(e) => setMessageRecipientGroup(e.target.value as any)}
                    >
                      <option value="ALL_STUDENTS">All Students</option>
                      <option value="ALL_TPOS">All TPOs</option>
                      <option value="PLACED_STUDENTS">Placed Students</option>
                      <option value="UNPLACED_STUDENTS">Unplaced Students</option>
                    </select>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="messageTitle">Subject</Label>
                  <Input 
                    id="messageTitle" 
                    value={messageTitle} 
                    onChange={(e) => setMessageTitle(e.target.value)} 
                    placeholder="Enter message subject" 
                  />
                </div>
                
                <div>
                  <Label htmlFor="messageBody">Message</Label>
                  <Textarea 
                    id="messageBody" 
                    rows={4} 
                    value={messageBody} 
                    onChange={(e) => setMessageBody(e.target.value)} 
                    placeholder="Enter your message" 
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => {
                    setIsMessaging(false);
                    setMessageRecipient(null);
                    setMessageTitle('');
                    setMessageBody('');
                  }}>Cancel</Button>
                  <Button className="bg-maroon hover:bg-maroon/90" onClick={async () => {
                    if (!messageTitle.trim() || !messageBody.trim()) {
                      alert('Please fill in subject and message');
                      return;
                    }

                    if (messageRecipient) {
                      // Single User Logic
                      try {
                        // First, find the user ID by email
                        const usersRes = await fetch(`${API_BASE}/api/v1/admin/users`);
                        const usersData = await usersRes.json();
                        // @ts-ignore
                        const recipientUser = usersData.find((user: any) => user.email === messageRecipient.email);
                        
                        if (!recipientUser) {
                          alert('User not found');
                          return;
                        }
                        
                        const res = await fetch(`${API_BASE}/api/v1/admin/send-notification`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            user_id: recipientUser.id,
                            title: messageTitle,
                            message: messageBody
                          })
                        });
                        
                        if (res.ok) {
                          alert('Message sent successfully');
                          setIsMessaging(false);
                          setMessageRecipient(null);
                          setMessageTitle('');
                          setMessageBody('');
                        } else {
                          const error = await res.json().catch(() => ({}));
                          alert(error.error || 'Failed to send message');
                        }
                      } catch (err) {
                        alert('Failed to send message');
                      }
                    } else {
                      // Bulk Logic
                      try {
                        const res = await fetch(`${API_BASE}/api/v1/notifications/send-bulk`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            recipient_group: messageRecipientGroup,
                            title: messageTitle,
                            message: messageBody
                          })
                        });

                        const result = await res.json();
                        if (res.ok && result.success) {
                          alert(result.message || 'Notifications sent successfully');
                          setIsMessaging(false);
                          setMessageRecipient(null);
                          setMessageTitle('');
                          setMessageBody('');
                        } else {
                          alert(result.message || 'Failed to send notifications');
                        }
                      } catch (err) {
                         alert('Failed to send notifications: ' + err);
                      }
                    }
                  }}>Send</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

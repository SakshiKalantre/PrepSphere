"use client"

import { useUser, UserButton, SignInButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  const { isSignedIn, user } = useUser()

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-maroon w-10 h-10 rounded-full"></div>
            <span className="text-2xl font-bold text-maroon">PrepSphere</span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="#about" className="text-gray-600 hover:text-maroon transition-colors">About</Link>
            <Link href="#recruiters" className="text-gray-600 hover:text-maroon transition-colors">Recruiters</Link>
            <Link href="#achievements" className="text-gray-600 hover:text-maroon transition-colors">Achievements</Link>
            <Link href="#contact" className="text-gray-600 hover:text-maroon transition-colors">Contact</Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <span className="text-sm text-gray-600">Welcome, {user.firstName}</span>
                <UserButton afterSignOutUrl="/" />
                <Link href="/dashboard">
                  <Button variant="default" className="bg-maroon hover:bg-maroon/90">Dashboard</Button>
                </Link>
              </>
            ) : (
              <SignInButton mode="modal">
                <Button variant="default" className="bg-maroon hover:bg-maroon/90">Sign In</Button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-maroon to-maroon/80 text-white">
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
            <Link href="/sign-up">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
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
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96 flex items-center justify-center">
              <span className="text-gray-500">College Image</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recruiters Section */}
      <section id="recruiters" className="py-20 bg-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-maroon mb-4">Our Recruiters</h2>
            <div className="w-24 h-1 bg-gold mx-auto"></div>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Leading companies trust our graduates and regularly recruit from our institution
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex items-center justify-center h-32">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                </CardContent>
              </Card>
            ))}
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
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-t-4 border-maroon shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl text-center text-maroon">95%</CardTitle>
                <CardDescription className="text-center">Placement Rate</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">
                  Consistently high placement rate over the past 5 years
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-t-4 border-gold shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl text-center text-maroon">₹12 LPA</CardTitle>
                <CardDescription className="text-center">Highest Package</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">
                  Highest package offered to our recent graduate
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-t-4 border-maroon shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl text-center text-maroon">150+</CardTitle>
                <CardDescription className="text-center">Companies Visited</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">
                  Number of companies that visited our campus last year
                </p>
              </CardContent>
            </Card>
          </div>
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
                      Wadala West, Mumbai - 400031
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
                    <p className="text-gray-600">placements@smpndoshi.edu.in</p>
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
                    <p className="text-gray-600">+91 22 1234 5678</p>
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
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-maroon focus:border-maroon"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-maroon focus:border-maroon"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea 
                        id="message" 
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-maroon focus:border-maroon"
                        placeholder="Your message"
                      ></textarea>
                    </div>
                    <Button className="w-full bg-maroon hover:bg-maroon/90">Send Message</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-maroon text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-white w-8 h-8 rounded-full"></div>
                <span className="text-xl font-bold">PrepSphere</span>
              </div>
              <p className="text-cream/80 mb-4">
                Empowering women through quality education and exceptional placement opportunities.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-cream/80 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-cream/80 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-cream/80 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
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
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-cream/80 hover:text-white transition-colors">Student Handbook</a></li>
                <li><a href="#" className="text-cream/80 hover:text-white transition-colors">Career Guide</a></li>
                <li><a href="#" className="text-cream/80 hover:text-white transition-colors">Internship Portal</a></li>
                <li><a href="#" className="text-cream/80 hover:text-white transition-colors">Alumni Network</a></li>
                <li><a href="#" className="text-cream/80 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-cream/80 mb-4">Subscribe to our newsletter for updates</p>
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-4 py-2 w-full rounded-l-md focus:outline-none text-gray-800"
                />
                <button 
                  type="submit"
                  className="bg-gold text-maroon px-4 py-2 rounded-r-md hover:bg-gold/90 transition-colors"
                >
                  Go
                </button>
              </form>
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
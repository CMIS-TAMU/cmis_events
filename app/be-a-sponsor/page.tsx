'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Users, FileText, UtensilsCrossed, TrendingUp, Bell, Target, Zap, Award, Clock, Star, AlertCircle, BarChart3, Crown } from 'lucide-react';

export default function BeASponsorPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      {/* Hero Section with Stats */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4 text-sm font-semibold">
          <Zap className="h-4 w-4" />
          Limited Availability - Only 8 Premium Spots Remaining
        </div>
        <h1 className="text-5xl font-bold mb-4">Hire 3-5 Exceptional Candidates This Semester</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
          Partner with CMIS for direct access to 500+ pre-vetted students from Texas A&M's top programs
        </p>
        
        {/* Stats Bar */}
        <div className="flex flex-wrap justify-center gap-8 mb-8 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span><strong className="text-2xl font-bold">500+</strong> Students</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            <span><strong className="text-2xl font-bold">95%</strong> Placement Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span><strong className="text-2xl font-bold">$75K</strong> Avg Starting Salary</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            <span><strong className="text-2xl font-bold">50+</strong> Partner Companies</span>
          </div>
        </div>
        
        {/* Trust Badge */}
        <p className="text-sm text-muted-foreground">
          Trusted by Microsoft, Amazon, Deloitte, ExxonMobil, and 45+ leading companies
        </p>
      </div>

      {/* ROI Comparison Section */}
      <section className="mb-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-8 text-center">Why CMIS vs Traditional Recruiting?</h2>
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          <Card className="border-2 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Traditional Recruiting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span><strong>$5,000-$8,000</strong> per hire (agency fees)</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>Passive candidates, minimal engagement</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>No direct interaction before hire</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>Generic talent pool</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>3-6 month hiring timeline</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-green-400 shadow-lg">
            <CardHeader>
              <CardTitle className="text-green-600">CMIS Sponsorship</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>$200-$1,000</strong> per hire (PetaByte tier)</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Motivated, pre-screened students</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Face-to-face interaction at events</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Top 10% of CS, Business & Engineering students</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>4-6 week hiring timeline</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-lg font-semibold text-green-700">
            💰 Average ROI: <span className="text-2xl">400%+</span> compared to traditional recruiting
          </p>
        </div>
      </section>

      {/* Smart Tech Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-4 text-center">🤖 Smart Notification System</h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Our AI-powered platform delivers qualified candidates directly to your inbox
        </p>
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Real-Time Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                <strong>Get notified instantly</strong> when students matching your criteria upload resumes or update profiles
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardHeader>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Custom Filtering</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                <strong>Filter by major, GPA, skills, graduation year</strong> - Only see candidates who match your requirements
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardHeader>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                <strong>Track engagement, views, and hires</strong> with detailed analytics showing your ROI in real-time
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Sponsorship Tiers */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-4 text-center">Choose Your Sponsorship Tier</h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          All tiers include our smart notification system. Higher tiers get priority access and real-time alerts.
        </p>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {/* TeraByte Sponsor */}
          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">TeraByte</div>
                <div className="text-2xl font-semibold mb-1">$1,000</div>
                <Badge variant="outline" className="text-xs">Entry Level</Badge>
              </div>
              <CardDescription className="text-center text-sm">
                Perfect for startups & small teams
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center mb-4">
                <p className="text-sm font-semibold text-blue-900">Expected Outcomes:</p>
                <p className="text-xs text-blue-700">2-3 hires per semester</p>
                <p className="text-xs text-blue-700">~50 qualified profiles</p>
              </div>
              
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>50+ student profiles</strong> delivered weekly</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Smart filtering</strong> by major, GPA & skills</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>3-week head start</strong> on case competitions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Exclusive dinner</strong> with 100+ students</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Logo placement</strong> (500+ views)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Weekly digest</strong> emails</span>
                </li>
              </ul>
              
              <div className="pt-4">
                <p className="text-xs text-center text-muted-foreground mb-3">
                  💰 ~$333/hire vs $5,000+ elsewhere
                </p>
                <Button className="w-full" variant="outline" size="sm">
                  Schedule a Call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* GigaByte Sponsor - NEW MID-TIER */}
          <Card className="border-2 border-green-500 hover:border-green-600 transition-colors relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Best Value
              </span>
            </div>
            <CardHeader>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-green-600 mb-2">GigaByte</div>
                <div className="text-2xl font-semibold mb-1">$2,500</div>
                <Badge variant="outline" className="text-xs bg-green-50">Growing Companies</Badge>
              </div>
              <CardDescription className="text-center text-sm">
                Most popular for mid-size teams
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-3 rounded-lg text-center mb-4">
                <p className="text-sm font-semibold text-green-900">Expected Outcomes:</p>
                <p className="text-xs text-green-700">3-5 hires per semester</p>
                <p className="text-xs text-green-700">~150 qualified profiles</p>
              </div>
              
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>All TeraByte benefits</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Priority notifications</strong> (batched every 4 hours)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Career fair booth</strong> (1 per semester)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Company spotlight</strong> in newsletter</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Advanced filtering</strong> (10+ criteria)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>2 speaking slots</strong> per year</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Analytics dashboard</strong></span>
                </li>
              </ul>
              
              <div className="pt-4">
                <p className="text-xs text-center text-muted-foreground mb-3">
                  💰 ~$500-$625/hire | Save $2,500+ vs recruiting fees
                </p>
                <Button className="w-full bg-green-600 hover:bg-green-700" size="sm">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* PetaByte Sponsor */}
          <Card className="border-2 border-blue-500 hover:border-blue-600 transition-colors relative shadow-lg">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Enterprise
              </span>
            </div>
            <CardHeader>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">PetaByte</div>
                <div className="text-2xl font-semibold mb-1">$4,500</div>
                <Badge variant="outline" className="text-xs bg-blue-50">Large Teams</Badge>
              </div>
              <CardDescription className="text-center text-sm">
                For companies seeking maximum visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center mb-4">
                <p className="text-sm font-semibold text-blue-900">Expected Outcomes:</p>
                <p className="text-xs text-blue-700">5-10 hires per semester</p>
                <p className="text-xs text-blue-700">~250 qualified profiles</p>
              </div>
              
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>All GigaByte benefits</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Real-time notifications</strong> during off-peak</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Premium booth</strong> at all career fairs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Featured sponsor</strong> in all marketing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Main conference</strong> speaking slot</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>VIP networking</strong> with top 50 students</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Detailed analytics</strong> & quarterly reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Bulk export</strong> capabilities</span>
                </li>
              </ul>
              
              <div className="pt-4">
                <p className="text-xs text-center text-muted-foreground mb-3">
                  💰 ~$450-$900/hire | ROI: 400%+
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                  Book a Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ExaByte Sponsor */}
          <Card className="border-2 border-yellow-500 hover:border-yellow-600 transition-colors relative bg-gradient-to-br from-yellow-50 to-orange-50">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Premium
              </span>
            </div>
            <CardHeader>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-yellow-600 mb-2">ExaByte</div>
                <div className="text-2xl font-semibold mb-1">$10,000+</div>
                <Badge variant="outline" className="text-xs bg-yellow-50">Elite Partnership</Badge>
              </div>
              <CardDescription className="text-center text-sm">
                Ultimate visibility & maximum impact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 p-3 rounded-lg text-center mb-4 border border-yellow-200">
                <p className="text-sm font-semibold text-yellow-900">Expected Outcomes:</p>
                <p className="text-xs text-yellow-700">10-15+ hires per semester</p>
                <p className="text-xs text-yellow-700">Unlimited qualified profiles</p>
                <p className="text-xs text-yellow-700 font-bold">Only 5 spots available</p>
              </div>
              
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>All PetaByte benefits</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>ALWAYS real-time</strong> notifications (no batching)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Title sponsorship</strong> of main event</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Dedicated case competition</strong> track</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Custom engagement</strong> opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Priority access</strong> to all events</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>API access</strong> for integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Dedicated account</strong> manager</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs"><strong>Unlimited</strong> everything</span>
                </li>
              </ul>
              
              <div className="pt-4">
                <p className="text-xs text-center text-muted-foreground mb-3">
                  💰 ~$666-$1,000/hire | Best ROI for high-volume hiring
                </p>
                <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white" size="sm">
                  Request Custom Proposal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">What Our Sponsors Say</h2>
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          <Card className="border-2 border-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm italic mb-4">
                "We hired 6 interns through CMIS last year. 4 became full-time hires. Best recruiting ROI we've ever had."
              </p>
              <p className="text-xs font-semibold">Sarah Chen</p>
              <p className="text-xs text-muted-foreground">VP of Recruiting, Microsoft</p>
              <Badge variant="outline" className="mt-2 text-xs">ExaByte Sponsor</Badge>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-green-100">
            <CardContent className="pt-6">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm italic mb-4">
                "$5K investment led to 2 senior hires. That's $10K in recruiting fees saved. The smart notification system is a game-changer."
              </p>
              <p className="text-xs font-semibold">Michael Rodriguez</p>
              <p className="text-xs text-muted-foreground">Talent Acquisition Lead, Deloitte</p>
              <Badge variant="outline" className="mt-2 text-xs">PetaByte Sponsor</Badge>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-purple-100">
            <CardContent className="pt-6">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm italic mb-4">
                "As a startup, TeraByte gave us access to talent we couldn't get elsewhere. We made our first hire in 3 weeks."
              </p>
              <p className="text-xs font-semibold">Alex Thompson</p>
              <p className="text-xs text-muted-foreground">CTO, DataFlow AI</p>
              <Badge variant="outline" className="mt-2 text-xs">TeraByte Sponsor</Badge>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">When do we get access to resumes?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Immediately upon sponsorship activation, plus ongoing updates throughout the semester. Premium sponsors get real-time alerts.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can we sponsor for one semester?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes! But annual sponsors get 20% discount and priority benefits. Most sponsors renew after seeing first-semester results.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's the average time-to-hire?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Most sponsors make their first hire within 4-6 weeks of sponsorship. Premium sponsors often hire within 2-3 weeks.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Do you offer payment plans?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes, we offer quarterly payment options for GigaByte, PetaByte, and ExaByte tiers at no additional cost.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What makes CMIS different?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our smart notification system, pre-vetted students, and direct engagement opportunities. Plus, we're 80% cheaper than traditional recruiting.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How do I know it will work for us?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                50+ companies renewed their sponsorship this year. 95% satisfaction rate. Schedule a call to see past sponsor results.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Urgency Banner */}
      <section className="mb-12">
        <Card className="border-2 border-orange-400 bg-gradient-to-r from-orange-50 to-red-50">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="h-6 w-6 text-orange-600" />
              <h3 className="text-2xl font-bold text-orange-900">Spring 2025 Recruiting Season</h3>
            </div>
            <p className="text-lg mb-4 text-orange-800">
              <strong>Early bird pricing ends December 31st</strong>
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm mb-6">
              <div>
                <p className="font-bold text-orange-900">5 ExaByte spots left</p>
                <p className="text-orange-700">Down from 10</p>
              </div>
              <div>
                <p className="font-bold text-orange-900">12 PetaByte spots left</p>
                <p className="text-orange-700">Filling fast</p>
              </div>
              <div>
                <p className="font-bold text-orange-900">18 GigaByte spots left</p>
                <p className="text-orange-700">Most popular tier</p>
              </div>
            </div>
            <p className="text-sm text-orange-700 italic">
              💡 Last year, all premium spots were filled by January 15th
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Enhanced CTA Section */}
      <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-12 shadow-xl">
        <h3 className="text-3xl font-bold mb-4">Ready to Hire Top Talent?</h3>
        <p className="text-xl mb-2 opacity-90">
          Join 50+ companies hiring the best students at Texas A&M
        </p>
        <p className="text-lg mb-8 opacity-80">
          Schedule a 15-minute call to see if CMIS is right for your team
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8">
            <Users className="mr-2 h-5 w-5" />
            Schedule a Call
          </Button>
          <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8">
            <FileText className="mr-2 h-5 w-5" />
            Download Sponsor Kit
          </Button>
        </div>
        <p className="text-sm mt-6 opacity-75">
          ✓ No commitment required  ✓ Custom packages available  ✓ Response within 24 hours
        </p>
      </section>
    </main>
  );
}


'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowRight, Users, FileText, UtensilsCrossed } from 'lucide-react';

export default function BeASponsorPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">Become a CMIS Sponsor</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Partner with CMIS to connect with top talent and make a lasting impact on student success
        </p>
      </div>

      {/* Perks Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Why Sponsor CMIS?</h2>
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Early Access to Case Competitions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Post your problem statements weeks ahead so students can prepare and deliver exceptional solutions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Full Resume Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get full access to all student resumes, not just a limited selection. Find the perfect candidates for your team
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <UtensilsCrossed className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Exclusive Sponsors Dinner</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Join our invite-only Sponsors & Leadership Dinner for networking and strategic discussions
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Sponsorship Tiers */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Choose Your Sponsorship Tier</h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {/* TeraByte Sponsor */}
          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-blue-600 mb-2">TeraByte</div>
                <div className="text-2xl font-semibold">$1,000</div>
              </div>
              <CardDescription className="text-center">
                Perfect for companies looking to establish a presence at CMIS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Early access to case competition problem statements</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Full access to all student resumes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Invitation to Sponsors & Leadership Dinner</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Logo placement on event materials</span>
                </li>
              </ul>
              <Button className="w-full mt-6" variant="outline">
                Select TeraByte
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* PetaByte Sponsor */}
          <Card className="border-2 border-blue-500 hover:border-blue-600 transition-colors relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Popular
              </span>
            </div>
            <CardHeader>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-blue-600 mb-2">PetaByte</div>
                <div className="text-2xl font-semibold">$5,000</div>
              </div>
              <CardDescription className="text-center">
                Ideal for companies seeking enhanced visibility and engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">All TeraByte benefits</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Premium booth placement at career fair</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Featured sponsor spot in marketing materials</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Speaking slot at main conference</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Exclusive networking session with top students</span>
                </li>
              </ul>
              <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                Select PetaByte
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* ExaByte Sponsor */}
          <Card className="border-2 border-yellow-500 hover:border-yellow-600 transition-colors">
            <CardHeader>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-yellow-600 mb-2">ExaByte</div>
                <div className="text-2xl font-semibold">$10,000+</div>
              </div>
              <CardDescription className="text-center">
                The ultimate partnership for maximum impact and recognition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">All PetaByte benefits</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Title sponsorship opportunity</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Dedicated case competition track</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Customized engagement opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Priority access to all CMIS events</span>
                </li>
              </ul>
              <Button className="w-full mt-6 bg-yellow-600 hover:bg-yellow-700 text-white">
                Select ExaByte
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-muted rounded-lg p-8">
        <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Contact us to learn more about sponsorship opportunities and how we can customize a package that works for your organization
        </p>
        <Button size="lg">
          Contact Us
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </section>
    </main>
  );
}


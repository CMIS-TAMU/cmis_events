'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Award,
  Bell,
  Filter,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Info,
  Save,
  Crown,
  Zap,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';

type NotificationFrequency = 'real-time' | 'batched' | 'daily' | 'weekly' | 'never';
type EventType = 'resume_upload' | 'new_student' | 'profile_update' | 'mission_submission' | 'event_registration' | 'mentor_request';

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  resume_upload: 'Resume Uploads',
  new_student: 'New Student Registrations',
  profile_update: 'Student Profile Updates',
  mission_submission: 'Mission Submissions',
  event_registration: 'Event Registrations',
  mentor_request: 'Mentorship Requests',
};

const FREQUENCY_OPTIONS: { value: NotificationFrequency; label: string }[] = [
  { value: 'real-time', label: 'Real-time (Instant)' },
  { value: 'batched', label: 'Batched (Every few hours)' },
  { value: 'daily', label: 'Daily Digest' },
  { value: 'weekly', label: 'Weekly Summary' },
  { value: 'never', label: 'Never' },
];

const MAJORS = [
  'Computer Science',
  'Engineering',
  'Business',
  'Data Science',
  'Information Systems',
  'Finance',
  'Marketing',
];

const SKILLS = [
  'Python',
  'JavaScript',
  'Java',
  'C++',
  'React',
  'Node.js',
  'SQL',
  'Machine Learning',
  'Data Analysis',
  'Cloud Computing',
];

const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Consulting',
  'Education',
  'Manufacturing',
  'Retail',
];

export default function SponsorPreferencesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [emailFrequency, setEmailFrequency] = useState<NotificationFrequency>('weekly');
  const [eventPreferences, setEventPreferences] = useState<Partial<Record<EventType, NotificationFrequency>>>({});
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [minGpa, setMinGpa] = useState<string>('');
  const [graduationYears, setGraduationYears] = useState<number[]>([]);
  const [unsubscribedEvents, setUnsubscribedEvents] = useState<EventType[]>([]);
  const [contactEmail, setContactEmail] = useState(true);
  const [contactPhone, setContactPhone] = useState(false);
  const [contactSms, setContactSms] = useState(false);

  // Queries
  const { data: tierData } = trpc.sponsors.getMyTier.useQuery();
  const { data: preferences, refetch: refetchPreferences } = trpc.sponsors.getMyPreferences.useQuery();
  const { data: stats } = trpc.sponsors.getMyEngagementStats.useQuery();

  // Mutation
  const updatePreferencesMutation = trpc.sponsors.updateMyPreferences.useMutation({
    onSuccess: () => {
      toast.success('Preferences saved successfully!');
      refetchPreferences();
      setSaving(false);
    },
    onError: (error) => {
      toast.error(`Failed to save preferences: ${error.message}`);
      setSaving(false);
    },
  });

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'sponsor') {
        router.push('/dashboard');
        return;
      }

      setUser(user);
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (preferences) {
      setEmailFrequency(preferences.email_frequency || 'weekly');
      setEventPreferences(preferences.notification_preferences || {});
      setSelectedMajors(preferences.student_filters?.majors || []);
      setSelectedSkills(preferences.student_filters?.skills || []);
      setSelectedIndustries(preferences.student_filters?.industries || []);
      setMinGpa(preferences.student_filters?.min_gpa?.toString() || '');
      setGraduationYears(preferences.student_filters?.graduation_years || []);
      setUnsubscribedEvents(preferences.unsubscribed_from || []);
      setContactEmail(preferences.contact_preferences?.email ?? true);
      setContactPhone(preferences.contact_preferences?.phone ?? false);
      setContactSms(preferences.contact_preferences?.sms ?? false);
    }
  }, [preferences]);

  const handleSave = async () => {
    setSaving(true);
    
    const updates = {
      email_frequency: emailFrequency,
      notification_preferences: eventPreferences,
      student_filters: {
        majors: selectedMajors.length > 0 ? selectedMajors : undefined,
        skills: selectedSkills.length > 0 ? selectedSkills : undefined,
        industries: selectedIndustries.length > 0 ? selectedIndustries : undefined,
        min_gpa: minGpa ? parseFloat(minGpa) : undefined,
        graduation_years: graduationYears.length > 0 ? graduationYears : undefined,
      },
      unsubscribed_from: unsubscribedEvents,
      contact_preferences: {
        email: contactEmail,
        phone: contactPhone,
        sms: contactSms,
      },
    };

    updatePreferencesMutation.mutate(updates);
  };

  const toggleMajor = (major: string) => {
    setSelectedMajors(prev =>
      prev.includes(major) ? prev.filter(m => m !== major) : [...prev, major]
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev =>
      prev.includes(industry) ? prev.filter(i => i !== industry) : [...prev, industry]
    );
  };

  const toggleYear = (year: number) => {
    setGraduationYears(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  const toggleEventType = (eventType: EventType) => {
    setUnsubscribedEvents(prev =>
      prev.includes(eventType) ? prev.filter(e => e !== eventType) : [...prev, eventType]
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const tier = tierData?.tier || 'basic';
  const config = tierData?.config;

  const getTierIcon = () => {
    switch (tier) {
      case 'premium':
        return <Crown className="h-5 w-5" />;
      case 'standard':
        return <Zap className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  const getTierColor = () => {
    switch (tier) {
      case 'premium':
        return 'text-purple-600 bg-purple-100 border-purple-300';
      case 'standard':
        return 'text-blue-600 bg-blue-100 border-blue-300';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/sponsor/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Notification Preferences</h1>
            <p className="text-muted-foreground">
              Customize how and when you receive notifications
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>

      {/* Current Tier */}
      <Card className={`mb-8 border-2 ${getTierColor()}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getTierIcon()}
              <div>
                <CardTitle className="capitalize">{tier} Tier</CardTitle>
                <CardDescription>
                  {tier === 'premium' && 'Premium features and real-time notifications'}
                  {tier === 'standard' && 'Enhanced features with flexible notifications'}
                  {tier === 'basic' && 'Essential features with weekly digests'}
                </CardDescription>
              </div>
            </div>
            <Badge className={getTierColor()}>
              {tier.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Your Benefits:</h4>
              <ul className="space-y-1 text-sm">
                {config?.features.immediateNotifications && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Real-time notifications
                  </li>
                )}
                {config?.features.customFilters && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Custom student filters
                  </li>
                )}
                {config?.features.detailedAnalytics && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Detailed analytics
                  </li>
                )}
                {config?.features.bulkExport && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Bulk export
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Usage Stats:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Notifications received:</span>
                  <span className="font-medium">{stats?.notifications_sent || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resumes viewed:</span>
                  <span className="font-medium">{stats?.resumes_viewed || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Students contacted:</span>
                  <span className="font-medium">{stats?.students_contacted || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global Notification Frequency */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Global Notification Frequency</CardTitle>
          </div>
          <CardDescription>
            Set your default frequency for all notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Default Frequency</Label>
              <Select value={emailFrequency} onValueChange={(v) => setEmailFrequency(v as NotificationFrequency)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map(option => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      disabled={!config?.features.immediateNotifications && option.value === 'real-time'}
                    >
                      {option.label}
                      {!config?.features.immediateNotifications && option.value === 'real-time' && (
                        <span className="text-xs text-muted-foreground ml-2">(Premium only)</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {tier !== 'premium' && (
                <p className="text-xs text-muted-foreground mt-2">
                  <Info className="h-3 w-3 inline mr-1" />
                  Upgrade to Premium for real-time notifications
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event-Specific Preferences */}
      {config?.notificationRules.canCustomizeByEventType && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Event-Specific Notifications</CardTitle>
            </div>
            <CardDescription>
              Customize notification frequency for each event type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map(eventType => (
                <div key={eventType} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={!unsubscribedEvents.includes(eventType)}
                      onCheckedChange={() => toggleEventType(eventType)}
                    />
                    <div>
                      <Label className="font-medium">{EVENT_TYPE_LABELS[eventType]}</Label>
                    </div>
                  </div>
                  {!unsubscribedEvents.includes(eventType) && (
                    <Select
                      value={eventPreferences[eventType] || emailFrequency}
                      onValueChange={(v) => setEventPreferences(prev => ({ ...prev, [eventType]: v as NotificationFrequency }))}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCY_OPTIONS.map(option => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            disabled={!config?.features.immediateNotifications && option.value === 'real-time'}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Filters */}
      {config?.features.customFilters && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Student Filters</CardTitle>
            </div>
            <CardDescription>
              Only receive notifications about students matching your criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Majors */}
            <div>
              <Label className="mb-3 block">Preferred Majors</Label>
              <div className="flex flex-wrap gap-2">
                {MAJORS.map(major => (
                  <Badge
                    key={major}
                    variant={selectedMajors.includes(major) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleMajor(major)}
                  >
                    {major}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Skills */}
            <div>
              <Label className="mb-3 block">Required Skills</Label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map(skill => (
                  <Badge
                    key={skill}
                    variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Industries */}
            <div>
              <Label className="mb-3 block">Preferred Industries</Label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map(industry => (
                  <Badge
                    key={industry}
                    variant={selectedIndustries.includes(industry) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleIndustry(industry)}
                  >
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* GPA & Graduation Years */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Minimum GPA</Label>
                <Input
                  type="number"
                  min="0"
                  max="4"
                  step="0.1"
                  placeholder="e.g., 3.0"
                  value={minGpa}
                  onChange={(e) => setMinGpa(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-2 block">Graduation Years</Label>
                <div className="flex flex-wrap gap-2">
                  {[2024, 2025, 2026, 2027, 2028].map(year => (
                    <Badge
                      key={year}
                      variant={graduationYears.includes(year) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleYear(year)}
                    >
                      {year}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Preferences */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Contact Preferences</CardTitle>
          </div>
          <CardDescription>
            Choose how we can contact you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <Label>Email Notifications</Label>
            </div>
            <Switch
              checked={contactEmail}
              onCheckedChange={setContactEmail}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <Label>Phone Notifications</Label>
            </div>
            <Switch
              checked={contactPhone}
              onCheckedChange={setContactPhone}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <Label>SMS Notifications</Label>
            </div>
            <Switch
              checked={contactSms}
              onCheckedChange={setContactSms}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save All Preferences'}
        </Button>
      </div>
    </div>
  );
}


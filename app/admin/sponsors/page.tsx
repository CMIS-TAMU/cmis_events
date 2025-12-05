'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Mail,
  Eye,
  Download,
  Filter,
  Search,
  Award,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

type SponsorTier = 'basic' | 'standard' | 'premium';

export default function AdminSponsorsPage() {
  const [tierFilter, setTierFilter] = useState<'all' | SponsorTier>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSponsors, setSelectedSponsors] = useState<string[]>([]);
  const [bulkUpdateDialogOpen, setBulkUpdateDialogOpen] = useState(false);
  const [bulkTier, setBulkTier] = useState<SponsorTier>('basic');
  const [bulkReason, setBulkReason] = useState('');

  // Queries
  const { data: tierStats, isLoading: tierStatsLoading } = trpc.sponsors.getTierStats.useQuery();
  const { data: sponsorsData, isLoading: sponsorsLoading, refetch: refetchSponsors } = trpc.sponsors.getAllSponsors.useQuery({
    tier: tierFilter,
    search: searchQuery || undefined,
    limit: 50,
    offset: 0,
  });
  const { data: analytics } = trpc.sponsors.getEngagementAnalytics.useQuery({
    tier: tierFilter,
    days: 30,
  });

  // Mutations
  const updateTierMutation = trpc.sponsors.updateSponsorTier.useMutation({
    onSuccess: () => {
      refetchSponsors();
    },
  });

  const bulkUpdateMutation = trpc.sponsors.bulkUpdateTiers.useMutation({
    onSuccess: () => {
      refetchSponsors();
      setBulkUpdateDialogOpen(false);
      setSelectedSponsors([]);
      setBulkReason('');
    },
  });

  const handleTierChange = async (sponsorId: string, newTier: SponsorTier) => {
    await updateTierMutation.mutateAsync({
      sponsorId,
      tier: newTier,
      reason: 'Updated by admin',
    });
  };

  const handleBulkUpdate = () => {
    bulkUpdateMutation.mutate({
      sponsorIds: selectedSponsors,
      tier: bulkTier,
      reason: bulkReason || 'Bulk tier update',
    });
  };

  const toggleSponsorSelection = (sponsorId: string) => {
    setSelectedSponsors(prev =>
      prev.includes(sponsorId)
        ? prev.filter(id => id !== sponsorId)
        : [...prev, sponsorId]
    );
  };

  const selectAll = () => {
    if (sponsorsData?.sponsors) {
      setSelectedSponsors(sponsorsData.sponsors.map(s => s.id));
    }
  };

  const deselectAll = () => {
    setSelectedSponsors([]);
  };

  if (tierStatsLoading || sponsorsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading sponsor management...</p>
        </div>
      </div>
    );
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'standard':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'basic':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Sponsor Management</h1>
            <p className="text-muted-foreground">
              Manage sponsor tiers and monitor engagement
            </p>
          </div>
          {selectedSponsors.length > 0 && (
            <Dialog open={bulkUpdateDialogOpen} onOpenChange={setBulkUpdateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Award className="h-4 w-4 mr-2" />
                  Bulk Update ({selectedSponsors.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Update Sponsor Tiers</DialogTitle>
                  <DialogDescription>
                    Update tier for {selectedSponsors.length} selected sponsor(s)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>New Tier</Label>
                    <Select value={bulkTier} onValueChange={(v) => setBulkTier(v as SponsorTier)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Reason (Optional)</Label>
                    <Input
                      placeholder="Enter reason for tier change..."
                      value={bulkReason}
                      onChange={(e) => setBulkReason(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setBulkUpdateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBulkUpdate} disabled={bulkUpdateMutation.isPending}>
                    {bulkUpdateMutation.isPending ? 'Updating...' : 'Update Tiers'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Tier Statistics */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Sponsors</p>
                <p className="text-2xl font-bold">{tierStats?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Premium</p>
                <p className="text-2xl font-bold">{tierStats?.premium || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Standard</p>
                <p className="text-2xl font-bold">{tierStats?.standard || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-gray-600" />
              <div>
                <p className="text-sm text-muted-foreground">Basic</p>
                <p className="text-2xl font-bold">{tierStats?.basic || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Analytics */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Notifications Sent (30d)</p>
                  <p className="text-2xl font-bold">{analytics.totalNotifications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Eye className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Resumes Viewed (30d)</p>
                  <p className="text-2xl font-bold">{analytics.totalResumesViewed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Engagement</p>
                  <p className="text-2xl font-bold">{analytics.avgEngagementRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label className="mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label className="mb-2 block">Tier Filter</Label>
              <Select value={tierFilter} onValueChange={(v) => setTierFilter(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sponsors Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Sponsors</CardTitle>
              <CardDescription>
                Showing {sponsorsData?.sponsors.length || 0} of {sponsorsData?.total || 0} sponsors
              </CardDescription>
            </div>
            {sponsorsData && sponsorsData.sponsors.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                {selectedSponsors.length > 0 && (
                  <Button variant="outline" size="sm" onClick={deselectAll}>
                    Deselect All
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!sponsorsData || sponsorsData.sponsors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No sponsors found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium w-12">
                      <Checkbox
                        checked={selectedSponsors.length === sponsorsData.sponsors.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            selectAll();
                          } else {
                            deselectAll();
                          }
                        }}
                      />
                    </th>
                    <th className="text-left p-3 text-sm font-medium">Sponsor</th>
                    <th className="text-left p-3 text-sm font-medium">Email</th>
                    <th className="text-left p-3 text-sm font-medium">Current Tier</th>
                    <th className="text-left p-3 text-sm font-medium">Notifications</th>
                    <th className="text-left p-3 text-sm font-medium">Resumes Viewed</th>
                    <th className="text-left p-3 text-sm font-medium">Member Since</th>
                    <th className="text-left p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sponsorsData.sponsors.map((sponsor) => (
                    <tr key={sponsor.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedSponsors.includes(sponsor.id)}
                          onCheckedChange={() => toggleSponsorSelection(sponsor.id)}
                        />
                      </td>
                      <td className="p-3">
                        <p className="font-medium">{sponsor.full_name || 'N/A'}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm text-muted-foreground">{sponsor.email}</p>
                      </td>
                      <td className="p-3">
                        <Select
                          value={sponsor.sponsor_tier || 'basic'}
                          onValueChange={(v) => handleTierChange(sponsor.id, v as SponsorTier)}
                          disabled={updateTierMutation.isPending}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                Basic
                              </span>
                            </SelectItem>
                            <SelectItem value="standard">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                Standard
                              </span>
                            </SelectItem>
                            <SelectItem value="premium">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                Premium
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{sponsor.stats?.notifications_sent || 0}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{sponsor.stats?.resumes_viewed || 0}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(sponsor.created_at), 'MMM d, yyyy')}
                        </p>
                      </td>
                      <td className="p-3">
                        <Link href={`/admin/sponsors/${sponsor.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tier Comparison */}
      {analytics && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Tier Performance Comparison</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {['premium', 'standard', 'basic'].map((tier) => {
                const tierData = analytics.byTier[tier];
                return (
                  <div key={tier} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={getTierBadgeColor(tier)}>
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {tierData?.count || 0} sponsors
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Notifications:</span>
                        <span className="font-medium">{tierData?.notifications || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Opens:</span>
                        <span className="font-medium">{tierData?.opens || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Clicks:</span>
                        <span className="font-medium">{tierData?.clicks || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span className="text-muted-foreground">Engagement:</span>
                        <span className="font-bold">{tierData?.engagementRate?.toFixed(1) || 0}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}



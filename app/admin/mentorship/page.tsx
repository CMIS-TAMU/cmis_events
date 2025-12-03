'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Users, AlertTriangle, CheckCircle2, TrendingUp, UserPlus, BarChart3, Filter } from 'lucide-react';
import { useState } from 'react';

export default function AdminMentorshipPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    student_id: '',
    mentor_id: '',
    match_score: '',
    admin_notes: '',
  });

  const { data: stats, isLoading: statsLoading } = trpc.mentorship.getDashboardStats.useQuery({
    days: 30,
  });

  const { data: allMatches, isLoading: matchesLoading, refetch: refetchMatches } = trpc.mentorship.getAllMatches.useQuery(
    { status: statusFilter !== 'all' ? statusFilter as any : undefined },
    { enabled: true }
  );

  const { data: atRiskMatches } = trpc.mentorship.getAtRiskMatches.useQuery();

  const createMatch = trpc.mentorship.createManualMatch.useMutation({
    onSuccess: () => {
      refetchMatches();
      setIsCreateDialogOpen(false);
      setCreateFormData({
        student_id: '',
        mentor_id: '',
        match_score: '',
        admin_notes: '',
      });
    },
  });

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    createMatch.mutate({
      student_id: createFormData.student_id,
      mentor_id: createFormData.mentor_id,
      match_score: createFormData.match_score ? parseFloat(createFormData.match_score) : undefined,
      admin_notes: createFormData.admin_notes || undefined,
    });
  };

  if (statsLoading || matchesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Mentorship Dashboard</h1>
            <p className="text-muted-foreground">
              Manage and monitor all mentorship matches
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Manual Match
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Manual Match</DialogTitle>
                <DialogDescription>
                  Manually create a mentorship match between a student and mentor
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateMatch} className="space-y-4">
                <div>
                  <Label htmlFor="student_id">Student ID (UUID) *</Label>
                  <Input
                    id="student_id"
                    placeholder="Enter student UUID"
                    value={createFormData.student_id}
                    onChange={(e) => setCreateFormData({ ...createFormData, student_id: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mentor_id">Mentor ID (UUID) *</Label>
                  <Input
                    id="mentor_id"
                    placeholder="Enter mentor UUID"
                    value={createFormData.mentor_id}
                    onChange={(e) => setCreateFormData({ ...createFormData, mentor_id: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="match_score">Match Score (Optional)</Label>
                  <Input
                    id="match_score"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0-100"
                    value={createFormData.match_score}
                    onChange={(e) => setCreateFormData({ ...createFormData, match_score: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="admin_notes">Admin Notes (Optional)</Label>
                  <textarea
                    id="admin_notes"
                    className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background"
                    placeholder="Add any notes about this match..."
                    value={createFormData.admin_notes}
                    onChange={(e) => setCreateFormData({ ...createFormData, admin_notes: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMatch.isPending}>
                    {createMatch.isPending ? 'Creating...' : 'Create Match'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Matches</p>
                <p className="text-2xl font-bold">{stats?.total_matches || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Matches</p>
                <p className="text-2xl font-bold">{stats?.active_matches || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">At-Risk Matches</p>
                <p className="text-2xl font-bold">{stats?.at_risk_matches || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Match Score</p>
                <p className="text-2xl font-bold">{stats?.average_match_score || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Batches</p>
                <p className="text-2xl font-bold">{stats?.pending_batches || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Unmatched Students</p>
                <p className="text-2xl font-bold">{stats?.unmatched_students || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Recent (30 days)</p>
                <p className="text-2xl font-bold">{stats?.recent_matches || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* At-Risk Matches */}
      {atRiskMatches && atRiskMatches.length > 0 && (
        <Card className="mb-8 border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              At-Risk Matches ({atRiskMatches.length})
            </CardTitle>
            <CardDescription>
              Matches that need attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {atRiskMatches.slice(0, 5).map((match: any) => (
                <div key={match.id} className="p-3 border rounded-lg bg-yellow-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {match.student?.full_name || match.student?.email} ↔ {match.mentor?.full_name || match.mentor?.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {match.at_risk_reason || 'Match health concern'}
                      </p>
                    </div>
                    <Link href={`/mentorship/match/${match.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
              {atRiskMatches.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  + {atRiskMatches.length - 5} more at-risk matches
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Matches Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Matches</CardTitle>
              <CardDescription>
                View and manage all mentorship matches
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                className="h-10 px-3 rounded-md border border-input bg-background"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="dissolved">Dissolved</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!allMatches || allMatches.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No matches found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium">Student</th>
                    <th className="text-left p-3 text-sm font-medium">Mentor</th>
                    <th className="text-left p-3 text-sm font-medium">Score</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium">Matched</th>
                    <th className="text-left p-3 text-sm font-medium">Health</th>
                    <th className="text-left p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allMatches.map((match: any) => (
                    <tr key={match.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <p className="font-medium">{match.student?.full_name || match.student?.email || 'N/A'}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-medium">{match.mentor?.full_name || match.mentor?.email || 'N/A'}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{match.match_score || 'N/A'}/100</p>
                      </td>
                      <td className="p-3">
                        <Badge variant={match.status === 'active' ? 'default' : 'secondary'}>
                          {match.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(match.matched_at), 'MMM d, yyyy')}
                        </p>
                      </td>
                      <td className="p-3">
                        {match.is_at_risk ? (
                          <Badge variant="destructive">At Risk</Badge>
                        ) : match.health_score !== null ? (
                          <Badge variant="outline">{match.health_score}/5</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Link href={`/mentorship/match/${match.id}`}>
                          <Button variant="outline" size="sm">View</Button>
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
    </div>
  );
}


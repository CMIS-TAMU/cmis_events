'use client';

import { toastUtil } from '@/lib/utils/toast';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Search, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function TeamRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const { data: competition, isLoading } = trpc.competitions.getById.useQuery(
    { id: competitionId },
    { enabled: !!competitionId }
  );
  const { data: existingTeams } = trpc.competitions.getTeams.useQuery(
    { competition_id: competitionId },
    { enabled: !!competitionId }
  );

  const createTeamMutation = trpc.competitions.createTeam.useMutation({
    onSuccess: () => {
      router.push(`/competitions/${competitionId}`);
    },
  });

  useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        setMembers([authUser.id]);
      }
    }
    getUser();
  }, []);

  const { refetch: searchUsers } = trpc.auth.searchUsers.useQuery(
    {
      query: searchQuery,
      limit: 10,
    },
    {
      enabled: false, // Don't run automatically
    }
  );

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data: results } = await searchUsers();
      if (results) {
        // Filter out current user and already added members
        const filtered = results.filter(
          (u: any) => u.id !== user?.id && !members.includes(u.id)
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = (userId: string, userName: string) => {
    if (members.length >= (competition?.max_team_size || 4)) {
      toastUtil.warning(
        'Team size limit reached',
        `Maximum team size is ${competition?.max_team_size || 4} members.`
      );
      return;
    }
    if (!members.includes(userId)) {
      setMembers([...members, userId]);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleRemoveMember = (userId: string) => {
    if (userId === user?.id) {
      toastUtil.warning('Cannot remove yourself', 'You cannot remove yourself from the team.');
      return;
    }
    setMembers(members.filter((id) => id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) {
      toastUtil.warning('Team name required', 'Please enter a team name before submitting.');
      return;
    }

    if (members.length < (competition?.min_team_size || 2)) {
      toastUtil.warning(
        'Team size too small',
        `Team must have at least ${competition?.min_team_size || 2} members.`
      );
      return;
    }

    if (members.length > (competition?.max_team_size || 4)) {
      toastUtil.warning(
        'Team size too large',
        `Team can have at most ${competition?.max_team_size || 4} members.`
      );
      return;
    }

    try {
      await createTeamMutation.mutateAsync({
        competition_id: competitionId,
        name: teamName,
        members,
      });
      toastUtil.success('Team created successfully!', 'Your team has been registered for the competition.');
    } catch (error: any) {
      toastUtil.error('Failed to create team', error.message || 'Please try again.');
    }
  };

  if (isLoading || !competition) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const minTeamSize = competition.min_team_size || 2;
  const maxTeamSize = competition.max_team_size || 4;
  const canAddMore = members.length < maxTeamSize;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href={`/competitions/${competitionId}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Competition
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Register Your Team</CardTitle>
          <CardDescription>
            Form a team to participate in {competition.title}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {createTeamMutation.error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{createTeamMutation.error.message}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name *</Label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g., Team Alpha"
                required
                disabled={createTeamMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label>Team Members ({members.length}/{maxTeamSize})</Label>
              <p className="text-sm text-muted-foreground">
                Minimum: {minTeamSize} members, Maximum: {maxTeamSize} members
              </p>

              {/* Current Members */}
              <div className="space-y-2">
                {members.map((memberId) => {
                  // Get member info (simplified - you might want to fetch user details)
                  const isCurrentUser = memberId === user?.id;
                  return (
                    <div
                      key={memberId}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {isCurrentUser ? 'You' : memberId.slice(0, 8) + '...'}
                          {isCurrentUser && (
                            <Badge variant="outline" className="ml-2">Leader</Badge>
                          )}
                        </span>
                      </div>
                      {!isCurrentUser && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(memberId)}
                          disabled={createTeamMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Members Search */}
              {canAddMore && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search by email or name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearchUsers();
                        }
                      }}
                      disabled={createTeamMutation.isPending}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSearchUsers}
                      disabled={searching || createTeamMutation.isPending}
                    >
                      {searching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                      {searchResults.map((userResult: any) => (
                        <button
                          key={userResult.id}
                          type="button"
                          onClick={() => handleAddMember(userResult.id, userResult.full_name || userResult.email)}
                          className="w-full p-3 text-left hover:bg-muted transition-colors"
                        >
                          <div className="font-medium">{userResult.full_name || 'No name'}</div>
                          <div className="text-sm text-muted-foreground">{userResult.email}</div>
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={createTeamMutation.isPending || members.length < minTeamSize}
                className="flex-1"
              >
                {createTeamMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Team...
                  </>
                ) : (
                  'Register Team'
                )}
              </Button>
              <Link href={`/competitions/${competitionId}`}>
                <Button type="button" variant="outline" disabled={createTeamMutation.isPending}>
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}


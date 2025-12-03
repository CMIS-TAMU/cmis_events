'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MessageSquare, Search, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function MentorQuestionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    }
    getUser();
  }, []);

  const { data: openQuestions, isLoading, refetch } = trpc.mentorship.getOpenQuestions.useQuery(
    { tags: selectedTags.length > 0 ? selectedTags : undefined },
    { enabled: !!user }
  );

  const claimQuestion = trpc.mentorship.claimQuestion.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleClaim = (questionId: string) => {
    if (confirm('Are you sure you want to claim this question? You will be responsible for answering it.')) {
      claimQuestion.mutate({ question_id: questionId });
    }
  };

  // Filter questions by search query
  const filteredQuestions = openQuestions?.filter((q: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.title.toLowerCase().includes(query) ||
      q.description.toLowerCase().includes(query) ||
      (q.tags && q.tags.some((tag: string) => tag.toLowerCase().includes(query)))
    );
  }) || [];

  // Get all unique tags from questions
  const allTags = Array.from(
    new Set(
      openQuestions?.flatMap((q: any) => q.tags || []) || []
    )
  ) as string[];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/mentorship/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <div>
          <h1 className="text-4xl font-bold mb-2">Question Marketplace</h1>
          <p className="text-muted-foreground">
            Browse and claim questions from students to help them
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {allTags.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Filter by Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {selectedTags.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTags([])}
                      className="h-6"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Open Questions</p>
                <p className="text-2xl font-bold">{openQuestions?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Urgent (24h)</p>
                <p className="text-2xl font-bold">
                  {openQuestions?.filter((q: any) => q.preferred_response_time === '24-hours').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Available Now</p>
                <p className="text-2xl font-bold">{filteredQuestions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      {!openQuestions || openQuestions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No Open Questions</CardTitle>
            <CardDescription>
              There are no open questions at the moment. Check back later!
            </CardDescription>
          </CardContent>
        </Card>
      ) : filteredQuestions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No Questions Match Your Search</CardTitle>
            <CardDescription>
              Try adjusting your search query or filters.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question: any) => {
            const createdDate = new Date(question.created_at);
            const expiresDate = new Date(question.expires_at);
            const isUrgent = question.preferred_response_time === '24-hours';
            const hoursUntilExpiry = Math.floor((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60));

            return (
              <Card key={question.id} className={isUrgent ? 'border-yellow-500' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{question.title}</CardTitle>
                        {isUrgent && <Badge variant="destructive">Urgent</Badge>}
                        <Badge variant="outline">
                          {question.preferred_response_time === '24-hours' && '24h'}
                          {question.preferred_response_time === '48-hours' && '48h'}
                          {question.preferred_response_time === '1-week' && '1 week'}
                        </Badge>
                      </div>
                      <CardDescription>
                        Posted by {question.student?.full_name || question.student?.email || 'Student'} • 
                        {' '}{format(createdDate, 'MMM d, yyyy')}
                        {hoursUntilExpiry > 0 && hoursUntilExpiry < 24 && (
                          <span className="text-yellow-600 ml-2">
                            • Expires in {hoursUntilExpiry}h
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {question.description}
                  </p>
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {question.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={() => handleClaim(question.id)}
                      disabled={claimQuestion.isPending}
                      variant="default"
                    >
                      {claimQuestion.isPending ? 'Claiming...' : 'Claim Question'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}


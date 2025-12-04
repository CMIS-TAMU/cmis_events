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
import { ArrowLeft, MessageSquare, Plus, Clock, CheckCircle2, AlertCircle, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function QuickQuestionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    preferred_response_time: '48-hours' as '24-hours' | '48-hours' | '1-week',
    tagInput: '',
  });

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    }
    getUser();
  }, []);

  const { data: questions, isLoading, refetch } = trpc.mentorship.getMyQuestions.useQuery(
    undefined,
    { enabled: !!user }
  );

  const postQuestion = trpc.mentorship.postQuestion.useMutation({
    onSuccess: () => {
      refetch();
      setIsDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        tags: [],
        preferred_response_time: '48-hours',
        tagInput: '',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    postQuestion.mutate({
      title: formData.title,
      description: formData.description,
      tags: formData.tags,
      preferred_response_time: formData.preferred_response_time,
    });
  };

  const addTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: '',
      });
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="default">Open</Badge>;
      case 'claimed':
        return <Badge variant="secondary">Claimed</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Quick Questions</h1>
            <p className="text-muted-foreground">
              Ask mentors quick questions and get fast responses
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ask a Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ask a Quick Question</DialogTitle>
                <DialogDescription>
                  Post a question for mentors to answer. Mentors can claim and respond to your question.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Question Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., How to prepare for technical interviews?"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    minLength={5}
                    maxLength={200}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    className="w-full min-h-[150px] px-3 py-2 rounded-md border border-input bg-background"
                    placeholder="Provide details about your question..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    minLength={10}
                    maxLength={2000}
                  />
                </div>
                <div>
                  <Label htmlFor="preferred_response_time">Preferred Response Time *</Label>
                  <select
                    id="preferred_response_time"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.preferred_response_time}
                    onChange={(e) => setFormData({ ...formData, preferred_response_time: e.target.value as any })}
                    required
                  >
                    <option value="24-hours">24 Hours</option>
                    <option value="48-hours">48 Hours</option>
                    <option value="1-week">1 Week</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="tags"
                      placeholder="Add a tag (e.g., career, technical, interview)"
                      value={formData.tagInput}
                      onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      Add
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={postQuestion.isPending}>
                    {postQuestion.isPending ? 'Posting...' : 'Post Question'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold">{questions?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold">
                  {questions?.filter((q: any) => q.status === 'open').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Claimed</p>
                <p className="text-2xl font-bold">
                  {questions?.filter((q: any) => q.status === 'claimed').length || 0}
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
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {questions?.filter((q: any) => q.status === 'completed').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      {!questions || questions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No Questions Yet</CardTitle>
            <CardDescription className="mb-4">
              Start getting help from mentors by asking your first question.
            </CardDescription>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ask Your First Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question: any) => {
            const createdDate = new Date(question.created_at);
            const expiresDate = new Date(question.expires_at);
            const isExpired = expiresDate < new Date() && question.status === 'open';

            return (
              <Card key={question.id} className={isExpired ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{question.title}</CardTitle>
                        {getStatusBadge(question.status)}
                        {isExpired && <Badge variant="destructive">Expired</Badge>}
                      </div>
                      <CardDescription>
                        Posted {format(createdDate, 'MMM d, yyyy')} • 
                        {question.preferred_response_time === '24-hours' && ' Response needed within 24 hours'}
                        {question.preferred_response_time === '48-hours' && ' Response needed within 48 hours'}
                        {question.preferred_response_time === '1-week' && ' Response needed within 1 week'}
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
                  {question.claimed_by_mentor_id && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Claimed by a mentor</span>
                      {question.claimed_at && (
                        <span>• {format(new Date(question.claimed_at), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                  )}
                  {question.completed_at && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Completed on {format(new Date(question.completed_at), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}


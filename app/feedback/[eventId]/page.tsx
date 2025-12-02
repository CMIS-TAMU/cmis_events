'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Star, Send, CheckCircle, MessageSquare, Loader2 } from 'lucide-react';

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: event } = trpc.events.getById.useQuery({ id: eventId }, { enabled: !!eventId });
  const { data: hasSubmitted } = trpc.feedback.hasSubmitted.useQuery(
    { event_id: eventId },
    { enabled: !!user && !!eventId }
  );

  const submitMutation = trpc.feedback.submit.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push(`/login?redirect=/feedback/${eventId}`);
        return;
      }
      setUser(authUser);
      setLoading(false);
    }
    getUser();
  }, [eventId, router]);

  useEffect(() => {
    if (hasSubmitted?.submitted) {
      setSubmitted(true);
    }
  }, [hasSubmitted]);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    await submitMutation.mutateAsync({
      event_id: eventId,
      rating,
      comment: comment || undefined,
      anonymous,
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardContent className="pt-12 pb-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              Your feedback has been submitted successfully.
            </p>
            <div className="space-y-3">
              <Link href={`/events/${eventId}`}>
                <Button variant="outline" className="w-full">
                  Back to Event
                </Button>
              </Link>
              <Link href="/events">
                <Button className="w-full">
                  Browse More Events
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href={`/events/${eventId}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Event
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Event Feedback
          </CardTitle>
          <CardDescription>
            {event ? `Share your experience at "${event.title}"` : 'Share your experience'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {submitMutation.error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{submitMutation.error.message}</p>
            </div>
          )}

          {/* Rating */}
          <div className="space-y-3">
            <Label className="text-lg">How would you rate this event? *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-2 rounded-lg transition-all hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      value <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating === 0 && 'Select a rating'}
              {rating === 1 && 'Poor - Did not meet expectations'}
              {rating === 2 && 'Fair - Below average'}
              {rating === 3 && 'Good - Met expectations'}
              {rating === 4 && 'Very Good - Above average'}
              {rating === 5 && 'Excellent - Exceeded expectations'}
            </p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Additional Comments (Optional)</Label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts, suggestions, or what you enjoyed most..."
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="anonymous"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="anonymous" className="cursor-pointer">
              Submit anonymously
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitMutation.isPending}
            className="w-full"
            size="lg"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


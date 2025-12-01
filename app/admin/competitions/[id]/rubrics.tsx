'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Loader2 } from 'lucide-react';

interface RubricsTabProps {
  competitionId: string;
}

export function RubricsTab({ competitionId }: RubricsTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    criterion: '',
    description: '',
    max_score: 10,
    weight: 1.0,
    order_index: 0,
  });

  const { data: rubrics, isLoading, refetch } = trpc.competitions.getRubrics.useQuery({
    competition_id: competitionId,
  });
  const createRubricMutation = trpc.competitions.createRubric.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setFormData({
        criterion: '',
        description: '',
        max_score: 10,
        weight: 1.0,
        order_index: 0,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRubricMutation.mutateAsync({
        competition_id: competitionId,
        ...formData,
      });
    } catch (error: any) {
      alert(error.message || 'Failed to create rubric');
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Loading rubrics...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Judging Rubrics</h3>
          <p className="text-sm text-muted-foreground">
            Define the criteria for evaluating team submissions
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'outline' : 'default'}
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Rubric'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Rubric</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="criterion">Criterion *</Label>
                <Input
                  id="criterion"
                  value={formData.criterion}
                  onChange={(e) => setFormData({ ...formData, criterion: e.target.value })}
                  placeholder="e.g., Problem Analysis"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Detailed description of this criterion..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="max_score">Max Score</Label>
                  <Input
                    id="max_score"
                    type="number"
                    min="1"
                    value={formData.max_score}
                    onChange={(e) =>
                      setFormData({ ...formData, max_score: parseInt(e.target.value) || 10 })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: parseFloat(e.target.value) || 1.0 })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">Multiplier for score</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order_index">Order</Label>
                  <Input
                    id="order_index"
                    type="number"
                    value={formData.order_index}
                    onChange={(e) =>
                      setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createRubricMutation.isPending}
                >
                  {createRubricMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Rubric'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      {rubrics && rubrics.length > 0 ? (
        <div className="space-y-4">
          {rubrics.map((rubric: any) => (
            <Card key={rubric.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{rubric.criterion}</h4>
                    {rubric.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {rubric.description}
                      </p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Max Score: {rubric.max_score}</span>
                      <span>Weight: {rubric.weight}</span>
                      <span>Order: {rubric.order_index}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              No rubrics defined yet. Add your first rubric to start judging.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


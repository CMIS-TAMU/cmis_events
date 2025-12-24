'use client';

import { useState } from 'react';
import { Search, Sparkles, Brain, TrendingUp, Code2, Zap, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc/trpc';

interface SearchResult {
  contentId: string;
  similarity: number;
  textContent: string;
  metadata: Record<string, unknown>;
  contentType: string;
}

export default function SemanticSearchDemo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<'semantic' | 'keyword'>('semantic');

  // Get events for keyword comparison
  const { data: allEvents } = trpc.events.getAll.useQuery({
    limit: 100,
  });

  const handleSemanticSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Try public endpoint first (for demo), fallback to authenticated endpoint
      let response = await fetch('/api/embeddings/search-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          contentType: 'event', // Search events
          threshold: 0.5, // Lower threshold for demo
          limit: 10,
        }),
      });

      // If public endpoint fails, try authenticated endpoint
      if (!response.ok && response.status === 404) {
        response = await fetch('/api/embeddings/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: searchQuery,
            contentType: 'event',
            threshold: 0.5,
            limit: 10,
          }),
          credentials: 'include',
        });

        if (response.status === 401) {
          alert('Please log in to use semantic search. This feature requires authentication.');
          setIsSearching(false);
          return;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
      setSearchType('semantic');
    } catch (error) {
      console.error('Semantic search error:', error);
      setResults([]);
      // Show user-friendly error message
      if (error instanceof Error && !error.message.includes('log in')) {
        alert(`Search failed: ${error.message}`);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeywordSearch = () => {
    if (!searchQuery.trim() || !allEvents) {
      setResults([]);
      return;
    }

    const queryLower = searchQuery.toLowerCase();
    const keywordResults = allEvents
      .filter((event) => {
        const title = event.title?.toLowerCase() || '';
        const description = event.description?.toLowerCase() || '';
        return title.includes(queryLower) || description.includes(queryLower);
      })
      .slice(0, 10)
      .map((event, index) => ({
        contentId: event.id,
        similarity: 1 - (index * 0.05), // Fake similarity for comparison
        textContent: `${event.title}\n\n${event.description || ''}`,
        metadata: {
          title: event.title,
          startsAt: event.starts_at,
          location: event.location,
        },
        contentType: 'event',
      }));

    setResults(keywordResults);
    setSearchType('keyword');
  };

  const handleSearch = () => {
    if (searchType === 'semantic') {
      handleSemanticSearch();
    } else {
      handleKeywordSearch();
    }
  };

  const exampleQueries = [
    { text: 'AI and machine learning workshops', icon: Brain },
    { text: 'Networking events for students', icon: TrendingUp },
    { text: 'Technical career development', icon: Code2 },
    { text: 'Professional skills training', icon: BookOpen },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="h-10 w-10 text-purple-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Semantic Search Demo
          </h1>
          <Zap className="h-10 w-10 text-blue-600" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience AI-powered semantic search that understands meaning, not just keywords.
          Search for events using natural language and discover relevant content based on concepts.
        </p>
      </div>

      {/* Search Type Toggle */}
      <div className="flex justify-center mb-6">
        <Tabs value={searchType} onValueChange={(v) => setSearchType(v as 'semantic' | 'keyword')} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="semantic" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Semantic Search
            </TabsTrigger>
            <TabsTrigger value="keyword" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Keyword Search
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Search Bar */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Events</CardTitle>
          <CardDescription>
            {searchType === 'semantic'
              ? 'Try natural language queries - the AI understands context and meaning'
              : 'Traditional keyword matching - only finds exact word matches'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder={
                searchType === 'semantic'
                  ? 'e.g., "workshops about artificial intelligence" or "events for career development"'
                  : 'e.g., "AI" or "workshop"'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Example Queries */}
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Try these example queries:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, index) => {
                const Icon = example.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(example.text);
                      setTimeout(() => {
                        if (searchType === 'semantic') handleSemanticSearch();
                        else handleKeywordSearch();
                      }, 100);
                    }}
                    className="text-xs"
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {example.text}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="mb-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            How Semantic Search Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Code2 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">1. Vector Embeddings</h3>
              <p className="text-sm text-muted-foreground">
                Text is converted into high-dimensional vectors that capture semantic meaning
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">2. Cosine Similarity</h3>
              <p className="text-sm text-muted-foreground">
                Similarity is calculated using cosine distance between query and content vectors
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">3. Ranking</h3>
              <p className="text-sm text-muted-foreground">
                Results are ranked by relevance score and returned in order of similarity
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Search Results ({results.length})
            </h2>
            <Badge variant={searchType === 'semantic' ? 'default' : 'secondary'}>
              {searchType === 'semantic' ? 'Semantic' : 'Keyword'} Search
            </Badge>
          </div>

          {results.map((result, index) => (
            <Card key={result.contentId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      {(result.metadata.title as string) || 'Untitled Event'}
                    </CardTitle>
                    {typeof result.metadata.startsAt === 'string' ? (
                      <p className="text-sm text-muted-foreground">
                        {new Date(result.metadata.startsAt).toLocaleDateString()}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={result.similarity > 0.7 ? 'default' : result.similarity > 0.5 ? 'secondary' : 'outline'}
                      className="text-lg px-3 py-1"
                    >
                      {(result.similarity * 100).toFixed(0)}%
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">Match</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3">
                  {result.textContent.substring(0, 200)}...
                </p>
                {typeof result.metadata.location === 'string' ? (
                  <Badge variant="outline" className="mt-2">
                    📍 {result.metadata.location}
                  </Badge>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Comparison Section */}
      {results.length > 0 && (
        <Card className="mt-8 border-2">
          <CardHeader>
            <CardTitle>Semantic vs Keyword Search</CardTitle>
            <CardDescription>
              Understanding the difference between semantic and traditional keyword search
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-green-600" />
                  Semantic Search Advantages
                </h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>✅ Understands context and meaning</li>
                  <li>✅ Finds related concepts even without exact keywords</li>
                  <li>✅ Handles synonyms and related terms</li>
                  <li>✅ Ranks by relevance, not just match count</li>
                  <li>✅ Works with natural language queries</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Search className="h-5 w-5 text-orange-600" />
                  Keyword Search Limitations
                </h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>⚠️ Requires exact word matches</li>
                  <li>⚠️ Misses synonyms and related concepts</li>
                  <li>⚠️ Doesn't understand context</li>
                  <li>⚠️ Poor results for natural language</li>
                  <li>⚠️ Can't rank by semantic relevance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {searchQuery && results.length === 0 && !isSearching && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              Try a different search query or check if events are indexed for semantic search.
            </p>
            <p className="text-sm text-muted-foreground">
              Note: Semantic search requires events to be indexed with embeddings first.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


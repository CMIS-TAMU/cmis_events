'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ResumeViewerProps {
  resumeUrl?: string | null;
  signedUrl?: string | null;
  uploadedAt?: string | null;
  version?: number | null;
  major?: string | null;
  gpa?: number | null;
  skills?: string[] | null;
  graduationYear?: number | null;
  onDelete?: () => void;
  showDelete?: boolean;
}

export function ResumeViewer({
  resumeUrl,
  signedUrl,
  uploadedAt,
  version,
  major,
  gpa,
  skills,
  graduationYear,
  onDelete,
  showDelete = false,
}: ResumeViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (signedUrl) {
      setPdfUrl(signedUrl);
      setLoading(false);
    } else if (resumeUrl) {
      setPdfUrl(resumeUrl);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [signedUrl, resumeUrl]);

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'resume.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!pdfUrl) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No resume uploaded</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Resume</CardTitle>
            <CardDescription>
              {uploadedAt && (
                <span className="flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  Uploaded {format(new Date(uploadedAt), 'MMM d, yyyy')}
                  {version && <span className="ml-2">(Version {version})</span>}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            {showDelete && onDelete && (
              <Button variant="destructive" size="sm" onClick={onDelete}>
                <X className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resume Metadata */}
        {(major || gpa || skills || graduationYear) && (
          <div className="grid gap-4 md:grid-cols-2 p-4 bg-muted rounded-lg">
            {major && (
              <div>
                <span className="text-sm font-medium">Major:</span>{' '}
                <span className="text-sm">{major}</span>
              </div>
            )}
            {gpa !== null && gpa !== undefined && (
              <div>
                <span className="text-sm font-medium">GPA:</span>{' '}
                <span className="text-sm">{gpa.toFixed(2)}</span>
              </div>
            )}
            {graduationYear && (
              <div>
                <span className="text-sm font-medium">Graduation Year:</span>{' '}
                <span className="text-sm">{graduationYear}</span>
              </div>
            )}
            {skills && skills.length > 0 && (
              <div className="md:col-span-2">
                <span className="text-sm font-medium">Skills:</span>{' '}
                <div className="flex flex-wrap gap-2 mt-1">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PDF Viewer */}
        <div className="border rounded-lg overflow-hidden">
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-muted-foreground">Loading resume...</div>
            </div>
          ) : (
            <iframe
              src={pdfUrl || undefined}
              className="w-full h-96"
              title="Resume Preview"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}


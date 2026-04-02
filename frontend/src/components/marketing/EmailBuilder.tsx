import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save, Eye, Download, Upload, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmailBuilderProps {
  initialDesign?: any;
  onSave?: (design: any, html: string) => void;
  onPreview?: (html: string) => void;
}

export default function EmailBuilder({ initialDesign, onSave, onPreview }: EmailBuilderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const emailEditorRef = useRef<any>(null);
  const [EmailEditor, setEmailEditor] = useState<any>(null);

  useEffect(() => {
    // Dynamically import the email editor
    const loadEditor = async () => {
      try {
        const module = await import('react-email-editor');
        setEmailEditor(() => module.default);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading email editor:', err);
        setError('Failed to load email editor. Please refresh the page.');
        setIsLoading(false);
      }
    };

    loadEditor();
  }, []);

  useEffect(() => {
    // Load initial design if provided
    if (initialDesign && emailEditorRef.current) {
      emailEditorRef.current.loadDesign(initialDesign);
    }
  }, [initialDesign, EmailEditor]);

  const saveDesign = () => {
    if (!emailEditorRef.current) return;

    emailEditorRef.current.exportHtml((data: any) => {
      const { design, html } = data;
      if (onSave) {
        onSave(design, html);
      }
    });
  };

  const previewEmail = () => {
    if (!emailEditorRef.current) return;

    emailEditorRef.current.exportHtml((data: any) => {
      const { html } = data;
      if (onPreview) {
        onPreview(html);
      }
    });
  };

  const exportDesign = () => {
    if (!emailEditorRef.current) return;

    emailEditorRef.current.exportHtml((data: any) => {
      const { design } = data;
      const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'email-design.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const importDesign = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const design = JSON.parse(event.target?.result as string);
          emailEditorRef.current?.loadDesign(design);
        } catch (error) {
          console.error('Error loading design:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading email editor...</p>
        </div>
      </div>
    );
  }

  if (!EmailEditor) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Toolbar */}
      <div className="flex-shrink-0 bg-white border rounded-t-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={saveDesign} size="sm">
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
            <Button onClick={previewEmail} size="sm" variant="outline">
              <Eye className="h-4 w-4 mr-2" /> Preview
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={importDesign} size="sm" variant="outline">
              <Upload className="h-4 w-4 mr-2" /> Import
            </Button>
            <Button onClick={exportDesign} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </div>
      </div>

      {/* Email Editor - Full height container */}
      <div className="flex-1 min-h-0 border border-t-0 rounded-b-lg overflow-hidden bg-white">
        <EmailEditor
          ref={emailEditorRef}
          onReady={() => console.log('Email editor ready')}
          options={{
            appearance: {
              theme: 'modern_light',
              panels: {
                tools: {
                  dock: 'left'
                }
              }
            },
            features: {
              textEditor: {
                spellChecker: true,
              }
            },
            tools: {
              image: { enabled: true },
              button: { enabled: true },
              divider: { enabled: true },
              social: { enabled: true },
              video: { enabled: true },
            },
            mergeTags: {
              first_name: { name: 'First Name', value: '{{first_name}}' },
              last_name: { name: 'Last Name', value: '{{last_name}}' },
              email: { name: 'Email', value: '{{email}}' },
              company: { name: 'Company', value: '{{company}}' },
              company_name: { name: 'Company Name', value: '{{company_name}}' },
              phone: { name: 'Phone', value: '{{phone}}' },
              city: { name: 'City', value: '{{city}}' },
              country: { name: 'Country', value: '{{country}}' },
              job_title: { name: 'Job Title', value: '{{job_title}}' },
              website: { name: 'Website', value: '{{website}}' },
              cta_link: { name: 'CTA Link', value: '{{cta_link}}' },
              unsubscribe_link: { name: 'Unsubscribe Link', value: '{{unsubscribe_link}}' },
            },
          }}
          minHeight="100%"
        />
      </div>
    </div>
  );
};

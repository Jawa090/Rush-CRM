import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface EmbedCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string;
  formName: string;
}

export default function EmbedCodeDialog({ open, onOpenChange, formId, formName }: EmbedCodeDialogProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const endpoint = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/marketing/forms/${formId}/submit`;

  const handleCopy = (code: string, tab: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(tab);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const htmlSnippet = `<!-- ${formName} - Lead Capture Form -->
<form id="rc-form-${formId.slice(0, 8)}" onsubmit="return handleSubmission(event)">
  <input type="email" name="email" placeholder="Email *" required />
  <input type="text" name="first_name" placeholder="First Name *" required />
  <input type="text" name="last_name" placeholder="Last Name" />
  <input type="text" name="company" placeholder="Company" />
  <input type="tel" name="phone" placeholder="Phone" />
  <button type="submit">Submit</button>
</form>

<script>
async function handleSubmission(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  const data = Object.fromEntries(new FormData(form));
  const params = new URLSearchParams(window.location.search);

  try {
    const res = await fetch('${endpoint}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form_id: '${formId}',
        fields: data,
        utm_source: params.get('utm_source') || null,
        utm_medium: params.get('utm_medium') || null,
        utm_campaign: params.get('utm_campaign') || null,
        source_url: window.location.href
      })
    });
    const result = await res.json();
    if (res.ok) {
      form.reset();
      btn.textContent = 'Thank you!';
      setTimeout(() => { btn.textContent = 'Submit'; btn.disabled = false; }, 3000);
    } else {
      alert(result.error || 'Submission failed');
      btn.textContent = 'Submit';
      btn.disabled = false;
    }
  } catch {
    alert('Network error. Please try again.');
    btn.textContent = 'Submit';
    btn.disabled = false;
  }
}
</script>`;

  const reactSnippet = `import { useState, FormEvent } from 'react';

const FORM_ENDPOINT = '${endpoint}';
const FORM_ID = '${formId}';

export default function LeadCaptureForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const params = new URLSearchParams(window.location.search);

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_id: FORM_ID,
          fields: data,
          utm_source: params.get('utm_source'),
          utm_medium: params.get('utm_medium'),
          utm_campaign: params.get('utm_campaign'),
          source_url: window.location.href,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        e.currentTarget.reset();
      }
    } catch {
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return <p>Thank you for your submission!</p>;

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" placeholder="Email *" required />
      <input type="text" name="first_name" placeholder="First Name *" required />
      <input type="text" name="last_name" placeholder="Last Name" />
      <input type="text" name="company" placeholder="Company" />
      <input type="tel" name="phone" placeholder="Phone" />
      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}`;

  const curlSnippet = `curl -X POST '${endpoint}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "form_id": "${formId}",
    "fields": {
      "email": "jane@example.com",
      "first_name": "Jane",
      "last_name": "Doe",
      "company": "Acme Inc"
    },
    "utm_source": "linkedin",
    "utm_medium": "social",
    "utm_campaign": "q1-launch",
    "source_url": "https://yoursite.com/landing"
  }'`;

  const CopyBtn = ({ code, tab }: { code: string; tab: string }) => (
    <Button variant="outline" size="sm" className="absolute top-2 right-2 gap-1.5" onClick={() => handleCopy(code, tab)}>
      {copiedTab === tab ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copiedTab === tab ? "Copied" : "Copy"}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Embed Form: {formName}</DialogTitle>
          <DialogDescription>
            Copy the code below and paste it into your website, email template, or use the API directly.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="html" className="mt-2">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="html">HTML Snippet</TabsTrigger>
            <TabsTrigger value="react">React Component</TabsTrigger>
            <TabsTrigger value="api">API / cURL</TabsTrigger>
          </TabsList>

          <TabsContent value="html" className="relative mt-3">
            <CopyBtn code={htmlSnippet} tab="html" />
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-[400px] overflow-y-auto">
              {htmlSnippet}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              Paste this into any HTML page. UTM parameters are captured automatically from the URL.
            </p>
          </TabsContent>

          <TabsContent value="react" className="relative mt-3">
            <CopyBtn code={reactSnippet} tab="react" />
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-[400px] overflow-y-auto">
              {reactSnippet}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              Drop this component into any React/Next.js project. Style it with your own CSS.
            </p>
          </TabsContent>

          <TabsContent value="api" className="relative mt-3">
            <CopyBtn code={curlSnippet} tab="api" />
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-[400px] overflow-y-auto">
              {curlSnippet}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              Use this endpoint from any backend, email service, or automation tool (Zapier, Make, n8n).
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

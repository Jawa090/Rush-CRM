import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/crm/ui/PageHeader";
import { DataToolbar } from "@/components/crm/ui/DataToolbar";
import { EmptyState } from "@/components/crm/ui/EmptyState";
import { useNavigate, useLocation } from "react-router-dom";
import { useDocuments, useUpdateDocument, useDeleteDocument } from "@/hooks/useDocuments";
import { CreateDocumentDialog } from "@/components/documents/CreateDocumentDialog";
import { format } from "date-fns";
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Eye,
  Edit,
  MoreVertical,
  Loader2,
  Trash2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const tabs = [
  { label: "Sign and manage", path: "/crm/customers/signing-parties", active: true },
  { label: "My vault", path: "/crm/customers/signing-parties/vault" },
  { label: "Contacts", path: "/crm/customers/signing-parties/contacts" },
];

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Pending", value: "pending" },
  { label: "Signed", value: "signed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const typeOptions = [
  { label: "All", value: "all" },
  { label: "Contract", value: "contract" },
  { label: "NDA", value: "nda" },
  { label: "Purchase Order", value: "purchase_order" },
  { label: "Invoice", value: "invoice" },
  { label: "Certificate", value: "certificate" },
];

export default function SignAndManagePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed":
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "draft":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "signed":
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Fetch real documents data
  const { data: documentsResponse, isLoading, isError } = useDocuments({
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  });

  const documents = documentsResponse?.data || [];

  const getProgressInfo = (doc: any) => {
    const signers = Array.isArray(doc.signers) ? doc.signers : 
                   typeof doc.signers === 'string' ? JSON.parse(doc.signers || '[]') : [];
    const total = signers.length || 1;
    const progress = doc.status === 'signed' || doc.status === 'completed' ? total : 
                    doc.status === 'pending' ? Math.floor(total / 2) : 0;
    return { progress, total, signers };
  };

  const handleStatusChange = (docId: string, newStatus: string) => {
    updateDocument.mutate({ id: docId, status: newStatus });
  };

  const handleDelete = (docId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteDocument.mutate(docId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading documents...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load documents. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.path}
            variant={location.pathname === tab.path ? "secondary" : "ghost"}
            size="sm"
            className="rounded-full"
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <PageHeader
        title="Sign and manage"
        description="Create, send, and track document signatures"
        meta={[
          { label: "Total Documents", value: documents.length, tone: "info" },
          { label: "Pending", value: documents.filter((d: any) => d.status === "pending").length, tone: "warning" },
          { label: "Signed", value: documents.filter((d: any) => d.status === "signed").length, tone: "success" },
        ]}
        actions={
          <Button className="gradient-primary" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Document
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Document Management</CardTitle>
          <CardDescription>Manage your signature documents and track their progress</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataToolbar
            search={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search documents..."
            filters={[
              { label: "Status", value: statusFilter, onChange: setStatusFilter, options: statusOptions },
              { label: "Type", value: typeFilter, onChange: setTypeFilter, options: typeOptions },
            ]}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading documents...
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <p className="text-destructive">Failed to load documents. Please try again.</p>
            </div>
          ) : documents.length === 0 ? (
            <EmptyState 
              title="No documents found" 
              description="Create your first document to get started with digital signatures."
              actionLabel="Create Document"
              onAction={() => {}}
              icon={<FileText className="h-6 w-6" />}
            />
          ) : (
            <div className="space-y-4">
              {documents.map((doc: any) => {
                const { progress, total, signers } = getProgressInfo(doc);
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{doc.title}</h3>
                          <Badge variant="outline" className={getStatusColor(doc.status)}>
                            {getStatusIcon(doc.status)}
                            <span className="ml-1 capitalize">{doc.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {doc.type.replace('_', ' ')} • Created {format(new Date(doc.created_at), 'MMM dd, yyyy')}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Progress: {progress}/{total} signatures</span>
                          {signers.length > 0 && (
                            <span>Signers: {signers.join(", ")}</span>
                          )}
                          {doc.company_name && (
                            <span>Company: {doc.company_name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange(doc.id, 'pending')}>
                            <Clock className="h-4 w-4 mr-2" />
                            Mark as Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(doc.id, 'signed')}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Signed
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(doc.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateDocumentDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </div>
  );
}
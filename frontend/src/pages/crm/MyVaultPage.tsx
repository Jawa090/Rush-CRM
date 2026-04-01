import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/crm/ui/PageHeader";
import { DataToolbar } from "@/components/crm/ui/DataToolbar";
import { EmptyState } from "@/components/crm/ui/EmptyState";
import { useNavigate, useLocation } from "react-router-dom";
import { useVaultDocuments, useDeleteDocument } from "@/hooks/useDocuments";
import { UploadDocumentDialog } from "@/components/documents/UploadDocumentDialog";
import { format, isAfter, addDays } from "date-fns";
import { 
  Plus, 
  FileText, 
  Shield, 
  Download,
  Eye,
  Lock,
  Unlock,
  Calendar,
  User,
  Building2,
  MoreVertical,
  Loader2,
  Trash2,
  Upload
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const tabs = [
  { label: "Sign and manage", path: "/crm/customers/signing-parties" },
  { label: "My vault", path: "/crm/customers/signing-parties/vault", active: true },
  { label: "Contacts", path: "/crm/customers/signing-parties/contacts" },
];

const typeOptions = [
  { label: "All", value: "all" },
  { label: "Contracts", value: "contract" },
  { label: "NDAs", value: "nda" },
  { label: "Purchase Orders", value: "purchase_order" },
  { label: "Invoices", value: "invoice" },
  { label: "Certificates", value: "certificate" },
];

export default function MyVaultPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const deleteDocument = useDeleteDocument();

  const getTypeColor = (type: string) => {
    switch (type) {
      case "contract":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "nda":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "purchase_order":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "invoice":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "certificate":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "contract":
        return <FileText className="h-4 w-4" />;
      case "nda":
        return <Shield className="h-4 w-4" />;
      case "certificate":
        return <Lock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Fetch real vault documents data (signed/completed documents)
  const { data: vaultResponse, isLoading, isError } = useVaultDocuments({
    search: searchQuery || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  });

  const vaultDocuments = vaultResponse?.data || [];

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = addDays(now, 30);
    return isAfter(thirtyDaysFromNow, expiry);
  };

  const getSigners = (doc: any) => {
    const signers = Array.isArray(doc.signers) ? doc.signers : 
                   typeof doc.signers === 'string' ? JSON.parse(doc.signers || '[]') : [];
    return signers;
  };

  const handleDelete = (docId: string) => {
    if (confirm('Are you sure you want to delete this document from the vault?')) {
      deleteDocument.mutate(docId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading vault documents...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load vault documents. Please try again.</p>
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
        title="My vault"
        description="Securely store and manage your signed documents"
        meta={[
          { label: "Total Documents", value: vaultDocuments.length, tone: "info" },
          { label: "Secure", value: vaultDocuments.filter((d: any) => d.is_secure).length, tone: "success" },
          { label: "Expiring Soon", value: vaultDocuments.filter((d: any) => isExpiringSoon(d.expiry_date)).length, tone: "warning" },
        ]}
        actions={
          <Button className="gradient-primary" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Upload Document
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Document Vault</CardTitle>
          <CardDescription>Your secure repository of signed and completed documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataToolbar
            search={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search vault documents..."
            filters={[
              { label: "Type", value: typeFilter, onChange: setTypeFilter, options: typeOptions },
            ]}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading vault documents...
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <p className="text-destructive">Failed to load vault documents. Please try again.</p>
            </div>
          ) : vaultDocuments.length === 0 ? (
            <EmptyState 
              title="No documents in vault" 
              description="Your signed documents will appear here once completed."
              actionLabel="Upload Document"
              onAction={() => {}}
              icon={<Shield className="h-6 w-6" />}
            />
          ) : (
            <div className="space-y-4">
              {vaultDocuments.map((doc: any) => {
                const signers = getSigners(doc);
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {getTypeIcon(doc.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{doc.title}</h3>
                          <Badge variant="outline" className={getTypeColor(doc.type)}>
                            <span className="capitalize">{doc.type.replace('_', ' ')}</span>
                          </Badge>
                          {doc.is_secure && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                              <Lock className="h-3 w-3 mr-1" />
                              Secure
                            </Badge>
                          )}
                          {isExpiringSoon(doc.expiry_date) && (
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          {doc.company_name && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {doc.company_name}
                            </span>
                          )}
                          {doc.signed_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Signed: {format(new Date(doc.signed_at), 'MMM dd, yyyy')}
                            </span>
                          )}
                          {doc.expiry_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Expires: {format(new Date(doc.expiry_date), 'MMM dd, yyyy')}
                            </span>
                          )}
                          <span>{doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : 'N/A'}</span>
                        </div>
                        {signers.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            Signers: {signers.join(", ")}
                          </div>
                        )}
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
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="h-4 w-4 mr-2" />
                            Security Info
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

      <UploadDocumentDialog 
        open={uploadDialogOpen} 
        onOpenChange={setUploadDialogOpen} 
      />
    </div>
  );
}
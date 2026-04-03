import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Users, Filter, Search, Trash2, MoreHorizontal, Download, Upload, 
  Edit, Copy, Mail, UserPlus, FileSpreadsheet, CheckCircle2, XCircle, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useMarketingLists, useCreateList, useDeleteList } from "@/hooks/useMarketingData";
import { marketingApi } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";
import SegmentBuilder, { SegmentGroup } from "@/components/marketing/SegmentBuilder";

export default function EnhancedListsPage() {
  const navigate = useNavigate();
  const { data: lists = [], isLoading } = useMarketingLists();
  const createList = useCreateList();
  const deleteList = useDeleteList();
  
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    list_type: "static",
  });

  const [segmentRules, setSegmentRules] = useState<SegmentGroup[]>([]);

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMapping, setImportMapping] = useState({
    email: "",
    first_name: "",
    last_name: "",
    company: "",
  });

  const filtered = lists.filter((l: any) => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || l.list_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error("List name is required");
      return;
    }

    try {
      await createList.mutateAsync({
        name: form.name,
        description: form.description || null,
        list_type: form.list_type,
      } as any);
      
      setShowCreate(false);
      setForm({ name: "", description: "", list_type: "static" });
      toast.success("List created successfully");
    } catch (error) {
      toast.error("Failed to create list");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this list?")) {
      try {
        await deleteList.mutateAsync(id);
        toast.success("List deleted successfully");
      } catch (error) {
        toast.error("Failed to delete list");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLists.length === 0) return;
    
    if (confirm(`Delete ${selectedLists.length} selected lists?`)) {
      try {
        await Promise.all(selectedLists.map(id => deleteList.mutateAsync(id)));
        setSelectedLists([]);
        toast.success(`${selectedLists.length} lists deleted`);
      } catch (error) {
        toast.error("Failed to delete lists");
      }
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Please select a CSV file");
      return;
    }

    try {
      // Parse CSV file
      const text = await importFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error("CSV file is empty or invalid");
        return;
      }

      // Get headers
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Parse rows
      const contacts = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const contact: any = {};
        
        headers.forEach((header, index) => {
          if (values[index]) {
            contact[header] = values[index];
          }
        });
        
        // Map columns if mapping is provided
        const mappedContact: any = {};
        if (importMapping.email && contact[importMapping.email]) {
          mappedContact.email = contact[importMapping.email];
        } else if (contact.email) {
          mappedContact.email = contact.email;
        }
        
        if (importMapping.first_name && contact[importMapping.first_name]) {
          mappedContact.first_name = contact[importMapping.first_name];
        } else if (contact.first_name) {
          mappedContact.first_name = contact.first_name;
        }
        
        if (importMapping.last_name && contact[importMapping.last_name]) {
          mappedContact.last_name = contact[importMapping.last_name];
        } else if (contact.last_name) {
          mappedContact.last_name = contact.last_name;
        }
        
        if (importMapping.company && contact[importMapping.company]) {
          mappedContact.company = contact[importMapping.company];
        } else if (contact.company) {
          mappedContact.company = contact.company;
        }
        
        if (mappedContact.email) {
          contacts.push(mappedContact);
        }
      }

      if (contacts.length === 0) {
        toast.error("No valid contacts found in CSV");
        return;
      }

      // Select or create a list
      const listName = prompt("Enter list name to import contacts into:", "Imported Contacts");
      if (!listName) return;

      // Create list
      const newList = await createList.mutateAsync({
        name: listName,
        description: `Imported from ${importFile.name}`,
        list_type: "static",
      } as any);

      // Add contacts to list
      await marketingApi.addListMembers(newList.data.id, contacts);
      
      toast.success(`Successfully imported ${contacts.length} contacts`);
      setShowImport(false);
      setImportFile(null);
      setImportMapping({ email: "", first_name: "", last_name: "", company: "" });
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Failed to import contacts");
    }
  };

  const handleExport = () => {
    if (selectedLists.length === 0) {
      toast.error("Please select lists to export");
      return;
    }

    try {
      // Export each selected list
      selectedLists.forEach(listId => {
        marketingApi.exportListMembers(listId);
      });
      
      toast.success(`Exporting ${selectedLists.length} list(s)...`);
      setShowExport(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to export lists");
    }
  };

  const toggleSelectAll = () => {
    if (selectedLists.length === filtered.length) {
      setSelectedLists([]);
    } else {
      setSelectedLists(filtered.map((l: any) => l.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedLists(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const staticLists = filtered.filter((l: any) => l.list_type === "static");
  const dynamicLists = filtered.filter((l: any) => l.list_type === "dynamic");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lists & Segments</h1>
          <p className="text-sm text-muted-foreground">Organize and segment your contacts for targeted campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-2" /> Import CSV
          </Button>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" /> New List
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Lists</p>
                <p className="text-2xl font-bold">{lists.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Contacts</p>
                <p className="text-2xl font-bold">
                  {lists.reduce((sum: number, l: any) => sum + (l.member_count || 0), 0).toLocaleString()}
                </p>
              </div>
              <Mail className="h-8 w-8 text-chart-2 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Static Lists</p>
                <p className="text-2xl font-bold">{staticLists.length}</p>
              </div>
              <FileSpreadsheet className="h-8 w-8 text-chart-3 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dynamic Segments</p>
                <p className="text-2xl font-bold">{dynamicLists.length}</p>
              </div>
              <Filter className="h-8 w-8 text-chart-4 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="static">Static Lists</SelectItem>
              <SelectItem value="dynamic">Dynamic Segments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedLists.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedLists.length} selected</Badge>
            <Button variant="outline" size="sm" onClick={() => setShowExport(true)}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>
        )}
      </div>

      {/* Lists Table */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Lists ({lists.length})</TabsTrigger>
          <TabsTrigger value="static">Static ({staticLists.length})</TabsTrigger>
          <TabsTrigger value="dynamic">Dynamic ({dynamicLists.length})</TabsTrigger>
        </TabsList>

        {["all", "static", "dynamic"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading lists...</div>
            ) : filtered.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="text-muted-foreground mb-4">
                    {search ? "No lists found matching your search" : "No lists yet. Create your first list to get started."}
                  </p>
                  <Button onClick={() => setShowCreate(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Create List
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedLists.length === filtered.length}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>List Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Contacts</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((list: any) => (
                      <TableRow key={list.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedLists.includes(list.id)}
                            onCheckedChange={() => toggleSelect(list.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{list.name}</p>
                            {list.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                                {list.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize gap-1">
                            {list.list_type === "dynamic" && <Filter className="h-3 w-3" />}
                            {list.list_type || "static"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">{(list.member_count || 0).toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          {list.is_active !== false ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <XCircle className="h-3 w-3" /> Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(list.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" /> View Contacts
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <UserPlus className="h-4 w-4 mr-2" /> Add Contacts
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" /> Edit List
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" /> Export CSV
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(list.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create List Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
            <DialogDescription>
              Create a static list or dynamic segment to organize your contacts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>List Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Enterprise Prospects"
              />
            </div>

            <div className="space-y-2">
              <Label>List Type</Label>
              <Select value={form.list_type} onValueChange={(v) => setForm({ ...form, list_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Static List</p>
                        <p className="text-xs text-muted-foreground">Manually add/remove contacts</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="dynamic">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Dynamic Segment</p>
                        <p className="text-xs text-muted-foreground">Auto-update based on rules</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Describe the purpose of this list..."
              />
            </div>

            {form.list_type === "dynamic" && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 font-medium mb-2">Dynamic Segment Rules</p>
                  <p className="text-xs text-blue-700">
                    Define filter rules to automatically include contacts based on properties, activity, and behavior.
                  </p>
                </div>
                <SegmentBuilder 
                  segments={segmentRules} 
                  onChange={setSegmentRules} 
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createList.isPending}>
              {createList.isPending ? "Creating..." : "Create List"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Contacts from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file to bulk import contacts into a list
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select CSV File</Label>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">
                CSV should include columns: email, first_name, last_name, company
              </p>
            </div>

            {importFile && (
              <>
                <div className="space-y-2">
                  <Label>Map CSV Columns</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Email Column</Label>
                      <Input
                        value={importMapping.email}
                        onChange={(e) => setImportMapping({ ...importMapping, email: e.target.value })}
                        placeholder="email"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">First Name Column</Label>
                      <Input
                        value={importMapping.first_name}
                        onChange={(e) => setImportMapping({ ...importMapping, first_name: e.target.value })}
                        placeholder="first_name"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Last Name Column</Label>
                      <Input
                        value={importMapping.last_name}
                        onChange={(e) => setImportMapping({ ...importMapping, last_name: e.target.value })}
                        placeholder="last_name"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Company Column</Label>
                      <Input
                        value={importMapping.company}
                        onChange={(e) => setImportMapping({ ...importMapping, company: e.target.value })}
                        placeholder="company"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">File: {importFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Size: {(importFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImport(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!importFile}>
              <Upload className="h-4 w-4 mr-2" /> Import Contacts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExport} onOpenChange={setShowExport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Lists to CSV</DialogTitle>
            <DialogDescription>
              Export {selectedLists.length} selected list(s) to CSV format
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              The CSV will include all contacts from the selected lists with their email, name, and other properties.
            </p>
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select defaultValue="standard">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard CSV</SelectItem>
                  <SelectItem value="mailchimp">Mailchimp Format</SelectItem>
                  <SelectItem value="hubspot">HubSpot Format</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExport(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

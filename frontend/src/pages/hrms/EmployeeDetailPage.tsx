import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Building2, DollarSign, Edit, Trash2, User, FileText, Briefcase, GraduationCap, Award, Languages, Heart, Users, CreditCard, Loader2, Download, Eye, Upload } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Document {
  id: string;
  employee_id: string;
  org_id: string;
  document_type: string;
  document_name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  issue_date?: string;
  expiry_date?: string;
  document_number?: string;
  uploaded_by: string;
  uploaded_by_name?: string;
  uploaded_at: string;
  notes?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-red-50 text-red-700 border-red-200',
  on_leave: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  remote: 'bg-blue-50 text-blue-700 border-blue-200',
};

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function EmployeeDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employee, setEmployee] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    document_type: 'CNIC',
    document_name: '',
    file: null as File | null,
  });

  useEffect(() => {
    fetchEmployee();
    fetchDocuments();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response: any = await api.get(`/employees/${id}`);
      const data = response.data || response;
      
      if (!data || !data.first_name) {
        throw new Error('Employee not found');
      }
      
      setEmployee(data);
    } catch (error: any) {
      console.error('Error fetching employee:', error);
      toast.error('Failed to load employee', {
        description: error?.message || 'Please try again'
      });
      navigate('/hrms/employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response: any = await api.get(`/employees/${id}/documents`);
      const data = response.data || response;
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      // Don't show error toast for documents, just log it
      setDocuments([]);
    }
  };

  const handleUploadDocument = async () => {
    if (!uploadForm.file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('document_type', uploadForm.document_type);
      formData.append('document_name', uploadForm.document_name || uploadForm.file.name);

      await api.post(`/employees/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Document uploaded successfully');
      setUploadDialog(false);
      setUploadForm({ document_type: 'CNIC', document_name: '', file: null });
      fetchDocuments();
    } catch (error: any) {
      toast.error('Failed to upload document', {
        description: error?.response?.data?.error || 'Please try again',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await api.delete(`/employees/${id}/documents/${docId}`);
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error: any) {
      toast.error('Failed to delete document');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/employees/${id}`);
      toast.success('Employee deleted successfully');
      navigate('/hrms/employees');
    } catch (error: any) {
      toast.error('Failed to delete employee', {
        description: error?.response?.data?.error || 'Please try again'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  const name = employee.name || `${employee.first_name} ${employee.last_name}`.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/hrms/employees')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
                <p className="text-gray-600 mt-1">{employee.position || employee.job_title || 'Employee'}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline" className={cn('capitalize', STATUS_COLORS[employee.status] || 'bg-gray-50')}>
                    {employee.status?.replace('_', ' ')}
                  </Badge>
                  {employee.employee_id && (
                    <span className="text-sm text-gray-600">ID: {employee.employee_id}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/hrms/employees/${id}/edit`)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteDialog(true)}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contact & Personal Info */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {employee.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium">{employee.email}</p>
                    </div>
                  </div>
                )}
                {employee.official_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Official Email</p>
                      <p className="text-sm font-medium">{employee.official_email}</p>
                    </div>
                  </div>
                )}
                {employee.personal_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Personal Email</p>
                      <p className="text-sm font-medium">{employee.personal_email}</p>
                    </div>
                  </div>
                )}
                {employee.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium">{employee.phone}</p>
                    </div>
                  </div>
                )}
                {employee.secondary_phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Secondary Phone</p>
                      <p className="text-sm font-medium">{employee.secondary_phone}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {employee.cnic && (
                  <div>
                    <p className="text-xs text-gray-500">CNIC</p>
                    <p className="text-sm font-medium">{employee.cnic}</p>
                  </div>
                )}
                {employee.date_of_birth && (
                  <div>
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="text-sm font-medium">{format(new Date(employee.date_of_birth), 'MMMM d, yyyy')}</p>
                  </div>
                )}
                {employee.gender && (
                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="text-sm font-medium capitalize">{employee.gender}</p>
                  </div>
                )}
                {employee.religion && (
                  <div>
                    <p className="text-xs text-gray-500">Religion</p>
                    <p className="text-sm font-medium">{employee.religion}</p>
                  </div>
                )}
                {employee.marital_status && (
                  <div>
                    <p className="text-xs text-gray-500">Marital Status</p>
                    <p className="text-sm font-medium capitalize">{employee.marital_status}</p>
                  </div>
                )}
                {employee.blood_group && (
                  <div>
                    <p className="text-xs text-gray-500">Blood Group</p>
                    <p className="text-sm font-medium">{employee.blood_group}</p>
                  </div>
                )}
                {employee.nationality && (
                  <div>
                    <p className="text-xs text-gray-500">Nationality</p>
                    <p className="text-sm font-medium">{employee.nationality}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address */}
            {(employee.current_address || employee.permanent_address) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {employee.current_address && (
                    <div>
                      <p className="text-xs text-gray-500">Current Address</p>
                      <p className="text-sm font-medium">{employee.current_address}</p>
                      {employee.city && <p className="text-sm text-gray-600">{employee.city}, {employee.state} {employee.postal_code}</p>}
                    </div>
                  )}
                  {employee.permanent_address && (
                    <div>
                      <p className="text-xs text-gray-500">Permanent Address</p>
                      <p className="text-sm font-medium">{employee.permanent_address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Emergency Contact */}
            {employee.emergency_contact_name && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium">{employee.emergency_contact_name}</p>
                  </div>
                  {employee.emergency_contact_phone && (
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium">{employee.emergency_contact_phone}</p>
                    </div>
                  )}
                  {employee.emergency_contact_relation && (
                    <div>
                      <p className="text-xs text-gray-500">Relation</p>
                      <p className="text-sm font-medium">{employee.emergency_contact_relation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Employment & Other Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Employment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {employee.department && (
                    <div>
                      <p className="text-xs text-gray-500">Department</p>
                      <p className="text-sm font-medium">{employee.department}</p>
                    </div>
                  )}
                  {employee.position && (
                    <div>
                      <p className="text-xs text-gray-500">Position</p>
                      <p className="text-sm font-medium">{employee.position}</p>
                    </div>
                  )}
                  {employee.job_title && (
                    <div>
                      <p className="text-xs text-gray-500">Job Title</p>
                      <p className="text-sm font-medium">{employee.job_title}</p>
                    </div>
                  )}
                  {employee.hire_date && (
                    <div>
                      <p className="text-xs text-gray-500">Hire Date</p>
                      <p className="text-sm font-medium">{format(new Date(employee.hire_date), 'MMMM d, yyyy')}</p>
                    </div>
                  )}
                  {employee.probation_status && (
                    <div>
                      <p className="text-xs text-gray-500">Probation Status</p>
                      <p className="text-sm font-medium capitalize">{employee.probation_status.replace('_', ' ')}</p>
                    </div>
                  )}
                  {employee.probation_end_date && (
                    <div>
                      <p className="text-xs text-gray-500">Probation End Date</p>
                      <p className="text-sm font-medium">{format(new Date(employee.probation_end_date), 'MMMM d, yyyy')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Compensation */}
            {(employee.base_salary || employee.commission_rate) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Compensation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {employee.base_salary && (
                      <div>
                        <p className="text-xs text-gray-500">Base Salary</p>
                        <p className="text-sm font-medium">PKR {Number(employee.base_salary).toLocaleString()}</p>
                      </div>
                    )}
                    {employee.commission_rate && (
                      <div>
                        <p className="text-xs text-gray-500">Commission Rate</p>
                        <p className="text-sm font-medium">{employee.commission_rate}%</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Banking Information */}
            {employee.bank_name && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Banking Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-500">Bank Name</p>
                      <p className="text-sm font-medium">{employee.bank_name}</p>
                    </div>
                    {employee.bank_account_number && (
                      <div>
                        <p className="text-xs text-gray-500">Account Number</p>
                        <p className="text-sm font-medium">{employee.bank_account_number}</p>
                      </div>
                    )}
                    {employee.bank_account_title && (
                      <div>
                        <p className="text-xs text-gray-500">Account Title</p>
                        <p className="text-sm font-medium">{employee.bank_account_title}</p>
                      </div>
                    )}
                    {employee.tax_id && (
                      <div>
                        <p className="text-xs text-gray-500">Tax ID / NTN</p>
                        <p className="text-sm font-medium">{employee.tax_id}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {(employee.education_level || employee.university) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {employee.education_level && (
                      <div>
                        <p className="text-xs text-gray-500">Education Level</p>
                        <p className="text-sm font-medium">{employee.education_level}</p>
                      </div>
                    )}
                    {employee.university && (
                      <div>
                        <p className="text-xs text-gray-500">University</p>
                        <p className="text-sm font-medium">{employee.university}</p>
                      </div>
                    )}
                    {employee.degree && (
                      <div>
                        <p className="text-xs text-gray-500">Degree</p>
                        <p className="text-sm font-medium">{employee.degree}</p>
                      </div>
                    )}
                    {employee.graduation_year && (
                      <div>
                        <p className="text-xs text-gray-500">Graduation Year</p>
                        <p className="text-sm font-medium">{employee.graduation_year}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experience */}
            {(employee.previous_company || employee.years_of_experience) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-orange-600" />
                    Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {employee.previous_company && (
                      <div>
                        <p className="text-xs text-gray-500">Previous Company</p>
                        <p className="text-sm font-medium">{employee.previous_company}</p>
                      </div>
                    )}
                    {employee.previous_position && (
                      <div>
                        <p className="text-xs text-gray-500">Previous Position</p>
                        <p className="text-sm font-medium">{employee.previous_position}</p>
                      </div>
                    )}
                    {employee.years_of_experience && (
                      <div>
                        <p className="text-xs text-gray-500">Years of Experience</p>
                        <p className="text-sm font-medium">{employee.years_of_experience} years</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills & Certifications */}
            {(employee.skills || employee.certifications || employee.languages) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-indigo-600" />
                    Skills & Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {employee.skills && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(employee.skills) ? employee.skills : employee.skills.split(',')).map((skill: string, i: number) => (
                          <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700">
                            {skill.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {employee.certifications && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Certifications</p>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(employee.certifications) ? employee.certifications : employee.certifications.split(',')).map((cert: string, i: number) => (
                          <Badge key={i} variant="secondary" className="bg-green-50 text-green-700">
                            {cert.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {employee.languages && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Languages</p>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(employee.languages) ? employee.languages : employee.languages.split(',')).map((lang: string, i: number) => (
                          <Badge key={i} variant="secondary" className="bg-purple-50 text-purple-700">
                            {lang.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Additional Notes */}
            {employee.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    Additional Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{employee.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Documents Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Documents
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setUploadDialog(true)}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Documents
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-2">No documents uploaded yet</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setUploadDialog(true)}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload First Document
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {doc.document_name}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {doc.document_type}
                              </Badge>
                              {doc.file_size && (
                                <span className="text-xs text-gray-500">
                                  {(doc.file_size / 1024).toFixed(1)} KB
                                </span>
                              )}
                              {doc.uploaded_at && (
                                <span className="text-xs text-gray-500">
                                  {format(new Date(doc.uploaded_at), 'MMM d, yyyy')}
                                </span>
                              )}
                            </div>
                            {doc.notes && (
                              <p className="text-xs text-gray-600 mt-1 truncate">
                                {doc.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {doc.is_verified && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                              Verified
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-2"
                            onClick={() => window.open(doc.file_path, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-2"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = doc.file_path;
                              link.download = doc.document_name;
                              link.click();
                            }}
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Document Types Info */}
                {employee.cnic_picture && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Profile Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {employee.cnic_picture && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <FileText className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium">CNIC Picture</p>
                            <p className="text-xs text-gray-500">Stored in profile</p>
                          </div>
                        </div>
                      )}
                      {employee.profile_picture && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <User className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium">Profile Picture</p>
                            <p className="text-xs text-gray-500">Stored in profile</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upload Document Dialog */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document for {employee?.first_name} {employee?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="document_type">Document Type</Label>
              <select
                id="document_type"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={uploadForm.document_type}
                onChange={(e) => setUploadForm({ ...uploadForm, document_type: e.target.value })}
              >
                <option value="CNIC">CNIC</option>
                <option value="Contract">Contract</option>
                <option value="Resume">Resume</option>
                <option value="Certificate">Certificate</option>
                <option value="Degree">Degree</option>
                <option value="Experience Letter">Experience Letter</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="document_name">Document Name (Optional)</Label>
              <Input
                id="document_name"
                placeholder="e.g., CNIC Front Side"
                value={uploadForm.document_name}
                onChange={(e) => setUploadForm({ ...uploadForm, document_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setUploadForm({ ...uploadForm, file });
                }}
              />
              <p className="text-xs text-gray-500">
                Supported: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadDialog(false);
                setUploadForm({ document_type: 'CNIC', document_name: '', file: null });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUploadDocument} disabled={uploading || !uploadForm.file}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

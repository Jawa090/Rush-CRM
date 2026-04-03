import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Building2, FileText, Upload, Save, ChevronRight, ChevronLeft, Loader2, X, Download, Eye, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function EditEmployeePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  
  const [formData, setFormData] = useState({
    // Basic Info
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    secondary_phone: '',
    official_email: '',
    personal_email: '',
    
    // Personal Info
    cnic: '',
    date_of_birth: '',
    gender: '',
    religion: '',
    marital_status: '',
    blood_group: '',
    nationality: 'Pakistani',
    
    // Address
    current_address: '',
    permanent_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Pakistan',
    
    // Employment
    employee_id: '',
    department: '',
    position: '',
    job_title: '',
    hire_date: '',
    status: 'active',
    probation_status: 'on_probation',
    probation_end_date: '',
    base_salary: '',
    commission_rate: '',
    
    // Emergency Contact
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    
    // Banking
    bank_name: '',
    bank_account_number: '',
    bank_account_title: '',
    tax_id: '',
    
    // Education
    education_level: '',
    university: '',
    degree: '',
    graduation_year: '',
    
    // Experience
    previous_company: '',
    previous_position: '',
    years_of_experience: '',
    skills: '',
    certifications: '',
    languages: '',
    
    // Additional
    notes: '',
  });

  useEffect(() => {
    fetchEmployee();
    fetchDocuments();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setFetching(true);
      const response: any = await api.get(`/employees/${id}`);
      const employee = response.data || response;
      
      if (!employee || !employee.first_name) {
        throw new Error('Employee data not found');
      }
      
      // Convert arrays to comma-separated strings and handle all fields safely
      const formattedData = {
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        secondary_phone: employee.secondary_phone || '',
        official_email: employee.official_email || '',
        personal_email: employee.personal_email || '',
        cnic: employee.cnic || '',
        date_of_birth: employee.date_of_birth ? employee.date_of_birth.split('T')[0] : '',
        gender: employee.gender || '',
        religion: employee.religion || '',
        marital_status: employee.marital_status || '',
        blood_group: employee.blood_group || '',
        nationality: employee.nationality || 'Pakistani',
        current_address: employee.current_address || '',
        permanent_address: employee.permanent_address || '',
        city: employee.city || '',
        state: employee.state || '',
        postal_code: employee.postal_code || '',
        country: employee.country || 'Pakistan',
        employee_id: employee.employee_id || '',
        department: employee.department || '',
        position: employee.position || '',
        job_title: employee.job_title || '',
        hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : '',
        status: employee.status || 'active',
        probation_status: employee.probation_status || 'on_probation',
        probation_end_date: employee.probation_end_date ? employee.probation_end_date.split('T')[0] : '',
        base_salary: employee.base_salary ? String(employee.base_salary) : '',
        commission_rate: employee.commission_rate ? String(employee.commission_rate) : '',
        emergency_contact_name: employee.emergency_contact_name || '',
        emergency_contact_phone: employee.emergency_contact_phone || '',
        emergency_contact_relation: employee.emergency_contact_relation || '',
        bank_name: employee.bank_name || '',
        bank_account_number: employee.bank_account_number || '',
        bank_account_title: employee.bank_account_title || '',
        tax_id: employee.tax_id || '',
        education_level: employee.education_level || '',
        university: employee.university || '',
        degree: employee.degree || '',
        graduation_year: employee.graduation_year ? String(employee.graduation_year) : '',
        previous_company: employee.previous_company || '',
        previous_position: employee.previous_position || '',
        years_of_experience: employee.years_of_experience ? String(employee.years_of_experience) : '',
        skills: Array.isArray(employee.skills) ? employee.skills.join(', ') : (employee.skills || ''),
        certifications: Array.isArray(employee.certifications) ? employee.certifications.join(', ') : (employee.certifications || ''),
        languages: Array.isArray(employee.languages) ? employee.languages.join(', ') : (employee.languages || ''),
        notes: employee.notes || '',
      };
      
      setFormData(formattedData);
    } catch (error: any) {
      console.error('Error fetching employee:', error);
      toast.error('Failed to load employee', {
        description: error?.message || 'Please try again'
      });
      navigate('/hrms/employees');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error('Please fill in required fields', {
        description: 'First name, last name, and email are required'
      });
      return;
    }

    setLoading(true);
    try {
      const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          // Convert numeric fields
          if (['base_salary', 'commission_rate', 'graduation_year', 'years_of_experience'].includes(key)) {
            const numValue = Number(value);
            if (!isNaN(numValue) && numValue > 0) {
              acc[key] = numValue;
            }
          } else {
            acc[key] = value;
          }
        }
        return acc;
      }, {} as any);

      // Convert comma-separated strings to arrays
      if (cleanedData.skills) {
        cleanedData.skills = cleanedData.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      if (cleanedData.certifications) {
        cleanedData.certifications = cleanedData.certifications.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      if (cleanedData.languages) {
        cleanedData.languages = cleanedData.languages.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      await api.put(`/employees/${id}`, cleanedData);
      
      toast.success('Employee updated successfully!');
      navigate('/hrms/employees');
    } catch (error: any) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee', {
        description: error?.message || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response: any = await api.get(`/employees/${id}/documents`);
      const data = response.data || response;
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    }
  };

  const handleDocumentUpload = async (file: File, documentType: string) => {
    try {
      setUploadingDoc(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      formData.append('document_name', file.name);

      await api.post(`/employees/${id}/documents`, formData);

      toast.success('Document uploaded successfully!');
      fetchDocuments();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document', {
        description: error?.message || 'Please try again'
      });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await api.delete(`/employees/${id}/documents/${docId}`);
      toast.success('Document deleted successfully!');
      fetchDocuments();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const steps = [
    { id: 1, title: 'Basic Info', icon: User },
    { id: 2, title: 'Personal Details', icon: FileText },
    { id: 3, title: 'Employment', icon: Building2 },
    { id: 4, title: 'Documents', icon: Upload },
  ];

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/hrms/employees')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Employee</h1>
              <p className="text-gray-600 mt-1">{formData.first_name} {formData.last_name}</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mt-8 flex items-center justify-between max-w-3xl">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
                  <p className="text-gray-600">Update employee's basic contact details</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>First Name <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => handleChange('first_name', e.target.value)}
                      placeholder="Enter first name"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Last Name <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => handleChange('last_name', e.target.value)}
                      placeholder="Enter last name"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Email <span className="text-red-500">*</span></Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="employee@company.com"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+92 300 1234567"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Secondary Phone</Label>
                    <Input
                      value={formData.secondary_phone}
                      onChange={(e) => handleChange('secondary_phone', e.target.value)}
                      placeholder="+92 321 1234567"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Official Email</Label>
                    <Input
                      type="email"
                      value={formData.official_email}
                      onChange={(e) => handleChange('official_email', e.target.value)}
                      placeholder="official@company.com"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Personal Email</Label>
                    <Input
                      type="email"
                      value={formData.personal_email}
                      onChange={(e) => handleChange('personal_email', e.target.value)}
                      placeholder="personal@gmail.com"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Personal Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Details</h2>
                  <p className="text-gray-600">Personal information and address</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>CNIC Number</Label>
                    <Input
                      value={formData.cnic}
                      onChange={(e) => handleChange('cnic', e.target.value)}
                      placeholder="12345-1234567-1"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleChange('date_of_birth', e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Gender</Label>
                    <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Religion</Label>
                    <Input
                      value={formData.religion}
                      onChange={(e) => handleChange('religion', e.target.value)}
                      placeholder="Islam, Christianity, etc."
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Marital Status</Label>
                    <Select value={formData.marital_status} onValueChange={(v) => handleChange('marital_status', v)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Blood Group</Label>
                    <Select value={formData.blood_group} onValueChange={(v) => handleChange('blood_group', v)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label>Current Address</Label>
                    <Textarea
                      value={formData.current_address}
                      onChange={(e) => handleChange('current_address', e.target.value)}
                      placeholder="Enter current address"
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Permanent Address</Label>
                    <Textarea
                      value={formData.permanent_address}
                      onChange={(e) => handleChange('permanent_address', e.target.value)}
                      placeholder="Enter permanent address"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>City</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="Karachi, Lahore, etc."
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>State/Province</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      placeholder="Sindh, Punjab, etc."
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Postal Code</Label>
                    <Input
                      value={formData.postal_code}
                      onChange={(e) => handleChange('postal_code', e.target.value)}
                      placeholder="75500"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Country</Label>
                    <Input
                      value={formData.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Emergency Contact</h3>
                  </div>

                  <div>
                    <Label>Emergency Contact Name</Label>
                    <Input
                      value={formData.emergency_contact_name}
                      onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                      placeholder="Contact person name"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Emergency Contact Phone</Label>
                    <Input
                      value={formData.emergency_contact_phone}
                      onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                      placeholder="+92 300 1234567"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Relation</Label>
                    <Input
                      value={formData.emergency_contact_relation}
                      onChange={(e) => handleChange('emergency_contact_relation', e.target.value)}
                      placeholder="Father, Mother, Spouse, etc."
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Employment */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Employment Details</h2>
                  <p className="text-gray-600">Job position and salary information</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Employee ID</Label>
                    <Input
                      value={formData.employee_id}
                      onChange={(e) => handleChange('employee_id', e.target.value)}
                      placeholder="EMP-001"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Department</Label>
                    <Input
                      value={formData.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      placeholder="Sales, IT, HR, etc."
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Position/Designation</Label>
                    <Input
                      value={formData.position}
                      onChange={(e) => handleChange('position', e.target.value)}
                      placeholder="Manager, Developer, etc."
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Job Title</Label>
                    <Input
                      value={formData.job_title}
                      onChange={(e) => handleChange('job_title', e.target.value)}
                      placeholder="Senior Software Engineer"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Hire Date</Label>
                    <Input
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => handleChange('hire_date', e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Probation Status</Label>
                    <Select value={formData.probation_status} onValueChange={(v) => handleChange('probation_status', v)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on_probation">On Probation</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="extended">Extended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Probation End Date</Label>
                    <Input
                      type="date"
                      value={formData.probation_end_date}
                      onChange={(e) => handleChange('probation_end_date', e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Base Salary (PKR)</Label>
                    <Input
                      type="number"
                      value={formData.base_salary}
                      onChange={(e) => handleChange('base_salary', e.target.value)}
                      placeholder="50000"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Commission Rate (%)</Label>
                    <Input
                      type="number"
                      value={formData.commission_rate}
                      onChange={(e) => handleChange('commission_rate', e.target.value)}
                      placeholder="5"
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Banking Information</h3>
                  </div>

                  <div>
                    <Label>Bank Name</Label>
                    <Input
                      value={formData.bank_name}
                      onChange={(e) => handleChange('bank_name', e.target.value)}
                      placeholder="HBL, UBL, MCB, etc."
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Account Number</Label>
                    <Input
                      value={formData.bank_account_number}
                      onChange={(e) => handleChange('bank_account_number', e.target.value)}
                      placeholder="1234567890"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Account Title</Label>
                    <Input
                      value={formData.bank_account_title}
                      onChange={(e) => handleChange('bank_account_title', e.target.value)}
                      placeholder="Account holder name"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Tax ID / NTN</Label>
                    <Input
                      value={formData.tax_id}
                      onChange={(e) => handleChange('tax_id', e.target.value)}
                      placeholder="1234567-8"
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Education & Experience</h3>
                  </div>

                  <div>
                    <Label>Education Level</Label>
                    <Input
                      value={formData.education_level}
                      onChange={(e) => handleChange('education_level', e.target.value)}
                      placeholder="Bachelor's, Master's, etc."
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>University</Label>
                    <Input
                      value={formData.university}
                      onChange={(e) => handleChange('university', e.target.value)}
                      placeholder="University name"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Degree</Label>
                    <Input
                      value={formData.degree}
                      onChange={(e) => handleChange('degree', e.target.value)}
                      placeholder="BS Computer Science"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Graduation Year</Label>
                    <Input
                      type="number"
                      value={formData.graduation_year}
                      onChange={(e) => handleChange('graduation_year', e.target.value)}
                      placeholder="2020"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Previous Company</Label>
                    <Input
                      value={formData.previous_company}
                      onChange={(e) => handleChange('previous_company', e.target.value)}
                      placeholder="Company name"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Previous Position</Label>
                    <Input
                      value={formData.previous_position}
                      onChange={(e) => handleChange('previous_position', e.target.value)}
                      placeholder="Job title"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Years of Experience</Label>
                    <Input
                      type="number"
                      value={formData.years_of_experience}
                      onChange={(e) => handleChange('years_of_experience', e.target.value)}
                      placeholder="5"
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Skills (comma separated)</Label>
                    <Input
                      value={formData.skills}
                      onChange={(e) => handleChange('skills', e.target.value)}
                      placeholder="JavaScript, React, Node.js"
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Certifications (comma separated)</Label>
                    <Input
                      value={formData.certifications}
                      onChange={(e) => handleChange('certifications', e.target.value)}
                      placeholder="AWS Certified, PMP"
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Languages (comma separated)</Label>
                    <Input
                      value={formData.languages}
                      onChange={(e) => handleChange('languages', e.target.value)}
                      placeholder="English, Urdu, Arabic"
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Additional Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      placeholder="Any additional information"
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Documents */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Employee Documents</h2>
                  <p className="text-gray-600">Upload and manage employee documents</p>
                </div>

                {/* Upload Sections */}
                <div className="grid grid-cols-1 gap-4">
                  {/* CNIC Picture */}
                  <Card className="border-2 border-dashed hover:border-blue-400 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">CNIC Picture</p>
                            <p className="text-xs text-gray-500">Upload front and back of CNIC</p>
                          </div>
                        </div>
                        <input
                          type="file"
                          id="cnic-upload"
                          accept="image/*,.pdf"
                          onChange={(e) => e.target.files && handleDocumentUpload(e.target.files[0], 'cnic')}
                          className="hidden"
                          disabled={uploadingDoc}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => document.getElementById('cnic-upload')?.click()}
                          disabled={uploadingDoc}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Profile Picture */}
                  <Card className="border-2 border-dashed hover:border-blue-400 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">Profile Picture</p>
                            <p className="text-xs text-gray-500">Upload employee photo</p>
                          </div>
                        </div>
                        <input
                          type="file"
                          id="profile-upload"
                          accept="image/*"
                          onChange={(e) => e.target.files && handleDocumentUpload(e.target.files[0], 'profile_picture')}
                          className="hidden"
                          disabled={uploadingDoc}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => document.getElementById('profile-upload')?.click()}
                          disabled={uploadingDoc}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Educational Documents */}
                  <Card className="border-2 border-dashed hover:border-blue-400 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="font-medium">Educational Documents</p>
                            <p className="text-xs text-gray-500">Degrees, certificates, transcripts</p>
                          </div>
                        </div>
                        <input
                          type="file"
                          id="edu-upload"
                          accept=".pdf,.jpg,.jpeg,.png,.docx"
                          onChange={(e) => e.target.files && handleDocumentUpload(e.target.files[0], 'education')}
                          className="hidden"
                          disabled={uploadingDoc}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => document.getElementById('edu-upload')?.click()}
                          disabled={uploadingDoc}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Experience Letters */}
                  <Card className="border-2 border-dashed hover:border-blue-400 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="font-medium">Experience Letters</p>
                            <p className="text-xs text-gray-500">Previous employment letters</p>
                          </div>
                        </div>
                        <input
                          type="file"
                          id="exp-upload"
                          accept=".pdf,.jpg,.jpeg,.png,.docx"
                          onChange={(e) => e.target.files && handleDocumentUpload(e.target.files[0], 'experience')}
                          className="hidden"
                          disabled={uploadingDoc}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => document.getElementById('exp-upload')?.click()}
                          disabled={uploadingDoc}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Other Documents */}
                  <Card className="border-2 border-dashed hover:border-blue-400 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium">Other Documents</p>
                            <p className="text-xs text-gray-500">Contracts, NDA, certificates, etc.</p>
                          </div>
                        </div>
                        <input
                          type="file"
                          id="other-upload"
                          accept=".pdf,.jpg,.jpeg,.png,.docx"
                          onChange={(e) => e.target.files && handleDocumentUpload(e.target.files[0], 'other')}
                          className="hidden"
                          disabled={uploadingDoc}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => document.getElementById('other-upload')?.click()}
                          disabled={uploadingDoc}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Uploaded Documents List */}
                {documents.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Uploaded Documents ({documents.length})</h3>
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <Card key={doc.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium truncate">{doc.document_name}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {doc.document_type}
                                    </Badge>
                                    {doc.uploaded_at && (
                                      <span className="text-xs text-gray-500">
                                        {format(new Date(doc.uploaded_at), 'MMM d, yyyy')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => window.open(doc.file_path, '_blank')}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteDocument(doc.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {uploadingDoc && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">Uploading document...</span>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/hrms/employees')}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {currentStep === 1 ? 'Cancel' : 'Previous'}
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4" />
                  {loading ? 'Updating...' : 'Update Employee'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

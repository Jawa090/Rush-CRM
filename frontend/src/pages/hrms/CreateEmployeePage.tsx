import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Building2, FileText, Upload, Save, ChevronRight, ChevronLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function CreateEmployeePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    cnic_picture: File | null;
    profile_picture: File | null;
    educational_docs: File[];
    experience_letters: File[];
    resume: File | null;
    other_docs: File[];
  }>({
    cnic_picture: null,
    profile_picture: null,
    educational_docs: [],
    experience_letters: [],
    resume: null,
    other_docs: [],
  });
  
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

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (type: string, files: FileList | null) => {
    if (!files) return;
    
    if (type === 'cnic_picture' || type === 'profile_picture' || type === 'resume') {
      setUploadedFiles(prev => ({ ...prev, [type]: files[0] }));
    } else {
      const fileArray = Array.from(files);
      setUploadedFiles(prev => ({ 
        ...prev, 
        [type]: [...(prev[type as keyof typeof prev] as File[]), ...fileArray] 
      }));
    }
  };

  const removeFile = (type: string, index?: number) => {
    if (type === 'cnic_picture' || type === 'profile_picture' || type === 'resume') {
      setUploadedFiles(prev => ({ ...prev, [type]: null }));
    } else if (index !== undefined) {
      setUploadedFiles(prev => ({
        ...prev,
        [type]: (prev[type as keyof typeof prev] as File[]).filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async () => {
    // Only first_name, last_name, and email are required
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error('Please fill in required fields', {
        description: 'First name, last name, and email are required'
      });
      return;
    }

    setLoading(true);
    try {
      // Clean up formData - remove empty strings and convert types
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

      // Convert comma-separated strings to arrays for skills, certifications, languages
      if (cleanedData.skills) {
        cleanedData.skills = cleanedData.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      if (cleanedData.certifications) {
        cleanedData.certifications = cleanedData.certifications.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      if (cleanedData.languages) {
        cleanedData.languages = cleanedData.languages.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      await api.post('/employees', cleanedData);
      
      toast.success('Employee created successfully!', {
        description: 'You can edit and add documents anytime'
      });
      navigate('/hrms/employees');
    } catch (error: any) {
      console.error('Error creating employee:', error);
      toast.error('Failed to create employee', {
        description: error?.message || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Basic Info', icon: User },
    { id: 2, title: 'Personal Details', icon: FileText },
    { id: 3, title: 'Employment', icon: Building2 },
    { id: 4, title: 'Documents', icon: Upload },
  ];

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
              <h1 className="text-3xl font-bold text-gray-900">Add New Employee</h1>
              <p className="text-gray-600 mt-1">Complete employee information and documentation</p>
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
                  <p className="text-gray-600">Enter employee's basic contact details</p>
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
                </div>
              </div>
            )}

            {/* Step 4: Documents Upload */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Employee Documents</h2>
                  <p className="text-gray-600">Upload important documents and certificates (Optional - can be added later)</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* CNIC Picture Upload */}
                  <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">CNIC Picture</h3>
                          <p className="text-sm text-gray-600">Upload front and back of CNIC</p>
                          {uploadedFiles.cnic_picture && (
                            <p className="text-sm text-green-600 mt-1">✓ {uploadedFiles.cnic_picture.name}</p>
                          )}
                        </div>
                        <input
                          type="file"
                          id="cnic-upload"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload('cnic_picture', e.target.files)}
                          className="hidden"
                        />
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => document.getElementById('cnic-upload')?.click()}
                        >
                          <Upload className="h-4 w-4" />
                          {uploadedFiles.cnic_picture ? 'Change' : 'Upload CNIC'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Profile Picture Upload */}
                  <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <User className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">Profile Picture</h3>
                          <p className="text-sm text-gray-600">Upload employee photo</p>
                          {uploadedFiles.profile_picture && (
                            <p className="text-sm text-green-600 mt-1">✓ {uploadedFiles.profile_picture.name}</p>
                          )}
                        </div>
                        <input
                          type="file"
                          id="profile-upload"
                          accept="image/*"
                          onChange={(e) => handleFileUpload('profile_picture', e.target.files)}
                          className="hidden"
                        />
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => document.getElementById('profile-upload')?.click()}
                        >
                          <Upload className="h-4 w-4" />
                          {uploadedFiles.profile_picture ? 'Change' : 'Upload Photo'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Educational Documents */}
                  <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">Educational Documents</h3>
                          <p className="text-sm text-gray-600">Degrees, certificates, transcripts</p>
                          {uploadedFiles.educational_docs.length > 0 && (
                            <p className="text-sm text-green-600 mt-1">✓ {uploadedFiles.educational_docs.length} file(s) selected</p>
                          )}
                        </div>
                        <input
                          type="file"
                          id="edu-upload"
                          accept=".pdf,.jpg,.jpeg,.png,.docx"
                          multiple
                          onChange={(e) => handleFileUpload('educational_docs', e.target.files)}
                          className="hidden"
                        />
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => document.getElementById('edu-upload')?.click()}
                        >
                          <Upload className="h-4 w-4" />
                          Upload Documents
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Experience Letters */}
                  <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                          <Building2 className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">Experience Letters</h3>
                          <p className="text-sm text-gray-600">Previous employment letters</p>
                          {uploadedFiles.experience_letters.length > 0 && (
                            <p className="text-sm text-green-600 mt-1">✓ {uploadedFiles.experience_letters.length} file(s) selected</p>
                          )}
                        </div>
                        <input
                          type="file"
                          id="exp-upload"
                          accept=".pdf,.jpg,.jpeg,.png,.docx"
                          multiple
                          onChange={(e) => handleFileUpload('experience_letters', e.target.files)}
                          className="hidden"
                        />
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => document.getElementById('exp-upload')?.click()}
                        >
                          <Upload className="h-4 w-4" />
                          Upload Letters
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Resume/CV */}
                  <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 rounded-lg">
                          <FileText className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">Resume / CV</h3>
                          <p className="text-sm text-gray-600">Upload latest resume</p>
                          {uploadedFiles.resume && (
                            <p className="text-sm text-green-600 mt-1">✓ {uploadedFiles.resume.name}</p>
                          )}
                        </div>
                        <input
                          type="file"
                          id="resume-upload"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload('resume', e.target.files)}
                          className="hidden"
                        />
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => document.getElementById('resume-upload')?.click()}
                        >
                          <Upload className="h-4 w-4" />
                          {uploadedFiles.resume ? 'Change' : 'Upload Resume'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Other Documents */}
                  <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-lg">
                          <FileText className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">Other Documents</h3>
                          <p className="text-sm text-gray-600">Contracts, NDA, medical certificates, etc.</p>
                          {uploadedFiles.other_docs.length > 0 && (
                            <p className="text-sm text-green-600 mt-1">✓ {uploadedFiles.other_docs.length} file(s) selected</p>
                          )}
                        </div>
                        <input
                          type="file"
                          id="other-upload"
                          accept=".pdf,.jpg,.jpeg,.png,.docx"
                          multiple
                          onChange={(e) => handleFileUpload('other_docs', e.target.files)}
                          className="hidden"
                        />
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => document.getElementById('other-upload')?.click()}
                        >
                          <Upload className="h-4 w-4" />
                          Upload Files
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Info Box */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg h-fit">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-2">Document Upload Guidelines</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Supported formats: PDF, JPG, PNG, DOCX</li>
                            <li>• Maximum file size: 10MB per document</li>
                            <li>• <strong>Documents are optional</strong> - you can skip and add later</li>
                            <li>• You can edit employee details and upload documents anytime</li>
                            <li>• All documents are securely stored and encrypted</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                  {loading ? 'Creating...' : 'Create Employee'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

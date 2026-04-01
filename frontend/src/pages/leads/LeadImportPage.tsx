import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface FieldMapping {
  [csvField: string]: string | null;
}

interface DetectedFields {
  fileName: string;
  filePath: string;
  headers: string[];
  sampleData: any[];
  suggestedMappings: FieldMapping;
  totalRows: number;
}

export default function LeadImportPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'upload' | 'mapping' | 'importing' | 'complete'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [detectedFields, setDetectedFields] = useState<DetectedFields | null>(null);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [workspaceId, setWorkspaceId] = useState<string>('');
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importResult, setImportResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const availableFields = [
    { value: 'title', label: 'Lead Name/Title/Caller' },
    { value: 'email', label: 'Email Address' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'company', label: 'Company Name' },
    { value: 'companyEmail', label: 'Company Email' },
    { value: 'companyPhone', label: 'Company Phone' },
    { value: 'designation', label: 'Designation/Job Title' },
    { value: 'source', label: 'Lead Source/First Intent' },
    { value: 'status', label: 'Status/Current Status/Stage' },
    { value: 'value', label: 'Deal Value/Offer Amount' },
    { value: 'website', label: 'Website URL' },
    { value: 'address', label: 'Address/Location/City' },
    { value: 'notes', label: 'Notes/Leads Notes/Description' },
    { value: 'agentName', label: 'Agent/Sales Rep/Handler' },
    { value: 'serviceInterested', label: 'Service/Product Interested' },
    { value: 'companySize', label: 'Company Size/Employees' },
    { value: 'decisionMaker', label: 'Decision Maker' },
    { value: 'interactionNotes', label: 'Interaction/First Reply/Last Reply' },
    { value: 'industry', label: 'Industry/Sector' },
    { value: 'country', label: 'Country' },
    { value: 'city', label: 'City' },
    { value: 'state', label: 'State/Province' },
    { value: 'zipCode', label: 'Zip/Postal Code' },
    { value: 'linkedIn', label: 'LinkedIn Profile' },
    { value: 'facebook', label: 'Facebook Profile' },
    { value: 'twitter', label: 'Twitter Handle' },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const data = await api.post<DetectedFields>('/lead-import/detect-fields', formData);
      
      console.log('Detected fields:', data); // Debug

      setDetectedFields(data);
      setFieldMapping(data.suggestedMappings || {});
      setStep('mapping');
    } catch (error: any) {
      console.error('Error detecting fields:', error);
      const errorMessage = error?.message || 'Failed to process file';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!detectedFields) return;

    setLoading(true);
    setStep('importing');

    try {
      const data = await api.post<any>('/lead-import', {
        filePath: detectedFields.filePath,
        fieldMapping,
        workspaceId: workspaceId || null,
        skipDuplicates
      });

      setImportResult(data);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setStep('complete');
    } catch (error: any) {
      console.error('Error importing leads:', error);
      toast.error('Failed to import leads');
      setStep('mapping');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Import Leads</h1>
        <p className="text-gray-600">Upload CSV or Excel file to import leads</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-center space-x-4">
        <div className={`flex items-center ${step === 'upload' ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'upload' ? 'bg-primary text-white' : 'bg-gray-200'
          }`}>1</div>
          <span className="ml-2 font-medium">Upload File</span>
        </div>
        <ArrowRight className="text-gray-400" />
        <div className={`flex items-center ${step === 'mapping' ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'mapping' ? 'bg-primary text-white' : 'bg-gray-200'
          }`}>2</div>
          <span className="ml-2 font-medium">Map Fields</span>
        </div>
        <ArrowRight className="text-gray-400" />
        <div className={`flex items-center ${step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-200'
          }`}>3</div>
          <span className="ml-2 font-medium">Complete</span>
        </div>
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your file</h3>
            <p className="text-gray-600 mb-6 font-medium">CSV or Excel files up to 10MB</p>
            <label className="inline-flex items-center px-6 py-2.5 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-all shadow-md active:scale-95">
              <FileSpreadsheet className="mr-2 h-5 w-5" />
              Choose File
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                disabled={loading}
              />
            </label>
            {loading && <p className="mt-4 text-gray-600">Processing file...</p>}
          </div>
        </div>
      )}

      {/* Step 2: Field Mapping */}
      {step === 'mapping' && detectedFields && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Map Your Fields</h2>
          <p className="text-gray-600 mb-6">
            Match your file columns to CRM fields. We've suggested mappings based on column names.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Import to Workspace (Optional)
            </label>
            <input
              type="text"
              placeholder="Leave empty for organization-wide"
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {detectedFields.headers.map((header) => (
              <div key={header} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {header}
                  </label>
                  {detectedFields.sampleData[0]?.[header] && (
                    <p className="text-xs text-gray-500">
                      Example: {String(detectedFields.sampleData[0][header]).substring(0, 50)}
                      {String(detectedFields.sampleData[0][header]).length > 50 ? '...' : ''}
                    </p>
                  )}
                </div>
                <ArrowRight className="text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                    <select
                    value={fieldMapping[header] || ''}
                    onChange={(e) => setFieldMapping({ ...fieldMapping, [header]: e.target.value || null })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="">Skip this field</option>
                    <optgroup label="Standard Fields">
                      {availableFields.map((field) => (
                        <option key={field.value} value={field.value}>
                          {field.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Skip duplicate leads (based on email)</span>
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setStep('upload')}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleImport}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all shadow-md active:scale-[0.98] font-semibold"
            >
              {loading ? 'Importing...' : 'Import Leads'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 'complete' && importResult && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center mb-6">
            <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Import Complete!</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{importResult.successful}</div>
              <div className="text-sm text-gray-600">Imported</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">{importResult.duplicates}</div>
              <div className="text-sm text-gray-600">Duplicates Skipped</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">{importResult.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>

          {importResult.errors && importResult.errors.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-red-700">Errors:</h3>
              <div className="bg-red-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                {importResult.errors.map((err: any, idx: number) => (
                  <div key={idx} className="text-sm text-red-700 mb-1">
                    Row {err.row}: {err.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {importResult.successful > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-900">Successfully Imported Leads</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="text-sm text-gray-600 mb-2">
                  {importResult.successful} lead(s) have been imported with all their information including:
                </div>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                  <li>Contact Information (Name, Email, Phone)</li>
                  <li>Company Details</li>
                  <li>Lead Status & Source</li>
                  <li>Custom Fields & Notes</li>
                  <li>All mapped data from your file</li>
                </ul>
                <div className="mt-4 p-3 bg-primary/10 rounded border border-primary/20">
                  <p className="text-sm text-primary font-medium">
                    💡 All imported leads are now available in your CRM with complete information. 
                    Click "View Leads" below to see them.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={() => {
                setStep('upload');
                setFile(null);
                setDetectedFields(null);
                setImportResult(null);
              }}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Import More
            </button>
            <button
              onClick={() => navigate('/crm/leads')}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-md active:scale-[0.98] font-semibold"
            >
              View All Leads
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

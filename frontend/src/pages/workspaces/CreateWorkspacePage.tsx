import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Lock, Globe, Building2, Plus, CheckCircle, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function CreateWorkspacePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: 'team',
    description: '',
    visibility: 'private'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/workgroups', {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        visibility: formData.visibility
      });

      toast.success('Workspace created successfully!', {
        description: `${formData.name} is now ready to use`
      });
      
      // Navigate to leads page with the new workspace selected
      navigate('/crm/leads');
    } catch (error: any) {
      console.error('Error creating workspace:', error);
      toast.error('Failed to create workspace', {
        description: error?.message || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const workspaceTypes = [
    {
      value: 'team',
      label: 'Team Workspace',
      icon: <Users className="h-6 w-6" />,
      description: 'Perfect for team collaboration and shared leads',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600'
    },
    {
      value: 'department',
      label: 'Department',
      icon: <Building2 className="h-6 w-6" />,
      description: 'Organize by department for better structure',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600'
    },
    {
      value: 'project',
      label: 'Project',
      icon: <CheckCircle className="h-6 w-6" />,
      description: 'Dedicated space for project-specific leads',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600'
    },
    {
      value: 'private',
      label: 'Private',
      icon: <Lock className="h-6 w-6" />,
      description: 'Personal workspace for your leads only',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-600'
    }
  ];

  const visibilityOptions = [
    {
      value: 'private',
      label: 'Private Workspace',
      icon: <Lock className="h-5 w-5" />,
      description: 'Only invited members can see and access this workspace',
      color: 'from-orange-500 to-red-500'
    },
    {
      value: 'public',
      label: 'Public Workspace',
      icon: <Globe className="h-5 w-5" />,
      description: 'All organization members can discover and request access',
      color: 'from-blue-500 to-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/crm/leads')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Leads
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Workspace</h1>
              <p className="text-gray-600 mt-1">Set up a dedicated space to organize and manage your leads</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Workspace Name */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="text-xl">Workspace Details</CardTitle>
              <CardDescription>Give your workspace a name and description</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label className="text-base font-semibold text-gray-700 mb-2 block">
                  Workspace Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sales Team, Marketing Department, Q1 Project"
                  className="h-12 text-base"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Choose a clear, descriptive name that helps team members understand the workspace purpose
                </p>
              </div>

              <div>
                <Label className="text-base font-semibold text-gray-700 mb-2 block">
                  Description (Optional)
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the purpose of this workspace and what types of leads it will contain..."
                  className="min-h-[120px] resize-none text-base"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Help team members understand what this workspace is for and how to use it
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Workspace Type */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="text-xl">Workspace Type</CardTitle>
              <CardDescription>Choose the type that best fits your needs</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workspaceTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-lg ${
                      formData.type === type.value
                        ? `${type.borderColor} ${type.bgColor} shadow-lg ring-2 ring-offset-2 ring-${type.value}-500`
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${type.color} shadow-md`}>
                        <div className="text-white">
                          {type.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-gray-900 text-lg">
                            {type.label}
                          </h4>
                          {formData.type === type.value && (
                            <CheckCircle className={`h-5 w-5 ${type.textColor} flex-shrink-0`} />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Visibility */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="text-xl">Visibility & Access</CardTitle>
              <CardDescription>Control who can see and access this workspace</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {visibilityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, visibility: option.value })}
                    className={`w-full p-6 border-2 rounded-xl text-left transition-all hover:shadow-lg ${
                      formData.visibility === option.value
                        ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-500 ring-offset-2'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${option.color} shadow-md`}>
                        <div className="text-white">
                          {option.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 text-lg">
                            {option.label}
                          </h4>
                          {formData.visibility === option.value && (
                            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Info Box */}
          <Card className="shadow-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="p-3 bg-blue-500 rounded-xl h-fit shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 text-lg mb-2">
                    What happens after creation?
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>You'll be automatically added as the workspace owner with full permissions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>You can invite team members to collaborate and manage leads together</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Leads can be assigned to this workspace for complete isolation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Only workspace members will be able to see and access workspace leads</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/crm/leads')}
              disabled={loading}
              className="px-8 h-12 text-base"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-8 h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Workspace...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Create Workspace
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

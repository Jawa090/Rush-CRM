import React, { useState } from 'react';
import { X, Users, Lock, Globe, Building2, Plus, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface CreateWorkspaceModalProps {
  onClose: () => void;
  onSuccess?: (workspace: any) => void;
}

export function CreateWorkspaceModal({ onClose, onSuccess }: CreateWorkspaceModalProps) {
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
      
      onSuccess?.(response);
      onClose();
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
      icon: <Users className="h-5 w-5" />,
      description: 'For team collaboration and shared leads',
      color: 'text-blue-600'
    },
    {
      value: 'department',
      label: 'Department',
      icon: <Building2 className="h-5 w-5" />,
      description: 'For department-level organization',
      color: 'text-purple-600'
    },
    {
      value: 'project',
      label: 'Project',
      icon: <CheckCircle className="h-5 w-5" />,
      description: 'For project-specific leads',
      color: 'text-green-600'
    },
    {
      value: 'private',
      label: 'Private',
      icon: <Lock className="h-5 w-5" />,
      description: 'Personal workspace for your leads only',
      color: 'text-red-600'
    }
  ];

  const visibilityOptions = [
    {
      value: 'private',
      label: 'Private',
      icon: <Lock className="h-4 w-4" />,
      description: 'Only invited members can see this workspace'
    },
    {
      value: 'public',
      label: 'Public',
      icon: <Globe className="h-4 w-4" />,
      description: 'All organization members can see this workspace'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 relative z-[10000]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create New Workspace</h2>
              <p className="text-sm text-blue-100">Organize your leads with dedicated workspaces</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Workspace Name */}
          <div className="mb-6">
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Workspace Name <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Sales Team, Marketing Department, Q1 Project"
              className="h-11 text-base"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Choose a clear, descriptive name for your workspace
            </p>
          </div>

          {/* Workspace Type */}
          <div className="mb-6">
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">
              Workspace Type
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {workspaceTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`p-4 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                    formData.type === type.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`${type.color} mt-0.5`}>
                      {type.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">
                        {type.label}
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {type.description}
                      </p>
                    </div>
                    {formData.type === type.value && (
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Description (Optional)
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the purpose of this workspace..."
              className="min-h-[100px] resize-none text-base"
            />
            <p className="text-xs text-gray-500 mt-1">
              Help team members understand what this workspace is for
            </p>
          </div>

          {/* Visibility */}
          <div className="mb-6">
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">
              Visibility
            </Label>
            <div className="space-y-3">
              {visibilityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, visibility: option.value })}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                    formData.visibility === option.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      formData.visibility === option.value
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm mb-0.5">
                        {option.label}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {option.description}
                      </p>
                    </div>
                    {formData.visibility === option.value && (
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
            <div className="flex gap-3">
              <div className="p-2 bg-blue-100 rounded-lg h-fit">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 text-sm mb-1">
                  What happens after creation?
                </h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• You'll be automatically added as the workspace owner</li>
                  <li>• You can invite team members to collaborate</li>
                  <li>• Leads can be assigned to this workspace for isolation</li>
                  <li>• Only workspace members can see workspace leads</li>
                </ul>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-2xl">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim()}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Workspace
              </>
            )}
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}

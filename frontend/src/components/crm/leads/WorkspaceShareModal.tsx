import React, { useState, useEffect } from 'react';
import { X, Users, Shield, Clock, Trash2, Plus, CheckCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCustomDialog } from '@/contexts/DialogContext';

interface Workspace {
  id: string;
  name: string;
  type: string;
  description?: string;
}

interface SharedWorkspace {
  id: string;
  workspace_id: string;
  workspace_name: string;
  workspace_type: string;
  access_level: string;
  granted_at: string;
  expires_at?: string;
  granted_by_email?: string;
}

interface WorkspaceShareModalProps {
  leadId: string;
  leadTitle: string;
  currentWorkspaceName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function WorkspaceShareModal({ 
  leadId, 
  leadTitle, 
  currentWorkspaceName,
  onClose, 
  onSuccess 
}: WorkspaceShareModalProps) {
  const [availableWorkspaces, setAvailableWorkspaces] = useState<Workspace[]>([]);
  const [sharedWorkspaces, setSharedWorkspaces] = useState<SharedWorkspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [accessLevel, setAccessLevel] = useState<string>('view');
  const [expiresIn, setExpiresIn] = useState<string>('never');
  const [loading, setLoading] = useState(false);
  const { confirm } = useCustomDialog();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [leadId]);

  const fetchData = async () => {
    try {
      const [available, shared] = await Promise.all([
        api.get(`/lead-workspace/${leadId}/available-workspaces`) as Promise<Workspace[]>,
        api.get(`/lead-workspace/${leadId}/shared-workspaces`) as Promise<SharedWorkspace[]>
      ]);
      setAvailableWorkspaces(available);
      setSharedWorkspaces(shared);
    } catch (error) {
      console.error('Error fetching workspace data:', error);
      toast.error('Failed to load workspace data');
    }
  };

  const handleShare = async () => {
    if (!selectedWorkspace) {
      toast.error('Please select a workspace');
      return;
    }

    setLoading(true);
    try {
      let expiresAt = null;
      if (expiresIn !== 'never') {
        const days = parseInt(expiresIn);
        const date = new Date();
        date.setDate(date.getDate() + days);
        expiresAt = date.toISOString();
      }

      await api.post(`/lead-workspace/${leadId}/share`, {
        workspaceId: selectedWorkspace,
        accessLevel,
        expiresAt
      });

      toast.success('Lead shared successfully', {
        description: 'The workspace now has access to this lead'
      });
      
      setSelectedWorkspace('');
      setAccessLevel('view');
      setExpiresIn('never');
      fetchData();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error sharing lead:', error);
      toast.error('Failed to share lead', {
        description: error?.message || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAccess = async (workspaceId: string, workspaceName: string) => {
    if (!await confirm(`Remove access for "${workspaceName}"?`, { variant: 'destructive', title: 'Remove Access' })) return;

    try {
      await api.delete(`/lead-workspace/${leadId}/workspace/${workspaceId}`);
      toast.success('Access removed successfully');
      fetchData();
      onSuccess?.();
    } catch (error) {
      console.error('Error removing access:', error);
      toast.error('Failed to remove access');
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'view': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'edit': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'full': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'view': return '👁️';
      case 'edit': return '✏️';
      case 'full': return '🔓';
      default: return '🔒';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden relative z-[10000]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Workspace Access Control</h2>
              <p className="text-sm text-blue-100">Manage who can access this lead</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Lead Info */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{leadTitle}</h3>
                {currentWorkspaceName && (
                  <p className="text-sm text-gray-600">
                    Primary Workspace: <span className="font-medium text-blue-600">{currentWorkspaceName}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Share with New Workspace */}
          <div className="mb-8 p-6 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Share with Another Workspace
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Workspace
                </Label>
                <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                  <SelectTrigger className="w-full h-11 border-gray-300">
                    <SelectValue placeholder="Choose a workspace..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWorkspaces.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No available workspaces to share with
                      </div>
                    ) : (
                      availableWorkspaces.map((workspace) => (
                        <SelectItem key={workspace.id} value={workspace.id}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{workspace.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {workspace.type}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                    
                    {/* Create New Workspace Option */}
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate('/workspaces/create');
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-blue-50 rounded-md transition-colors flex items-center gap-2 text-blue-600 font-medium text-sm"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Create New Workspace
                      </button>
                    </div>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Access Level
                  </Label>
                  <Select value={accessLevel} onValueChange={setAccessLevel}>
                    <SelectTrigger className="w-full h-11 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">
                        <div className="flex items-center gap-2">
                          <span>👁️</span>
                          <div>
                            <div className="font-medium">View Only</div>
                            <div className="text-xs text-gray-500">Can only view lead details</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="edit">
                        <div className="flex items-center gap-2">
                          <span>✏️</span>
                          <div>
                            <div className="font-medium">Edit</div>
                            <div className="text-xs text-gray-500">Can view and edit lead</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="full">
                        <div className="flex items-center gap-2">
                          <span>🔓</span>
                          <div>
                            <div className="font-medium">Full Access</div>
                            <div className="text-xs text-gray-500">Can view, edit, and delete</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Access Duration
                  </Label>
                  <Select value={expiresIn} onValueChange={setExpiresIn}>
                    <SelectTrigger className="w-full h-11 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Permanent</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                      <SelectItem value="180">6 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleShare}
                disabled={loading || !selectedWorkspace}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {loading ? 'Sharing...' : 'Share Lead'}
              </Button>
            </div>
          </div>

          {/* Currently Shared Workspaces */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Currently Shared With ({sharedWorkspaces.length})
            </h3>
            
            {sharedWorkspaces.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Not shared with any workspace yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  This lead is only visible to its primary workspace
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sharedWorkspaces.map((shared) => (
                  <div
                    key={shared.id}
                    className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{shared.workspace_name}</h4>
                            <Badge className={`text-xs ${getAccessLevelColor(shared.access_level)}`}>
                              {getAccessLevelIcon(shared.access_level)} {shared.access_level}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Shared {new Date(shared.granted_at).toLocaleDateString()}
                            </span>
                            {shared.expires_at && (
                              <span className="text-orange-600 font-medium">
                                Expires {new Date(shared.expires_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAccess(shared.workspace_id, shared.workspace_name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

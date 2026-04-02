import React, { useState, useEffect } from 'react';
import { Users, Building2, Lock, Globe, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Workspace {
  id: string;
  name: string;
  type: string;
  member_count?: number;
}

interface WorkspaceFilterProps {
  value: string;
  onChange: (workspaceId: string) => void;
  className?: string;
}

export function WorkspaceFilter({ value, onChange, className }: WorkspaceFilterProps) {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await api.get('/workgroups');
      setWorkspaces(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  const getWorkspaceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'private': return <Lock className="h-4 w-4" />;
      case 'public': return <Globe className="h-4 w-4" />;
      case 'team': return <Users className="h-4 w-4" />;
      default: return <Building2 className="h-4 w-4" />;
    }
  };

  const getWorkspaceColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'private': return 'text-red-600';
      case 'public': return 'text-green-600';
      case 'team': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50">
        <Users className="h-4 w-4 text-gray-400 animate-pulse" />
        <span className="text-sm text-gray-500">Loading workspaces...</span>
      </div>
    );
  }

  return (
    <>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`h-10 min-w-[200px] ${className}`}>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <SelectValue placeholder="All Workspaces" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <span className="font-medium">All Workspaces</span>
              <Badge variant="outline" className="ml-2 text-xs">
                Organization-wide
              </Badge>
            </div>
          </SelectItem>
          
          {workspaces.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Your Workspaces
              </div>
              {workspaces.map((workspace) => (
                <SelectItem key={workspace.id} value={workspace.id}>
                  <div className="flex items-center gap-2">
                    <span className={getWorkspaceColor(workspace.type)}>
                      {getWorkspaceIcon(workspace.type)}
                    </span>
                    <span className="font-medium">{workspace.name}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {workspace.type || 'workspace'}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </>
          )}
          
          {/* Create New Workspace Button */}
          <div className="border-t border-gray-200 mt-2 pt-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate('/workspaces/create');
              }}
              className="w-full px-3 py-2 text-left hover:bg-blue-50 rounded-md transition-colors flex items-center gap-2 text-blue-600 font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              Create New Workspace
            </button>
          </div>
          
          {workspaces.length === 0 && (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="font-medium">No workspaces found</p>
              <p className="text-xs mt-1">Create your first workspace to get started</p>
            </div>
          )}
        </SelectContent>
      </Select>
    </>
  );
}

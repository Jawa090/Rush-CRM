import React, { useState, useEffect } from 'react';
import { Plus, Globe, Key, Copy, Check, Trash2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

interface ExternalSource {
  id: string;
  source_name: string;
  source_type: string;
  source_url: string;
  api_key: string;
  webhook_url: string;
  is_active: boolean;
  total_leads_received: number;
  last_sync_at: string;
  workspace_name?: string;
}

export default function ExternalSourcesPage() {
  const navigate = useNavigate();
  const [sources, setSources] = useState<ExternalSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<ExternalSource | null>(null);
  const [sourceLeads, setSourceLeads] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(false);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const response = await api.get('/lead-external-sources');
      setSources(response);
    } catch (error) {
      console.error('Error fetching sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSourceLeads = async (sourceId: string) => {
    setLeadsLoading(true);
    try {
      const response = await api.get(`/leads?external_source_id=${sourceId}`);
      setSourceLeads(response.data || response);
    } catch (error) {
      console.error('Error fetching source leads:', error);
      setSourceLeads([]);
    } finally {
      setLeadsLoading(false);
    }
  };

  const handleSourceClick = (source: ExternalSource) => {
    setSelectedSource(source);
    fetchSourceLeads(source.id);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await api.put(`/lead-external-sources/${id}`, { isActive: !isActive });
      fetchSources();
    } catch (error) {
      console.error('Error toggling source:', error);
    }
  };

  const regenerateKey = async (id: string) => {
    if (!confirm('Are you sure? This will invalidate the current API key.')) return;
    
    try {
      await api.post(`/lead-external-sources/${id}/regenerate-key`);
      fetchSources();
      alert('API key regenerated successfully');
    } catch (error) {
      console.error('Error regenerating key:', error);
    }
  };

  const deleteSource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this source?')) return;
    
    try {
      await api.delete(`/lead-external-sources/${id}`);
      fetchSources();
    } catch (error) {
      console.error('Error deleting source:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">External Lead Sources</h1>
          <p className="text-gray-600">Connect websites and external systems to receive leads</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Source
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : sources.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No external sources yet</h3>
          <p className="text-gray-600 mb-4">
            Connect your website or external systems to automatically receive leads
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Your First Source
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Sources List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Sources</h2>
            {sources.map((source) => (
              <div
                key={source.id}
                onClick={() => handleSourceClick(source)}
                className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedSource?.id === source.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{source.source_name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    source.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {source.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{source.source_type}</span>
                  <span className="font-semibold text-blue-600">{source.total_leads_received} leads</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Source Details & Leads */}
          <div className="lg:col-span-2">
            {selectedSource ? (
              <div className="space-y-6">
                {/* Source Details */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">{selectedSource.source_name}</h2>
                      {selectedSource.source_url && (
                        <p className="text-sm text-gray-600">{selectedSource.source_url}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleActive(selectedSource.id, selectedSource.is_active)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        title={selectedSource.is_active ? 'Deactivate' : 'Activate'}
                      >
                        <RefreshCw className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => deleteSource(selectedSource.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={selectedSource.api_key}
                          readOnly
                          className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 font-mono text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(selectedSource.api_key, selectedSource.id)}
                          className="p-2 border rounded-lg hover:bg-gray-50"
                          title="Copy API Key"
                        >
                          {copiedKey === selectedSource.id ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <Copy className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => regenerateKey(selectedSource.id)}
                          className="p-2 border rounded-lg hover:bg-gray-50"
                          title="Regenerate Key"
                        >
                          <Key className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={`${window.location.origin}/api/lead-external-sources/receive`}
                          readOnly
                          className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 font-mono text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(`${window.location.origin}/api/lead-external-sources/receive`, `webhook-${selectedSource.id}`)}
                          className="p-2 border rounded-lg hover:bg-gray-50"
                          title="Copy Webhook URL"
                        >
                          {copiedKey === `webhook-${selectedSource.id}` ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <Copy className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Send POST requests with lead data and include the API key in the X-API-Key header
                      </p>
                    </div>
                  </div>
                </div>

                {/* Leads from this source */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Leads from {selectedSource.source_name} ({sourceLeads.length})
                  </h3>
                  
                  {leadsLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading leads...</div>
                  ) : sourceLeads.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No leads received from this source yet
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {sourceLeads.map((lead: any) => (
                        <div
                          key={lead.id}
                          onClick={() => navigate(`/crm/leads/${lead.id}`)}
                          className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">{lead.title || lead.name}</h4>
                              {lead.company_name && (
                                <p className="text-sm text-gray-600">{lead.company_name}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                {lead.email && <span>{lead.email}</span>}
                                {lead.phone && <span>{lead.phone}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                                lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {lead.status || 'new'}
                              </span>
                              {lead.created_at && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(lead.created_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a source</h3>
                <p className="text-gray-600">
                  Click on a source from the list to view its details and leads
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateSourceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchSources();
          }}
        />
      )}
    </div>
  );
}

function CreateSourceModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    sourceName: '',
    sourceType: 'website',
    sourceUrl: '',
    workspaceId: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/lead-external-sources', formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating source:', error);
      alert('Failed to create source');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Add External Source</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source Name</label>
            <input
              type="text"
              required
              value={formData.sourceName}
              onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="My Website"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source Type</label>
            <select
              value={formData.sourceType}
              onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="website">Website</option>
              <option value="api">API</option>
              <option value="webhook">Webhook</option>
              <option value="form">Form</option>
              <option value="chatbot">Chatbot</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source URL (Optional)</label>
            <input
              type="url"
              value={formData.sourceUrl}
              onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Workspace ID (Optional)</label>
            <input
              type="text"
              value={formData.workspaceId}
              onChange={(e) => setFormData({ ...formData, workspaceId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Leave empty for organization-wide"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Filter } from "lucide-react";

export interface SegmentRule {
  id: string;
  field: string;
  operator: string;
  value: string;
  type: 'contact' | 'activity' | 'campaign';
}

export interface SegmentGroup {
  id: string;
  logic: 'AND' | 'OR';
  rules: SegmentRule[];
}

interface SegmentBuilderProps {
  segments: SegmentGroup[];
  onChange: (segments: SegmentGroup[]) => void;
}

interface FieldDefinition {
  value: string;
  label: string;
  type: string;
  options?: string[];
}

const CONTACT_FIELDS: FieldDefinition[] = [
  { value: 'email', label: 'Email', type: 'text' },
  { value: 'first_name', label: 'First Name', type: 'text' },
  { value: 'last_name', label: 'Last Name', type: 'text' },
  { value: 'company', label: 'Company', type: 'text' },
  { value: 'lifecycle_stage', label: 'Lifecycle Stage', type: 'select', options: ['subscriber', 'lead', 'mql', 'sql', 'opportunity', 'customer'] },
  { value: 'source', label: 'Source', type: 'text' },
  { value: 'city', label: 'City', type: 'text' },
  { value: 'country', label: 'Country', type: 'text' },
  { value: 'created_at', label: 'Created Date', type: 'date' },
];

const ACTIVITY_FIELDS: FieldDefinition[] = [
  { value: 'email_opened', label: 'Opened Email', type: 'boolean' },
  { value: 'email_clicked', label: 'Clicked Email', type: 'boolean' },
  { value: 'form_submitted', label: 'Submitted Form', type: 'boolean' },
  { value: 'last_activity', label: 'Last Activity Date', type: 'date' },
];

const OPERATORS = {
  text: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' },
  ],
  select: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
  ],
  date: [
    { value: 'equals', label: 'Equals' },
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'between', label: 'Between' },
    { value: 'in_last', label: 'In Last X Days' },
  ],
  boolean: [
    { value: 'is_true', label: 'Is True' },
    { value: 'is_false', label: 'Is False' },
  ],
};

export default function SegmentBuilder({ segments, onChange }: SegmentBuilderProps) {
  const addGroup = () => {
    const newGroup: SegmentGroup = {
      id: `group-${Date.now()}`,
      logic: 'AND',
      rules: [],
    };
    onChange([...segments, newGroup]);
  };

  const removeGroup = (groupId: string) => {
    onChange(segments.filter(g => g.id !== groupId));
  };

  const updateGroupLogic = (groupId: string, logic: 'AND' | 'OR') => {
    onChange(segments.map(g => g.id === groupId ? { ...g, logic } : g));
  };

  const addRule = (groupId: string) => {
    const newRule: SegmentRule = {
      id: `rule-${Date.now()}`,
      field: 'email',
      operator: 'contains',
      value: '',
      type: 'contact',
    };
    onChange(segments.map(g => 
      g.id === groupId ? { ...g, rules: [...g.rules, newRule] } : g
    ));
  };

  const removeRule = (groupId: string, ruleId: string) => {
    onChange(segments.map(g => 
      g.id === groupId ? { ...g, rules: g.rules.filter(r => r.id !== ruleId) } : g
    ));
  };

  const updateRule = (groupId: string, ruleId: string, updates: Partial<SegmentRule>) => {
    onChange(segments.map(g => 
      g.id === groupId ? {
        ...g,
        rules: g.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r)
      } : g
    ));
  };

  const getFieldType = (field: string) => {
    const allFields = [...CONTACT_FIELDS, ...ACTIVITY_FIELDS];
    return allFields.find(f => f.value === field)?.type || 'text';
  };

  const getFieldOptions = (field: string) => {
    const allFields = [...CONTACT_FIELDS, ...ACTIVITY_FIELDS];
    return allFields.find(f => f.value === field)?.options || [];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Segment Rules</h3>
        </div>
        <Button onClick={addGroup} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" /> Add Rule Group
        </Button>
      </div>

      {segments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No rules defined. Add a rule group to start building your segment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {segments.map((group, groupIndex) => (
            <Card key={group.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-sm">Rule Group {groupIndex + 1}</CardTitle>
                    <Select value={group.logic} onValueChange={(v) => updateGroupLogic(group.id, v as 'AND' | 'OR')}>
                      <SelectTrigger className="w-[100px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="secondary">{group.rules.length} rules</Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeGroup(group.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.rules.map((rule, ruleIndex) => {
                  const fieldType = getFieldType(rule.field);
                  const operators = OPERATORS[fieldType as keyof typeof OPERATORS] || OPERATORS.text;
                  const fieldOptions = getFieldOptions(rule.field);

                  return (
                    <div key={rule.id} className="flex items-center gap-2 p-3 border rounded-lg">
                      {ruleIndex > 0 && (
                        <Badge variant="outline" className="mr-2">{group.logic}</Badge>
                      )}
                      
                      {/* Field Type */}
                      <Select value={rule.type} onValueChange={(v) => updateRule(group.id, rule.id, { type: v as any })}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contact">Contact</SelectItem>
                          <SelectItem value="activity">Activity</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Field */}
                      <Select value={rule.field} onValueChange={(v) => updateRule(group.id, rule.id, { field: v })}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {rule.type === 'contact' ? (
                            CONTACT_FIELDS.map(f => (
                              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                            ))
                          ) : (
                            ACTIVITY_FIELDS.map(f => (
                              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>

                      {/* Operator */}
                      <Select value={rule.operator} onValueChange={(v) => updateRule(group.id, rule.id, { operator: v })}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map(op => (
                            <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Value */}
                      {!['is_empty', 'is_not_empty', 'is_true', 'is_false'].includes(rule.operator) && (
                        <>
                          {fieldType === 'select' && fieldOptions.length > 0 ? (
                            <Select value={rule.value} onValueChange={(v) => updateRule(group.id, rule.id, { value: v })}>
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select value..." />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldOptions.map(opt => (
                                  <SelectItem key={opt} value={opt} className="capitalize">{opt}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              type={fieldType === 'date' ? 'date' : 'text'}
                              value={rule.value}
                              onChange={(e) => updateRule(group.id, rule.id, { value: e.target.value })}
                              placeholder="Enter value..."
                              className="flex-1"
                            />
                          )}
                        </>
                      )}

                      <Button variant="ghost" size="icon" onClick={() => removeRule(group.id, rule.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}

                <Button onClick={() => addRule(group.id)} size="sm" variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Add Rule
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {segments.length > 1 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Multiple rule groups are combined with OR logic. 
            Contacts matching ANY group will be included in the segment.
          </p>
        </div>
      )}
    </div>
  );
}

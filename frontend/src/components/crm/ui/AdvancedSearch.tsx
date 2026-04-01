import { useState } from 'react';
import { Search, Filter, X, Calendar, DollarSign, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';

interface SearchFilter {
  field: string;
  operator: string;
  value: string;
  label: string;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilter[]) => void;
  placeholder?: string;
  fields?: Array<{ value: string; label: string; type: 'text' | 'number' | 'date' | 'select'; options?: string[] }>;
}

export function AdvancedSearch({ onSearch, placeholder = "Search...", fields = [] }: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const defaultFields = [
    { value: 'name', label: 'Name', type: 'text' as const },
    { value: 'email', label: 'Email', type: 'text' as const },
    { value: 'company', label: 'Company', type: 'text' as const },
    { value: 'status', label: 'Status', type: 'select' as const, options: ['new', 'contacted', 'qualified', 'unqualified'] },
    { value: 'value', label: 'Value', type: 'number' as const },
    { value: 'created_at', label: 'Created Date', type: 'date' as const },
  ];

  const availableFields = fields.length > 0 ? fields : defaultFields;

  const addFilter = (field: string, operator: string, value: string) => {
    const fieldConfig = availableFields.find(f => f.value === field);
    if (!fieldConfig || !value.trim()) return;

    const newFilter: SearchFilter = {
      field,
      operator,
      value,
      label: `${fieldConfig.label} ${operator} ${value}`
    };

    setFilters(prev => [...prev, newFilter]);
    onSearch(query, [...filters, newFilter]);
  };

  const removeFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    setFilters(newFilters);
    onSearch(query, newFilters);
  };

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    onSearch(newQuery, filters);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Add Filter</h4>
              <FilterForm onAddFilter={addFilter} fields={availableFields} />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {filter.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => removeFilter(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilters([]);
              onSearch(query, []);
            }}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

function FilterForm({ onAddFilter, fields }: { onAddFilter: (field: string, operator: string, value: string) => void; fields: any[] }) {
  const [selectedField, setSelectedField] = useState('');
  const [operator, setOperator] = useState('contains');
  const [value, setValue] = useState('');

  const getOperators = (fieldType: string) => {
    switch (fieldType) {
      case 'number':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'greater', label: 'Greater than' },
          { value: 'less', label: 'Less than' },
        ];
      case 'date':
        return [
          { value: 'after', label: 'After' },
          { value: 'before', label: 'Before' },
          { value: 'on', label: 'On' },
        ];
      default:
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'equals', label: 'Equals' },
          { value: 'starts_with', label: 'Starts with' },
        ];
    }
  };

  const selectedFieldConfig = fields.find(f => f.value === selectedField);
  const operators = selectedFieldConfig ? getOperators(selectedFieldConfig.type) : [];

  const handleAdd = () => {
    if (selectedField && operator && value.trim()) {
      onAddFilter(selectedField, operator, value);
      setValue('');
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Field</Label>
        <Select value={selectedField} onValueChange={setSelectedField}>
          <SelectTrigger>
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {fields.map(field => (
              <SelectItem key={field.value} value={field.value}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedField && (
        <div>
          <Label>Condition</Label>
          <Select value={operator} onValueChange={setOperator}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {operators.map(op => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedField && operator && (
        <div>
          <Label>Value</Label>
          {selectedFieldConfig?.type === 'select' ? (
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger>
                <SelectValue placeholder="Select value" />
              </SelectTrigger>
              <SelectContent>
                {selectedFieldConfig.options?.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type={selectedFieldConfig?.type === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value"
            />
          )}
        </div>
      )}

      <Button onClick={handleAdd} disabled={!selectedField || !operator || !value.trim()} className="w-full">
        Add Filter
      </Button>
    </div>
  );
}
import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const FilterPanel = ({ onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    campaignType: '',
    industry: '',
    geography: '',
    dateRange: '30d'
  });

  const campaignTypes = [
    { value: '', label: 'All Campaign Types' },
    { value: 'cold-outreach', label: 'Cold Outreach' },
    { value: 'follow-up', label: 'Follow-up Sequence' },
    { value: 'nurture', label: 'Lead Nurture' },
    { value: 'reengagement', label: 'Re-engagement' }
  ];

  const industries = [
    { value: '', label: 'All Industries' },
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' }
  ];

  const geographies = [
    { value: '', label: 'All Regions' },
    { value: 'north-america', label: 'North America' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia-pacific', label: 'Asia Pacific' },
    { value: 'latin-america', label: 'Latin America' }
  ];

  const dateRanges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      campaignType: '',
      industry: '',
      geography: '',
      dateRange: '30d'
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const activeFilterCount = Object.values(filters)?.filter(v => v && v !== '30d')?.length;

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
            <Icon name="Filter" size={20} color="var(--color-primary)" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-semibold text-foreground">Advanced Filters</h2>
            {activeFilterCount > 0 && (
              <p className="caption text-primary text-xs mt-0.5">
                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-all duration-250 touch-target"
        >
          <span className="text-sm font-medium text-foreground hidden md:inline">
            {isExpanded ? 'Collapse' : 'Expand'}
          </span>
          <Icon 
            name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
            size={16}
            className="transition-transform duration-250"
          />
        </button>
      </div>
      {isExpanded && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Campaign Type"
              options={campaignTypes}
              value={filters?.campaignType}
              onChange={(value) => handleFilterChange('campaignType', value)}
            />

            <Select
              label="Industry"
              options={industries}
              value={filters?.industry}
              onChange={(value) => handleFilterChange('industry', value)}
            />

            <Select
              label="Geography"
              options={geographies}
              value={filters?.geography}
              onChange={(value) => handleFilterChange('geography', value)}
            />

            <Select
              label="Date Range"
              options={dateRanges}
              value={filters?.dateRange}
              onChange={(value) => handleFilterChange('dateRange', value)}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="caption text-muted-foreground text-sm">
              Showing results for selected filters
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                iconName="RotateCcw"
                iconPosition="left"
              >
                Reset Filters
              </Button>
              <Button
                variant="default"
                size="sm"
                iconName="Download"
                iconPosition="left"
              >
                Export Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
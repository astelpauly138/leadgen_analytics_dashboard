import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const SearchBar = ({ onSearch, onIndustryChange, onLocationChange, onDateRangeChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [dateRange, setDateRange] = useState('all');

  const industryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'education', label: 'Education' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'consulting', label: 'Consulting' }
  ];

  const locationOptions = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'canada', label: 'Canada' },
    { value: 'germany', label: 'Germany' },
    { value: 'france', label: 'France' },
    { value: 'australia', label: 'Australia' },
    { value: 'india', label: 'India' },
    { value: 'singapore', label: 'Singapore' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 90 Days' },
    { value: 'year', label: 'Last Year' }
  ];

  const handleSearch = (e) => {
    e?.preventDefault();
    onSearch(searchTerm);
  };

  const handleIndustryChange = (values) => {
    setSelectedIndustries(values);
    onIndustryChange(values);
  };

  const handleLocationChange = (values) => {
    setSelectedLocations(values);
    onLocationChange(values);
  };

  const handleDateRangeChange = (value) => {
    setDateRange(value);
    onDateRangeChange(value);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Icon
            name="Search"
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            placeholder="Search by name, company, email, or phone..."
            className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        <Button
          type="submit"
          variant="default"
          iconName="Search"
          iconPosition="left"
          className="hidden md:flex"
        >
          Search
        </Button>
        <Button
          type="submit"
          variant="default"
          size="icon"
          iconName="Search"
          className="md:hidden"
        />
      </form>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Industry"
          placeholder="Select industries"
          options={industryOptions}
          value={selectedIndustries}
          onChange={handleIndustryChange}
          multiple
          searchable
          clearable
        />

        <Select
          label="Location"
          placeholder="Select locations"
          options={locationOptions}
          value={selectedLocations}
          onChange={handleLocationChange}
          multiple
          searchable
          clearable
        />

        <Select
          label="Date Range"
          placeholder="Select date range"
          options={dateRangeOptions}
          value={dateRange}
          onChange={handleDateRangeChange}
        />
      </div>
    </div>
  );
};

export default SearchBar;
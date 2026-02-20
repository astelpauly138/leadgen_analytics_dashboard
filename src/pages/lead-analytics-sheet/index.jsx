import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../context/AuthContext';
import { apiGet } from '../../utils/api';
import Sidebar from '../../components/navigation/Sidebar';
import Header from '../../components/navigation/Header';
import Icon from '../../components/AppIcon';
import StatsCards from './components/StatsCards';
import LeadTableHeader from './components/LeadTableHeader';
import LeadTableRow from './components/LeadTableRow';
import MobileLeadCard from './components/MobileLeadCard';
import BulkActionBar from './components/BulkActionBar';
import SearchBar from './components/SearchBar';

const LeadAnalyticsSheet = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    industry: '',
    location: '',
    company: '',
    position: '',
    status: ''
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user?.user_id) return;
    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiGet(`/lead-analytics/${user.user_id}`);
        setLeads(data.lead_list || []);
      } catch (err) {
        console.error('Failed to fetch leads:', err);
        setError('Failed to load leads. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [user?.user_id]);

  // Stats computed from real data
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(
    (l) => l.event_type?.toLowerCase() === 'converted'
  ).length;
  const stats = { totalLeads, qualifiedLeads, avgQualityScore: 0, conversionRate: 0 };

  // Returns leads matching all filters EXCEPT the excluded dimension (for cascading options)
  const getFilteredLeadsExcluding = (excludeFilter) => {
    const s = searchTerm.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesSearch = !s || lead.name?.toLowerCase().includes(s);
      const matchesIndustry =
        excludeFilter === 'industry' ||
        !activeFilters.industry ||
        lead.category === activeFilters.industry;
      const matchesLocation =
        excludeFilter === 'location' ||
        !activeFilters.location ||
        lead.location === activeFilters.location;
      const matchesCompany =
        excludeFilter === 'company' ||
        !activeFilters.company ||
        lead.company === activeFilters.company;
      const matchesPosition =
        excludeFilter === 'position' ||
        !activeFilters.position ||
        lead.position === activeFilters.position;
      const matchesStatus =
        excludeFilter === 'status' ||
        !activeFilters.status ||
        lead.event_type === activeFilters.status;
      return (
        matchesSearch &&
        matchesIndustry &&
        matchesLocation &&
        matchesCompany &&
        matchesPosition &&
        matchesStatus
      );
    });
  };

  // All filters applied — the leads shown in the table
  const filteredLeads = getFilteredLeadsExcluding(null);

  // Cascading filter options derived from the current filter state
  const industryOptions = [
    ...new Set(
      getFilteredLeadsExcluding('industry')
        .map((l) => l.category)
        .filter(Boolean)
    )
  ].sort();
  const locationOptions = [
    ...new Set(
      getFilteredLeadsExcluding('location')
        .map((l) => l.location)
        .filter(Boolean)
    )
  ].sort();
  const companyOptions = [
    ...new Set(
      getFilteredLeadsExcluding('company')
        .map((l) => l.company)
        .filter(Boolean)
    )
  ].sort();
  const positionOptions = [
    ...new Set(
      getFilteredLeadsExcluding('position')
        .map((l) => l.position)
        .filter(Boolean)
    )
  ].sort();
  const statusOptions = [
    ...new Set(
      getFilteredLeadsExcluding('status')
        .map((l) => l.event_type)
        .filter(Boolean)
    )
  ].sort();

  // Name suggestions for autocomplete (from the full leads list)
  const nameSuggestions =
    searchTerm.trim().length > 0
      ? [
          ...new Set(
            leads
              .map((l) => l.name)
              .filter((n) => n?.toLowerCase().includes(searchTerm.trim().toLowerCase()))
          )
        ].slice(0, 8)
      : [];

  // Sorted display list
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    const aVal = a[sortConfig.key] || '';
    const bVal = b[sortConfig.key] || '';
    const cmp = String(aVal).localeCompare(String(bVal));
    return sortConfig.direction === 'asc' ? cmp : -cmp;
  });

  const handleSelectLead = (leadId) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === sortedLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(sortedLeads.map((l) => l.id));
    }
  };

  const handleFilterChange = (filterKey, value) => {
    setActiveFilters((prev) => ({ ...prev, [filterKey]: value }));
  };

  const handleClearFilters = () => {
    setActiveFilters({ industry: '', location: '', company: '', position: '', status: '' });
    setSearchTerm('');
  };

  const handleBulkEmail = () => console.log('Sending email to', selectedLeads.length, 'leads');
  const handleBulkExport = () => console.log('Exporting', selectedLeads.length, 'leads');
  const handleBulkDelete = () => console.log('Deleting', selectedLeads.length, 'leads');

  const hasActiveFiltersOrSearch =
    searchTerm || Object.values(activeFilters).some((v) => v);

  return (
    <>
      <Helmet>
        <title>Lead Analytics Sheet - ANALYTICA</title>
        <meta
          name="description"
          content="Comprehensive lead database management with advanced filtering and bulk action capabilities"
        />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <Header />

          <main className="p-4 md:p-6 lg:p-8">
            {/* Page header — no Add Lead button */}
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Lead Analytics Sheet
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Manage and analyze your lead database with advanced filtering
              </p>
            </div>

            {/* Stats cards */}
            <div className="mb-6">
              <StatsCards stats={stats} />
            </div>

            {/* Top search + filters */}
            <div className="mb-6">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                nameSuggestions={nameSuggestions}
                industryOptions={industryOptions}
                locationOptions={locationOptions}
                companyOptions={companyOptions}
                positionOptions={positionOptions}
                statusOptions={statusOptions}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Leads table / cards */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Icon name="Loader" size={32} className="animate-spin" />
                    <p className="text-sm">Loading leads…</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Icon name="AlertCircle" size={32} />
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              ) : sortedLeads.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Icon name="Users" size={32} />
                    <p className="text-sm">No leads found</p>
                    {hasActiveFiltersOrSearch && (
                      <button
                        onClick={handleClearFilters}
                        className="text-sm text-primary hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>
              ) : !isMobile ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <LeadTableHeader
                      sortConfig={sortConfig}
                      onSort={setSortConfig}
                      onSelectAll={handleSelectAll}
                      selectedCount={selectedLeads.length}
                      totalCount={sortedLeads.length}
                    />
                    <tbody>
                      {sortedLeads.map((lead) => (
                        <LeadTableRow
                          key={lead.id}
                          lead={lead}
                          isSelected={selectedLeads.includes(lead.id)}
                          onSelect={handleSelectLead}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {sortedLeads.map((lead) => (
                    <MobileLeadCard
                      key={lead.id}
                      lead={lead}
                      isSelected={selectedLeads.includes(lead.id)}
                      onSelect={handleSelectLead}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {sortedLeads.length} of {totalLeads} leads
              </p>
            </div>
          </main>
        </div>
      </div>

      <BulkActionBar
        selectedCount={selectedLeads.length}
        onEmail={handleBulkEmail}
        onExport={handleBulkExport}
        onDelete={handleBulkDelete}
        onClearSelection={() => setSelectedLeads([])}
      />
    </>
  );
};

export default LeadAnalyticsSheet;

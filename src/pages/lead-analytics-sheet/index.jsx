import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '../../components/navigation/Sidebar';
import Header from '../../components/navigation/Header';

import Button from '../../components/ui/Button';
import FilterSidebar from './components/FilterSidebar';
import SearchBar from './components/SearchBar';
import StatsCards from './components/StatsCards';
import LeadTableHeader from './components/LeadTableHeader';
import LeadTableRow from './components/LeadTableRow';
import MobileLeadCard from './components/MobileLeadCard';
import BulkActionBar from './components/BulkActionBar';

const LeadAnalyticsSheet = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [filters, setFilters] = useState({
    status: [],
    source: [],
    quality: [],
    region: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [dateRange, setDateRange] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mockLeads = [
  {
    id: 1,
    name: "Sarah Mitchell",
    title: "VP of Sales",
    company: "TechCorp Solutions",
    industry: "Technology",
    email: "sarah.mitchell@techcorp.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_15b51d2e4-1763293833337.png",
    avatarAlt: "Professional headshot of woman with blonde hair in navy blazer smiling at camera",
    status: "qualified",
    qualityScore: 92,
    source: "linkedin",
    location: "San Francisco, CA",
    lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    companySize: "500-1000 employees",
    revenue: "$50M-$100M",
    linkedin: "https://linkedin.com/in/sarahmitchell",
    engagementScore: 87,
    lastActivity: "Opened email campaign \'Q1 Product Launch'",
    notes: "High interest in enterprise solutions. Scheduled demo for next week. Decision maker with budget authority."
  },
  {
    id: 2,
    name: "Michael Chen",
    title: "Director of Marketing",
    company: "Global Innovations Inc",
    industry: "Healthcare",
    email: "m.chen@globalinnovations.com",
    phone: "+1 (555) 234-5678",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_13a48293d-1763296098326.png",
    avatarAlt: "Professional headshot of Asian man with short black hair in gray suit",
    status: "contacted",
    qualityScore: 78,
    source: "website",
    location: "New York, NY",
    lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    companySize: "1000-5000 employees",
    revenue: "$100M-$500M",
    linkedin: "https://linkedin.com/in/michaelchen",
    engagementScore: 72,
    lastActivity: "Downloaded whitepaper \'Healthcare Analytics Trends 2026'",
    notes: "Interested in analytics platform. Needs approval from CTO. Follow up in 2 weeks."
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    title: "Chief Technology Officer",
    company: "FinanceHub",
    industry: "Finance",
    email: "emily.r@financehub.com",
    phone: "+1 (555) 345-6789",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_16522f397-1763293372445.png",
    avatarAlt: "Professional headshot of Hispanic woman with long dark hair in black blazer",
    status: "new",
    qualityScore: 95,
    source: "referral",
    location: "Chicago, IL",
    lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    companySize: "100-500 employees",
    revenue: "$10M-$50M",
    linkedin: "https://linkedin.com/in/emilyrodriguez",
    engagementScore: 91,
    lastActivity: "Referred by existing customer John Smith",
    notes: "Hot lead. Actively looking for lead generation solution. Budget approved for Q1."
  },
  {
    id: 4,
    name: "David Thompson",
    title: "Business Development Manager",
    company: "RetailPro Systems",
    industry: "Retail",
    email: "d.thompson@retailpro.com",
    phone: "+1 (555) 456-7890",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1d90a96ad-1763299909299.png",
    avatarAlt: "Professional headshot of Caucasian man with brown hair in blue suit smiling",
    status: "nurturing",
    qualityScore: 65,
    source: "event",
    location: "Austin, TX",
    lastContact: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    companySize: "50-100 employees",
    revenue: "$5M-$10M",
    linkedin: "https://linkedin.com/in/davidthompson",
    engagementScore: 58,
    lastActivity: "Met at SaaS Conference 2026",
    notes: "Exploring options. Not urgent. Keep in nurture campaign for 3 months."
  },
  {
    id: 5,
    name: "Jennifer Park",
    title: "Head of Operations",
    company: "Manufacturing Plus",
    industry: "Manufacturing",
    email: "j.park@mfgplus.com",
    phone: "+1 (555) 567-8901",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_11e82195f-1763301916996.png",
    avatarAlt: "Professional headshot of Asian woman with short black hair in white blouse",
    status: "converted",
    qualityScore: 88,
    source: "cold_outreach",
    location: "Detroit, MI",
    lastContact: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    companySize: "500-1000 employees",
    revenue: "$50M-$100M",
    linkedin: "https://linkedin.com/in/jenniferpark",
    engagementScore: 94,
    lastActivity: "Signed annual contract",
    notes: "Successfully converted. Onboarding in progress. Potential for upsell in Q2."
  },
  {
    id: 6,
    name: "Robert Williams",
    title: "Sales Director",
    company: "EduTech Solutions",
    industry: "Education",
    email: "r.williams@edutech.com",
    phone: "+1 (555) 678-9012",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_167caacf9-1763294349251.png",
    avatarAlt: "Professional headshot of African American man with glasses in dark suit",
    status: "qualified",
    qualityScore: 81,
    source: "linkedin",
    location: "Boston, MA",
    lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    companySize: "100-500 employees",
    revenue: "$10M-$50M",
    linkedin: "https://linkedin.com/in/robertwilliams",
    engagementScore: 76,
    lastActivity: "Requested pricing information",
    notes: "Qualified lead. Budget cycle starts in March. Schedule follow-up call."
  },
  {
    id: 7,
    name: "Amanda Foster",
    title: "Marketing Manager",
    company: "RealEstate Pro",
    industry: "Real Estate",
    email: "a.foster@realestatepro.com",
    phone: "+1 (555) 789-0123",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1ee564002-1763294447537.png",
    avatarAlt: "Professional headshot of woman with red hair in green blazer smiling warmly",
    status: "contacted",
    qualityScore: 73,
    source: "website",
    location: "Miami, FL",
    lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    companySize: "50-100 employees",
    revenue: "$5M-$10M",
    linkedin: "https://linkedin.com/in/amandafoster",
    engagementScore: 68,
    lastActivity: "Attended webinar \'Lead Generation Best Practices'",
    notes: "Interested in automation features. Comparing with competitors. Follow up next week."
  },
  {
    id: 8,
    name: "James Anderson",
    title: "Consulting Partner",
    company: "Strategy Advisors",
    industry: "Consulting",
    email: "j.anderson@strategyadvisors.com",
    phone: "+1 (555) 890-1234",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_129cc3c7b-1763293178950.png",
    avatarAlt: "Professional headshot of Caucasian man with gray hair in charcoal suit",
    status: "new",
    qualityScore: 86,
    source: "referral",
    location: "Seattle, WA",
    lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    companySize: "10-50 employees",
    revenue: "$1M-$5M",
    linkedin: "https://linkedin.com/in/jamesanderson",
    engagementScore: 82,
    lastActivity: "Referred by partner network",
    notes: "High-value prospect. Consulting firm looking for client lead generation. Urgent need."
  }];


  const stats = {
    totalLeads: 3027,
    qualifiedLeads: 423,
    avgQualityScore: 78,
    conversionRate: 6.2
  };

  const handleSelectLead = (leadId) => {
    setSelectedLeads((prev) =>
    prev?.includes(leadId) ?
    prev?.filter((id) => id !== leadId) :
    [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads?.length === mockLeads?.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(mockLeads?.map((lead) => lead?.id));
    }
  };

  const handleSort = (config) => {
    setSortConfig(config);
  };

  const handleFilterChange = (category, values) => {
    setFilters((prev) => ({
      ...prev,
      [category]: values
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: [],
      source: [],
      quality: [],
      region: []
    });
  };

  const handleBulkEmail = () => {
    console.log('Sending email to', selectedLeads?.length, 'leads');
  };

  const handleBulkExport = () => {
    console.log('Exporting', selectedLeads?.length, 'leads');
  };

  const handleBulkDelete = () => {
    console.log('Deleting', selectedLeads?.length, 'leads');
  };

  const handleEditLead = (lead) => {
    console.log('Editing lead:', lead);
  };

  return (
    <>
      <Helmet>
        <title>Lead Analytics Sheet - ANALYTICA</title>
        <meta name="description" content="Comprehensive lead database management with advanced filtering and bulk action capabilities for sales operations teams" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        

        <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <Header />

          <main className="p-4 md:p-6 lg:p-8">
            <div className="mb-6 md:mb-8">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                  Lead Analytics Sheet
                </h1>
                <Button
                  variant="default"
                  iconName="Plus"
                  iconPosition="left"
                  className="hidden md:flex">
                  
                  Add Lead
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  iconName="Plus"
                  className="md:hidden" />
                
              </div>
              <p className="text-sm md:text-base text-muted-foreground">
                Manage and analyze your lead database with advanced filtering and bulk actions
              </p>
            </div>

            <div className="mb-6">
              <StatsCards stats={stats} />
            </div>

            <div className="mb-6">
              <SearchBar
                onSearch={setSearchTerm}
                onIndustryChange={setSelectedIndustries}
                onLocationChange={setSelectedLocations}
                onDateRangeChange={setDateRange} />
              
            </div>

            <div className="flex gap-6">
              <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-24">
                  <FilterSidebar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                    isCollapsed={false}
                    onToggle={() => {}} />
                  
                </div>
              </div>

              <div className="lg:hidden">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                  isCollapsed={!isFilterOpen}
                  onToggle={() => setIsFilterOpen(!isFilterOpen)} />
                
              </div>

              <div className="flex-1 min-w-0">
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  {!isMobile ?
                  <div className="overflow-x-auto">
                      <table className="w-full">
                        <LeadTableHeader
                        sortConfig={sortConfig}
                        onSort={handleSort}
                        onSelectAll={handleSelectAll}
                        selectedCount={selectedLeads?.length}
                        totalCount={mockLeads?.length} />
                      
                        <tbody>
                          {mockLeads?.map((lead) =>
                        <LeadTableRow
                          key={lead?.id}
                          lead={lead}
                          isSelected={selectedLeads?.includes(lead?.id)}
                          onSelect={handleSelectLead}
                          onEdit={handleEditLead} />

                        )}
                        </tbody>
                      </table>
                    </div> :

                  <div className="p-4 space-y-4">
                      {mockLeads?.map((lead) =>
                    <MobileLeadCard
                      key={lead?.id}
                      lead={lead}
                      isSelected={selectedLeads?.includes(lead?.id)}
                      onSelect={handleSelectLead}
                      onEdit={handleEditLead} />

                    )}
                    </div>
                  }
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <p className="caption text-muted-foreground text-sm">
                    Showing {mockLeads?.length} of {stats?.totalLeads?.toLocaleString()} leads
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" iconName="ChevronLeft" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" iconName="ChevronRight">
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <BulkActionBar
        selectedCount={selectedLeads?.length}
        onEmail={handleBulkEmail}
        onExport={handleBulkExport}
        onDelete={handleBulkDelete}
        onClearSelection={() => setSelectedLeads([])} />
      
    </>);

};

export default LeadAnalyticsSheet;
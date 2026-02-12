import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '../../components/navigation/Sidebar';
import Header from '../../components/navigation/Header';
import KPICard from './components/KPICard';
import ConfigurationForm from './components/ConfigurationForm';
import ActivityFeed from './components/ActivityFeed';
import QuickActions from './components/QuickActions';
import Icon from '../../components/AppIcon';
import { apiGet } from '../../utils/api';

const MainDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activities, setActivities] = useState([]);
  const [kpiData, setKpiData] = useState({
    totalScraped: { value: 0, change: 0, changeType: 'neutral' },
    readyToEmail: { value: 0, change: 0, changeType: 'neutral' },
    emailsSent: { value: 0, change: 0, changeType: 'neutral' },
    successRate: { value: 73, change: 5.7, changeType: 'positive' }
  });

  const [dashboardData, setDashboardData] = useState({
    user_id: null,
    scraped_leads: [],
    total_leads_scraped: 0,
    ready_to_email_number: 0,
    ready_to_email_names: [],
    emails_sent_number: 0,
    email_sent_names: [],
    pending_leads: []
  });

  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulated KPI updates removed — KPIs now update only from real API responses.

  const handleConfigSubmit = (formData, result) => {
    console.log('Configuration submitted:', formData);
    console.log('Scraping result:', result);

    const now = new Date();

    // Case 1: Form submitted (scraping started)
    if (result === null) {
      const startActivity = {
        id: `scraping-${Date.now()}`,
        type: 'scraping',
        icon: 'Play',
        color: 'var(--color-primary)',
        title: 'Started Lead Scraping',
        description: `Industry: ${formData?.industry}, Location: ${formData?.location}, Targets: ${formData?.no_of_targets}`,
        timestamp: now,
        status: 'info'
      };
      setActivities(prev => [startActivity, ...prev]);
    }
    // Case 2: Results received from API (scraping completed)
    else if (result?.total_scraped && !result?.approval_data) {
      const totalScraped = result?.total_scraped || 0;
      const scrapedActivity = {
        id: `scraped-${Date.now()}`,
        type: 'scraping',
        icon: 'CheckCircle2',
        color: 'var(--color-success)',
        title: `${totalScraped} Leads Scraped`,
        description: `Successfully scraped and processed ${totalScraped} leads`,
        timestamp: now,
        status: 'success'
      };
      setActivities(prev => [scrapedActivity, ...prev]);

      // Update dashboard data and KPI cards from fresh backend data
      if (result?.freshDashboardData) {
        setDashboardData(result.freshDashboardData);

        // Update KPI cards from fresh backend data
        setKpiData(prev => ({
          ...prev,
          totalScraped: { value: result.freshDashboardData?.total_leads_scraped || 0, change: prev.totalScraped.change, changeType: prev.totalScraped.changeType },
          readyToEmail: { value: result.freshDashboardData?.ready_to_email_number || 0, change: prev.readyToEmail.change, changeType: prev.readyToEmail.changeType },
          emailsSent: { value: result.freshDashboardData?.emails_sent_number || 0, change: prev.emailsSent.change, changeType: prev.emailsSent.changeType }
        }));

        setLastUpdate(now);
      }
    }
    // Case 3: Approval (leads approved) - use fresh dashboard data from backend
    else if (result?.approval_data && result?.freshDashboardData) {
      const approvedCount = result?.approval_data?.submission_count || 0;

      const approvedActivity = {
        id: `approved-${Date.now()}`,
        type: 'approval',
        icon: 'ThumbsUp',
        color: 'var(--color-success)',
        title: `${approvedCount} Leads Approved`,
        description: `${approvedCount} leads selected and approved for email`,
        timestamp: now,
        status: 'success'
      };

      setActivities(prev => [approvedActivity, ...prev]);
      
      // Update dashboard data from backend response
      setDashboardData(result.freshDashboardData);
      
      // Update KPI cards from fresh backend data (not from calculation)
      setKpiData(prev => ({
        ...prev,
        totalScraped: { value: result.freshDashboardData?.total_leads_scraped || 0, change: prev.totalScraped.change, changeType: prev.totalScraped.changeType },
        readyToEmail: { value: result.freshDashboardData?.ready_to_email_number || 0, change: prev.readyToEmail.change, changeType: prev.readyToEmail.changeType },
        emailsSent: { value: result.freshDashboardData?.emails_sent_number || 0, change: prev.emailsSent.change, changeType: prev.emailsSent.changeType }
      }));

      setLastUpdate(now);
    }
  };

  const handleQuickAction = (actionId) => {
    console.log('Quick action triggered:', actionId);
    
    if (actionId === 'refresh') {
      setLastUpdate(new Date());
    }
  };

  // Fetch dashboard data from backend when dashboard mounts
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // apiGet will automatically handle 401 errors and redirect to login
        const data = await apiGet('/dashboard/dashboard');

        setDashboardData(data || {});

        // Update KPI cards from backend values
        setKpiData(prev => ({
          ...prev,
          totalScraped: { value: data?.total_leads_scraped || 0, change: prev.totalScraped.change, changeType: prev.totalScraped.changeType },
          readyToEmail: { value: data?.ready_to_email_number || 0, change: prev.readyToEmail.change, changeType: prev.readyToEmail.changeType },
          emailsSent: { value: data?.emails_sent_number || 0, change: prev.emailsSent.change, changeType: prev.emailsSent.changeType }
        }));

      } catch (err) {
        console.error('Error fetching dashboard', err);
        // Error is already handled by apiGet (redirects to login on 401)
      }
    };

    fetchDashboard();
  }, [lastUpdate]);

  return (
    <>
      <Helmet>
        <title>Lead Generation</title>
        <meta name="description" content="Real-time lead generation performance monitoring and campaign configuration dashboard" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <Header />

          <main className="p-4 md:p-6 lg:p-8">
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                    Lead Generation Dashboard
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Real-time performance monitoring and campaign configuration
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                  <Icon name="Clock" size={16} color="var(--color-muted-foreground)" />
                  <div>
                    <p className="caption text-muted-foreground text-xs">Last Updated</p>
                    <p className="text-sm font-medium text-foreground">
                      {lastUpdate?.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <KPICard
                title="Total Scraped"
                value={kpiData?.totalScraped?.value}
                change={kpiData?.totalScraped?.change}
                changeType={kpiData?.totalScraped?.changeType}
                icon="Database"
                color="var(--color-primary)"
              />

              <KPICard
                title="Ready to Email"
                value={kpiData?.readyToEmail?.value}
                change={kpiData?.readyToEmail?.change}
                changeType={kpiData?.readyToEmail?.changeType}
                icon="CheckCircle"
                color="var(--color-success)"
              />

              <KPICard
                title="Emails Sent"
                value={kpiData?.emailsSent?.value}
                change={kpiData?.emailsSent?.change}
                changeType={kpiData?.emailsSent?.changeType}
                icon="Mail"
                color="var(--color-warning)"
              />

              <KPICard
                title="Success Rate"
                value={kpiData?.successRate?.value}
                change={kpiData?.successRate?.change}
                changeType={kpiData?.successRate?.changeType}
                icon="TrendingUp"
                color="var(--color-accent)"
              />
            </div>

            <div className="mb-6 md:mb-8">
              <QuickActions onActionClick={handleQuickAction} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                <div className="lg:col-span-8 h-[700px]">
                <ConfigurationForm onSubmit={handleConfigSubmit} dashboardData={dashboardData} />
              </div>

              <div className="lg:col-span-4 h-[700px]">
                <ActivityFeed activities={activities} />
              </div>
            </div>

            <div className="mt-6 md:mt-8 p-4 md:p-6 bg-card border border-border rounded-xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} color="var(--color-primary)" className="mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">
                      Dashboard Information
                    </h3>
                    <p className="caption text-muted-foreground text-sm">
                      Data refreshes automatically every 5 minutes. Manual refresh available via Quick Actions.
                      All metrics are calculated in real-time from your connected data sources.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-lg flex-shrink-0">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-success whitespace-nowrap">Live Data</span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default MainDashboard;
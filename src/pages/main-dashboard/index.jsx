import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '../../components/navigation/Sidebar';
import Header from '../../components/navigation/Header';
import KPICard from './components/KPICard';
import ConfigurationForm from './components/ConfigurationForm';
import ActivityFeed from './components/ActivityFeed';
import QuickActions from './components/QuickActions';
import Icon from '../../components/AppIcon';
import { apiGet } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const MainDashboard = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activities, setActivities] = useState([]);
  const [kpiData, setKpiData] = useState({
    totalScraped: { value: 0, change: 0, changeType: 'neutral' },
    readyToEmail: { value: 0, change: 0, changeType: 'neutral' },
    emailsSent: { value: 0, change: 0, changeType: 'neutral' },
    successRate: { value: 0, change: 0, changeType: 'neutral' }
  });

  const [dashboardData, setDashboardData] = useState({});
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch dashboard data from backend
  const fetchDashboard = useCallback(async () => {
    if (!user?.user_id) return;

    try {
      const data = await apiGet(`/dashboard/dashboard/${user.user_id}`);

      setDashboardData(data || {});

      // Aggregate KPIs across all campaigns
      const kpis = data?.dashboard_kpis || [];
      const totalLeads = kpis.reduce((sum, c) => sum + (c.total_leads || 0), 0);
      const readyToEmail = kpis.reduce((sum, c) => sum + (c.ready_to_email || 0), 0);
      const emailsSent = kpis.reduce((sum, c) => sum + (c.emails_sent || 0), 0);
      const successRate = kpis.length > 0
        ? kpis.reduce((sum, c) => sum + (c.success_rate || 0), 0) / kpis.length
        : 0;

      setKpiData({
        totalScraped: { value: totalLeads, change: 0, changeType: 'neutral' },
        readyToEmail: { value: readyToEmail, change: 0, changeType: 'neutral' },
        emailsSent: { value: emailsSent, change: 0, changeType: 'neutral' },
        successRate: { value: parseFloat(successRate.toFixed(2)), change: 0, changeType: 'neutral' }
      });

      // Map activity logs from backend (sorted latest first)
      const logs = data?.activity_logs || [];
      const mappedActivities = logs
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map((log, index) => ({
          id: `${log.campaign_id}-${log.created_at}-${index}`,
          icon: log.action?.toLowerCase().includes('approved') ? 'ThumbsUp'
            : log.action?.toLowerCase().includes('scrap') ? 'CheckCircle2'
            : 'Play',
          color: log.action?.toLowerCase().includes('approved') ? 'var(--color-success)'
            : log.action?.toLowerCase().includes('scrap') ? 'var(--color-primary)'
            : 'var(--color-warning)',
          title: log.action,
          description: log.campaign_name || '',
          timestamp: log.created_at,
          status: 'success'
        }));

      setActivities(mappedActivities);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching dashboard', err);
    }
  }, [user?.user_id]);

  // Fetch on mount and when user_id becomes available
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleConfigSubmit = (formData, result) => {
    // Re-fetch dashboard data from backend after any action
    fetchDashboard();
  };

  const handleQuickAction = (actionId) => {
    if (actionId === 'refresh') {
      fetchDashboard();
    }
  };

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
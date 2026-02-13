import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '../../components/navigation/Sidebar';
import Header from '../../components/navigation/Header';
import Icon from '../../components/AppIcon';
import KPICard from './components/KPICard';
import CampaignChart from './components/CampaignChart';
import CampaignLeaderboard from './components/CampaignLeaderboard';
import ConversionFunnel from './components/ConversionFunnel';
import FilterPanel from './components/FilterPanel';

const CampaignPerformance = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 900000);

    return () => clearInterval(interval);
  }, []);

  const kpiData = [
    {
      title: "Total Campaigns",
      value: "47",
      change: "+12.5%",
      changeType: "positive",
      icon: "Mail",
      iconColor: "var(--color-primary)"
    },
    {
      title: "Average Open Rate",
      value: "34.8%",
      change: "+5.2%",
      changeType: "positive",
      icon: "Eye",
      iconColor: "var(--color-success)"
    },
    {
      title: "Click-Through Rate",
      value: "12.3%",
      change: "+2.1%",
      changeType: "positive",
      icon: "MousePointer",
      iconColor: "var(--color-warning)"
    },
    {
      title: "Conversion Rate",
      value: "8.7%",
      change: "+1.8%",
      changeType: "positive",
      icon: "Target",
      iconColor: "var(--color-accent)"
    }
  ];

  const chartData = [
    { period: "Week 1", emailsSent: 2400, successRate: 32.5 },
    { period: "Week 2", emailsSent: 3200, successRate: 35.8 },
    { period: "Week 3", emailsSent: 2800, successRate: 33.2 },
    { period: "Week 4", emailsSent: 3600, successRate: 38.4 },
    { period: "Week 5", emailsSent: 4100, successRate: 36.7 },
    { period: "Week 6", emailsSent: 3800, successRate: 39.1 },
    { period: "Week 7", emailsSent: 4500, successRate: 41.2 },
    { period: "Week 8", emailsSent: 4200, successRate: 40.5 }
  ];

  const topCampaigns = [
    {
      id: 1,
      name: "Tech Startup Outreach Q1",
      type: "Cold Outreach",
      successRate: 42.8,
      emailsSent: 1250,
      openRate: 38.5,
      clickRate: 15.2,
      replyRate: 8.4
    },
    {
      id: 2,
      name: "Healthcare Decision Makers",
      type: "Follow-up Sequence",
      successRate: 39.6,
      emailsSent: 980,
      openRate: 35.8,
      clickRate: 13.7,
      replyRate: 7.2
    },
    {
      id: 3,
      name: "Finance Industry Leaders",
      type: "Lead Nurture",
      successRate: 37.2,
      emailsSent: 1420,
      openRate: 33.4,
      clickRate: 12.8,
      replyRate: 6.9
    },
    {
      id: 4,
      name: "Retail Chain Expansion",
      type: "Cold Outreach",
      successRate: 35.8,
      emailsSent: 890,
      openRate: 31.2,
      clickRate: 11.5,
      replyRate: 6.3
    },
    {
      id: 5,
      name: "Manufacturing Partners",
      type: "Re-engagement",
      successRate: 33.4,
      emailsSent: 760,
      openRate: 29.8,
      clickRate: 10.2,
      replyRate: 5.8
    }
  ];

  const funnelStages = [
    {
      id: 1,
      name: "Emails Sent",
      description: "Initial outreach delivered",
      count: 15420,
      conversionRate: 100,
      dropOffRate: 65.2,
      icon: "Send",
      status: "default"
    },
    {
      id: 2,
      name: "Emails Opened",
      description: "Recipients viewed email",
      count: 5366,
      conversionRate: 34.8,
      dropOffRate: 64.7,
      icon: "Eye",
      status: "default"
    },
    {
      id: 3,
      name: "Links Clicked",
      description: "Engaged with content",
      count: 1895,
      conversionRate: 12.3,
      dropOffRate: 29.3,
      icon: "MousePointer",
      status: "warning"
    },
    {
      id: 4,
      name: "Responses Received",
      description: "Active conversation started",
      count: 1340,
      conversionRate: 8.7,
      dropOffRate: 18.5,
      icon: "MessageSquare",
      status: "success"
    },
    {
      id: 5,
      name: "Qualified Leads",
      description: "Meeting scheduled or demo requested",
      count: 1092,
      conversionRate: 7.1,
      dropOffRate: 0,
      icon: "CheckCircle",
      status: "success"
    }
  ];

  const handleFilterChange = (filters) => {
    console.log('Filters applied:', filters);
  };

  return (
    <>
      <Helmet>
        <title>Campaign Performance - ANALYTICA</title>
        <meta name="description" content="Comprehensive email outreach analytics and success rate monitoring for marketing directors and sales teams" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <Header />

          <main className="p-4 md:p-6 lg:p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                    Campaign Performance
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Email outreach analytics and success rate monitoring
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <span className="caption text-muted-foreground text-xs">
                      Updated {lastUpdated?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <button
                    className="flex items-center justify-center w-10 h-10 bg-card border border-border rounded-lg hover:bg-muted transition-all duration-250 touch-target"
                    title="Refresh data"
                  >
                    <Icon name="RefreshCw" size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {kpiData?.map((kpi, index) => (
                  <div key={index} className="animate-stagger">
                    <KPICard {...kpi} />
                  </div>
                ))}
              </div>

              <FilterPanel onFilterChange={handleFilterChange} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                <div className="lg:col-span-8 animate-fade-in">
                  <CampaignChart 
                    data={chartData} 
                    timeRange={timeRange}
                    onTimeRangeChange={setTimeRange}
                  />
                </div>

                <div className="lg:col-span-4 animate-fade-in">
                  <CampaignLeaderboard campaigns={topCampaigns} />
                </div>
              </div>

              <div className="animate-fade-in">
                <ConversionFunnel stages={funnelStages} />
              </div>

              <div className="bg-card border border-border rounded-xl p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-foreground mb-1">Performance Insights</h2>
                    <p className="caption text-muted-foreground text-sm">AI-powered recommendations</p>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                    <Icon name="Lightbulb" size={20} color="var(--color-primary)" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-success/20 rounded-lg flex-shrink-0">
                        <Icon name="TrendingUp" size={16} color="var(--color-success)" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">Strong Performance</h3>
                        <p className="caption text-muted-foreground text-xs">
                          Your Tech Startup Outreach campaign is performing 52% above industry average. Consider scaling this approach to similar segments.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-warning/20 rounded-lg flex-shrink-0">
                        <Icon name="AlertTriangle" size={16} color="var(--color-warning)" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">Optimization Opportunity</h3>
                        <p className="caption text-muted-foreground text-xs">
                          Click-to-response conversion dropped 18% this week. Review email content and CTA placement for better engagement.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default CampaignPerformance;
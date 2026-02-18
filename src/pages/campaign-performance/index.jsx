import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '../../components/navigation/Sidebar';
import Header from '../../components/navigation/Header';
import Icon from '../../components/AppIcon';
import KPICard from './components/KPICard';
import CampaignChart from './components/CampaignChart';
import CampaignLeaderboard from './components/CampaignLeaderboard';
import ConversionFunnel from './components/ConversionFunnel';
import FilterPanel from './components/FilterPanel';
import { apiGet } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const CampaignPerformance = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const [kpiData, setKpiData] = useState([
    { title: "Total Campaigns", value: "0", change: "", changeType: "neutral", icon: "Mail", iconColor: "var(--color-primary)" },
    { title: "Average Open Rate", value: "0%", change: "", changeType: "neutral", icon: "Eye", iconColor: "var(--color-success)" },
    { title: "Click-Through Rate", value: "0%", change: "", changeType: "neutral", icon: "MousePointer", iconColor: "var(--color-warning)" },
    { title: "Conversion Rate", value: "0%", change: "", changeType: "neutral", icon: "Target", iconColor: "var(--color-accent)" }
  ]);
  const [chartData, setChartData] = useState([]);
  const [topCampaigns, setTopCampaigns] = useState([]);
  const [funnelStages, setFunnelStages] = useState([]);

  const fetchCampaignData = useCallback(async () => {
    if (!user?.user_id) return;

    try {
      setLoading(true);
      const data = await apiGet(`/campaign-kpis/${user.user_id}`);
      const campaigns = data?.campaign_kpis || [];

      if (campaigns.length === 0) {
        setLoading(false);
        return;
      }

      // --- KPI Cards ---
      const totalCampaigns = campaigns.length;

      const avgOpenRate = campaigns.reduce((sum, c) => sum + (c.avg_open_rate || 0), 0) / totalCampaigns;
      const avgClickRate = campaigns.reduce((sum, c) => sum + (c.avg_click_through_rate || 0), 0) / totalCampaigns;
      const avgConversionRate = campaigns.reduce((sum, c) => sum + (c.conversion_rate || 0), 0) / totalCampaigns;

      setKpiData([
        {
          title: "Total Campaigns",
          value: String(totalCampaigns),
          change: "",
          changeType: "neutral",
          icon: "Mail",
          iconColor: "var(--color-primary)"
        },
        {
          title: "Average Open Rate",
          value: `${avgOpenRate.toFixed(1)}%`,
          change: "",
          changeType: avgOpenRate > 0 ? "positive" : "neutral",
          icon: "Eye",
          iconColor: "var(--color-success)"
        },
        {
          title: "Click-Through Rate",
          value: `${avgClickRate.toFixed(1)}%`,
          change: "",
          changeType: avgClickRate > 0 ? "positive" : "neutral",
          icon: "MousePointer",
          iconColor: "var(--color-warning)"
        },
        {
          title: "Conversion Rate",
          value: `${avgConversionRate.toFixed(1)}%`,
          change: "",
          changeType: avgConversionRate > 0 ? "positive" : "neutral",
          icon: "Target",
          iconColor: "var(--color-accent)"
        }
      ]);

      // --- Chart Data (one bar per campaign) ---
      const chartItems = campaigns.map((c) => ({
        period: c.name,
        emailsSent: c.total_email_sent || 0,
        successRate: c.conversion_rate || 0
      }));
      setChartData(chartItems);

      // --- Top Campaigns (sorted by performance: conversion_rate desc) ---
      const sorted = [...campaigns].sort((a, b) => {
        const scoreA = (a.conversion_rate || 0) + (a.avg_open_rate || 0) + (a.avg_click_through_rate || 0);
        const scoreB = (b.conversion_rate || 0) + (b.avg_open_rate || 0) + (b.avg_click_through_rate || 0);
        return scoreB - scoreA;
      });

      const top = sorted.slice(0, 5).map((c, idx) => ({
        id: c.campaign_id || idx + 1,
        name: c.name,
        type: "Campaign",
        successRate: parseFloat((c.conversion_rate || 0).toFixed(1)),
        emailsSent: c.total_email_sent || 0,
        openRate: parseFloat((c.avg_open_rate || 0).toFixed(1)),
        clickRate: parseFloat((c.avg_click_through_rate || 0).toFixed(1)),
        replyRate: parseFloat((c.conversion_rate || 0).toFixed(1))
      }));
      setTopCampaigns(top);

      // --- Conversion Funnel (aggregate across all campaigns) ---
      const totalSent = campaigns.reduce((sum, c) => sum + (c.total_email_sent || 0), 0);
      const totalOpened = campaigns.reduce((sum, c) => sum + (c.open_count || 0), 0);
      const totalClicked = campaigns.reduce((sum, c) => sum + (c.click_through_count || 0), 0);
      const totalConverted = campaigns.reduce((sum, c) => sum + (c.converted_count || 0), 0);

      const openPct = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
      const clickPct = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
      const convertPct = totalSent > 0 ? (totalConverted / totalSent) * 100 : 0;

      const openDropOff = totalSent > 0 ? ((totalSent - totalOpened) / totalSent) * 100 : 0;
      const clickDropOff = totalOpened > 0 ? ((totalOpened - totalClicked) / totalOpened) * 100 : 0;
      const convertDropOff = totalClicked > 0 ? ((totalClicked - totalConverted) / totalClicked) * 100 : 0;

      setFunnelStages([
        {
          id: 1,
          name: "Emails Sent",
          description: "Initial outreach delivered",
          count: totalSent,
          conversionRate: 100,
          dropOffRate: parseFloat(openDropOff.toFixed(1)),
          icon: "Send",
          status: "default"
        },
        {
          id: 2,
          name: "Emails Opened",
          description: "Recipients viewed email",
          count: totalOpened,
          conversionRate: parseFloat(openPct.toFixed(1)),
          dropOffRate: parseFloat(clickDropOff.toFixed(1)),
          icon: "Eye",
          status: "default"
        },
        {
          id: 3,
          name: "Links Clicked",
          description: "Engaged with content",
          count: totalClicked,
          conversionRate: parseFloat(clickPct.toFixed(1)),
          dropOffRate: parseFloat(convertDropOff.toFixed(1)),
          icon: "MousePointer",
          status: "warning"
        },
        {
          id: 4,
          name: "Converted",
          description: "Successfully converted leads",
          count: totalConverted,
          conversionRate: parseFloat(convertPct.toFixed(1)),
          dropOffRate: 0,
          icon: "CheckCircle",
          status: "success"
        }
      ]);

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching campaign KPIs:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.user_id]);

  useEffect(() => {
    fetchCampaignData();
  }, [fetchCampaignData]);

  // Auto-refresh every 15 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCampaignData();
    }, 900000);
    return () => clearInterval(interval);
  }, [fetchCampaignData]);

  const handleFilterChange = (filters) => {
    console.log('Filters applied:', filters);
  };

  const handleRefresh = () => {
    fetchCampaignData();
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
                    onClick={handleRefresh}
                    className="flex items-center justify-center w-10 h-10 bg-card border border-border rounded-lg hover:bg-muted transition-all duration-250 touch-target"
                    title="Refresh data"
                  >
                    <Icon name="RefreshCw" size={18} />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <Icon name="Loader2" size={32} className="animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading campaign data...</p>
                  </div>
                </div>
              ) : (
                <>
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

                  {topCampaigns.length > 0 && (
                    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-lg md:text-xl font-semibold text-foreground mb-1">Performance Insights</h2>
                          <p className="caption text-muted-foreground text-sm">Data-driven recommendations</p>
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
                              <h3 className="text-sm font-semibold text-foreground mb-1">Top Performer</h3>
                              <p className="caption text-muted-foreground text-xs">
                                Your &quot;{topCampaigns[0]?.name}&quot; campaign has the highest performance score with a {topCampaigns[0]?.openRate}% open rate and {topCampaigns[0]?.successRate}% conversion rate.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-primary/20 rounded-lg flex-shrink-0">
                              <Icon name="BarChart3" size={16} color="var(--color-primary)" />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-foreground mb-1">Overall Summary</h3>
                              <p className="caption text-muted-foreground text-xs">
                                Across {kpiData[0]?.value} campaigns, your average open rate is {kpiData[1]?.value} and click-through rate is {kpiData[2]?.value}.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default CampaignPerformance;

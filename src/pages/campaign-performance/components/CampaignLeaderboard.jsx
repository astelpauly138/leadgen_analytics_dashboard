import Icon from '../../../components/AppIcon';

const CampaignLeaderboard = ({ campaigns }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-foreground mb-1">Top Campaigns</h2>
          <p className="caption text-muted-foreground text-sm">Best performing sequences</p>
        </div>
        <div className="flex items-center justify-center w-10 h-10 bg-success/10 rounded-lg">
          <Icon name="Trophy" size={20} color="var(--color-success)" />
        </div>
      </div>
      <div className="space-y-4 overflow-y-auto min-h-0 max-h-[22rem]">
        {campaigns?.map((campaign, index) => (
          <div 
            key={campaign?.id}
            className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-all duration-250 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                  index === 0 ? 'bg-warning text-warning-foreground' :
                  index === 1 ? 'bg-muted-foreground/20 text-foreground' :
                  index === 2 ? 'bg-accent/20 text-accent': 'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground line-clamp-1">{campaign?.name}</h3>
                  <p className="caption text-muted-foreground text-xs mt-0.5">{campaign?.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-success">{campaign?.successRate}%</p>
                <p className="caption text-muted-foreground text-xs whitespace-nowrap">{campaign?.emailsSent} sent</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="caption text-muted-foreground">Success Rate</span>
                <span className="font-medium text-foreground">{campaign?.successRate}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-success to-primary rounded-full transition-all duration-500"
                  style={{ width: `${campaign?.successRate}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
              <div className="text-center">
                <p className="caption text-muted-foreground text-xs mb-1">Opens</p>
                <p className="text-sm font-semibold text-foreground">{campaign?.openRate}%</p>
              </div>
              <div className="text-center">
                <p className="caption text-muted-foreground text-xs mb-1">Clicks</p>
                <p className="text-sm font-semibold text-foreground">{campaign?.clickRate}%</p>
              </div>
              <div className="text-center">
                <p className="caption text-muted-foreground text-xs mb-1">Replies</p>
                <p className="text-sm font-semibold text-foreground">{campaign?.replyRate}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm font-medium transition-all duration-250 touch-target flex items-center justify-center gap-2 shrink-0">
        <span>View All Campaigns</span>
        <Icon name="ArrowRight" size={16} />
      </button>
    </div>
  );
};

export default CampaignLeaderboard;
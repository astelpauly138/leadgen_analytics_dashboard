import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const MobileLeadCard = ({ lead, isSelected, onSelect, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-primary/10 text-primary border-primary/20',
      contacted: 'bg-warning/10 text-warning border-warning/20',
      qualified: 'bg-success/10 text-success border-success/20',
      nurturing: 'bg-secondary/10 text-secondary border-secondary/20',
      converted: 'bg-success/20 text-success border-success/30'
    };
    return colors?.[status] || 'bg-muted text-muted-foreground border-border';
  };

  const getQualityColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    if (score >= 50) return 'text-secondary';
    return 'text-muted-foreground';
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(lead?.id)}
            className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer flex-shrink-0"
            aria-label={`Select ${lead?.name}`}
          />
          
          <Image
            src={lead?.avatar}
            alt={lead?.avatarAlt}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate mb-1">
              {lead?.name}
            </h3>
            <p className="caption text-muted-foreground text-xs truncate mb-2">
              {lead?.title} at {lead?.company}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(lead?.status)}`}>
                {lead?.status?.charAt(0)?.toUpperCase() + lead?.status?.slice(1)}
              </span>
              <div className="flex items-center gap-1">
                <Icon name="Star" size={12} className={getQualityColor(lead?.qualityScore)} />
                <span className={`text-xs font-semibold ${getQualityColor(lead?.qualityScore)}`}>
                  {lead?.qualityScore}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="Mail" size={14} />
            <span className="truncate">{lead?.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="Phone" size={14} />
            <span>{lead?.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="MapPin" size={14} />
            <span className="truncate">{lead?.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Icon name="Clock" size={14} className="text-muted-foreground" />
            <span className="caption text-muted-foreground text-xs">
              {formatDate(lead?.lastContact)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors touch-target"
              aria-label="Toggle details"
            >
              <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
            </button>
            <button
              onClick={() => onEdit(lead)}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors touch-target"
              aria-label="Edit lead"
            >
              <Icon name="Edit2" size={16} />
            </button>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 bg-muted/30 border-t border-border space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="caption text-muted-foreground text-xs mb-1">Industry</p>
              <p className="text-sm text-foreground">{lead?.industry}</p>
            </div>
            <div>
              <p className="caption text-muted-foreground text-xs mb-1">Source</p>
              <p className="text-sm text-foreground capitalize">{lead?.source?.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="caption text-muted-foreground text-xs mb-1">Company Size</p>
              <p className="text-sm text-foreground">{lead?.companySize}</p>
            </div>
            <div>
              <p className="caption text-muted-foreground text-xs mb-1">Revenue</p>
              <p className="text-sm text-foreground">{lead?.revenue}</p>
            </div>
          </div>
          
          <div>
            <p className="caption text-muted-foreground text-xs mb-1">Last Activity</p>
            <p className="text-sm text-foreground">{lead?.lastActivity}</p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            fullWidth
            iconName="ExternalLink"
            iconPosition="right"
            onClick={() => window.open(lead?.linkedin, '_blank')}
          >
            View LinkedIn Profile
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileLeadCard;
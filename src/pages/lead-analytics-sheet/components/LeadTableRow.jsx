import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const LeadTableRow = ({ lead, isSelected, onSelect, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-primary/10 text-primary',
      contacted: 'bg-warning/10 text-warning',
      qualified: 'bg-success/10 text-success',
      nurturing: 'bg-secondary/10 text-secondary',
      converted: 'bg-success/20 text-success'
    };
    return colors?.[status] || 'bg-muted text-muted-foreground';
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
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <tr className="border-b border-border hover:bg-muted/50 transition-colors">
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(lead?.id)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
            aria-label={`Select ${lead?.name}`}
          />
        </td>
        
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Image
              src={lead?.avatar}
              alt={lead?.avatarAlt}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{lead?.name}</p>
              <p className="caption text-muted-foreground text-xs truncate">{lead?.title}</p>
            </div>
          </div>
        </td>
        
        <td className="px-4 py-3">
          <p className="text-sm text-foreground truncate">{lead?.company}</p>
          <p className="caption text-muted-foreground text-xs truncate">{lead?.industry}</p>
        </td>
        
        <td className="px-4 py-3">
          <p className="text-sm text-foreground truncate">{lead?.email}</p>
        </td>
        
        <td className="px-4 py-3">
          <p className="text-sm text-foreground whitespace-nowrap">{lead?.phone}</p>
        </td>
        
        <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(lead?.status)}`}>
            {lead?.status?.charAt(0)?.toUpperCase() + lead?.status?.slice(1)}
          </span>
        </td>
        
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${getQualityColor(lead?.qualityScore)}`}>
              {lead?.qualityScore}
            </span>
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${getQualityColor(lead?.qualityScore)} bg-current`}
                style={{ width: `${lead?.qualityScore}%` }}
              />
            </div>
          </div>
        </td>
        
        <td className="px-4 py-3">
          <span className="text-sm text-foreground capitalize">{lead?.source?.replace('_', ' ')}</span>
        </td>
        
        <td className="px-4 py-3">
          <p className="text-sm text-foreground whitespace-nowrap">{formatDate(lead?.lastContact)}</p>
        </td>
        
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors touch-target"
              aria-label="View details"
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
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-muted/30 border-b border-border animate-fade-in">
          <td colSpan="10" className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="caption text-muted-foreground text-xs mb-1">Location</p>
                <p className="text-sm text-foreground">{lead?.location}</p>
              </div>
              
              <div>
                <p className="caption text-muted-foreground text-xs mb-1">Company Size</p>
                <p className="text-sm text-foreground">{lead?.companySize}</p>
              </div>
              
              <div>
                <p className="caption text-muted-foreground text-xs mb-1">Revenue</p>
                <p className="text-sm text-foreground">{lead?.revenue}</p>
              </div>
              
              <div>
                <p className="caption text-muted-foreground text-xs mb-1">LinkedIn</p>
                <a href={lead?.linkedin} className="text-sm text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  View Profile
                </a>
              </div>
              
              <div>
                <p className="caption text-muted-foreground text-xs mb-1">Engagement Score</p>
                <p className="text-sm text-foreground">{lead?.engagementScore}/100</p>
              </div>
              
              <div>
                <p className="caption text-muted-foreground text-xs mb-1">Last Activity</p>
                <p className="text-sm text-foreground">{lead?.lastActivity}</p>
              </div>
              
              <div className="md:col-span-2 lg:col-span-3">
                <p className="caption text-muted-foreground text-xs mb-1">Notes</p>
                <p className="text-sm text-foreground">{lead?.notes}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default LeadTableRow;
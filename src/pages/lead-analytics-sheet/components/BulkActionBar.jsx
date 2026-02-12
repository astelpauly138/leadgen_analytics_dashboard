import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkActionBar = ({ selectedCount, onEmail, onExport, onDelete, onClearSelection }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="bg-card border border-border rounded-xl shadow-lg px-6 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/20 rounded-lg">
              <Icon name="CheckSquare" size={16} color="var(--color-primary)" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {selectedCount} {selectedCount === 1 ? 'lead' : 'leads'} selected
            </span>
          </div>
          
          <div className="h-6 w-px bg-border" />
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Mail"
              iconPosition="left"
              onClick={onEmail}
            >
              Send Email
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
              onClick={onExport}
            >
              Export
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              iconName="Trash2"
              iconPosition="left"
              onClick={onDelete}
            >
              Delete
            </Button>
            
            <button
              onClick={onClearSelection}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors touch-target"
              aria-label="Clear selection"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionBar;
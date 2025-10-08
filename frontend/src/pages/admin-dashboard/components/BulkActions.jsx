import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActions = ({ selectedTasks, onBulkAction, onClearSelection }) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const actionOptions = [
    { value: '', label: 'Select Action' },
    { value: 'assign_reviewer', label: 'Assign Reviewer' },
    { value: 'change_priority', label: 'Change Priority' },
    { value: 'extend_deadline', label: 'Extend Deadline' },
    { value: 'mark_urgent', label: 'Mark as Urgent' },
    { value: 'generate_report', label: 'Generate Report' },
    { value: 'export_data', label: 'Export Data' }
  ];

  const handleExecuteAction = async () => {
    if (!selectedAction || selectedTasks?.length === 0) return;

    setIsProcessing(true);
    try {
      await onBulkAction(selectedAction, selectedTasks);
      setSelectedAction('');
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedTasks?.length === 0) {
    return null;
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 shadow-elevation-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={20} className="text-primary" />
            <span className="font-body font-medium text-sm text-foreground">
              {selectedTasks?.length} task{selectedTasks?.length !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Select
              options={actionOptions}
              value={selectedAction}
              onChange={setSelectedAction}
              placeholder="Choose action"
              className="min-w-48"
            />

            <Button
              variant="default"
              size="sm"
              onClick={handleExecuteAction}
              disabled={!selectedAction || isProcessing}
              loading={isProcessing}
              iconName="Play"
              iconSize={16}
            >
              Execute
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          iconName="X"
          iconSize={16}
        >
          Clear Selection
        </Button>
      </div>
      {selectedAction && (
        <div className="mt-3 pt-3 border-t border-primary/20">
          <p className="font-body text-xs text-muted-foreground">
            This action will be applied to {selectedTasks?.length} selected task{selectedTasks?.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default BulkActions;
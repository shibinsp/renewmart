import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return {
          label: 'Draft',
          className: 'bg-muted text-muted-foreground border-muted-foreground/20'
        };
      case 'under-review':
        return {
          label: 'Under Review',
          className: 'bg-warning/10 text-warning border-warning/20'
        };
      case 'approved':
        return {
          label: 'Approved',
          className: 'bg-success/10 text-success border-success/20'
        };
      case 'published':
        return {
          label: 'Published',
          className: 'bg-primary/10 text-primary border-primary/20'
        };
      default:
        return {
          label: status,
          className: 'bg-muted text-muted-foreground border-muted-foreground/20'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-medium border ${config?.className}`}>
      {config?.label}
    </span>
  );
};

export default StatusBadge;
import React from 'react';
import { WORKFLOW_STATES } from '../../contexts/WorkflowContext';
import Icon from './AppIcon';

const WorkflowProgress = ({ currentState, workflowId, className = '' }) => {
    const workflowSteps = [
        {
            state: WORKFLOW_STATES.SUBMITTED,
            label: 'Submitted',
            description: 'Site registration submitted by landowner',
            icon: 'FileText',
            color: 'blue'
        },
        {
            state: WORKFLOW_STATES.VERIFIED_BY_ADMIN,
            label: 'Verified',
            description: 'Admin verified the registration form',
            icon: 'CheckCircle',
            color: 'yellow'
        },
        {
            state: WORKFLOW_STATES.TASKS_ASSIGNED,
            label: 'Tasks Assigned',
            description: 'Tasks assigned to RE roles',
            icon: 'Users',
            color: 'purple'
        },
        {
            state: WORKFLOW_STATES.IN_PROGRESS,
            label: 'In Progress',
            description: 'RE roles working on tasks',
            icon: 'Clock',
            color: 'orange'
        },
        {
            state: WORKFLOW_STATES.INTEREST_REQUEST,
            label: 'Interest Request',
            description: 'Investor sent interest request',
            icon: 'Heart',
            color: 'indigo'
        },
        {
            state: WORKFLOW_STATES.INTEREST_ACCEPTED,
            label: 'Interest Accepted',
            description: 'Admin accepted investor interest',
            icon: 'CheckCircle',
            color: 'green'
        },
        {
            state: WORKFLOW_STATES.READY_TO_BUILD,
            label: 'Ready to Build',
            description: 'Project ready for construction',
            icon: 'Hammer',
            color: 'green'
        }
    ];

    const getCurrentStepIndex = () => {
        return workflowSteps.findIndex(step => step.state === currentState);
    };

    const getStepColor = (stepIndex, currentStepIndex) => {
        if (stepIndex < currentStepIndex) {
            return 'text-green-600 bg-green-100 border-green-200';
        } else if (stepIndex === currentStepIndex) {
            return 'text-blue-600 bg-blue-100 border-blue-200';
        } else {
            return 'text-gray-400 bg-gray-100 border-gray-200';
        }
    };

    const getStepIcon = (stepIndex, currentStepIndex) => {
        if (stepIndex < currentStepIndex) {
            return 'CheckCircle';
        } else if (stepIndex === currentStepIndex) {
            return 'Clock';
        } else {
            return 'Circle';
        }
    };

    const currentStepIndex = getCurrentStepIndex();

    return (
        <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Workflow Progress</h3>
                <div className="text-sm text-muted-foreground">
                    Step {currentStepIndex + 1} of {workflowSteps.length}
                </div>
            </div>

            <div className="space-y-4">
                {workflowSteps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const isPending = index > currentStepIndex;

                    return (
                        <div key={step.state} className="flex items-start space-x-4">
                            {/* Step Icon */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStepColor(index, currentStepIndex)}`}>
                                <Icon
                                    name={getStepIcon(index, currentStepIndex)}
                                    size={16}
                                    className={isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-400'}
                                />
                            </div>

                            {/* Step Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                    <h4 className={`text-sm font-medium ${isCompleted ? 'text-green-900' : isCurrent ? 'text-blue-900' : 'text-gray-500'
                                        }`}>
                                        {step.label}
                                    </h4>
                                    {isCurrent && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                            Current
                                        </span>
                                    )}
                                    {isCompleted && (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <p className={`text-xs mt-1 ${isCompleted ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-500'
                                    }`}>
                                    {step.description}
                                </p>
                            </div>

                            {/* Progress Line */}
                            {index < workflowSteps.length - 1 && (
                                <div className="absolute left-4 top-8 w-0.5 h-8 bg-gray-200">
                                    <div
                                        className={`w-full h-full transition-all duration-300 ${index < currentStepIndex ? 'bg-green-400' : 'bg-gray-200'
                                            }`}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>Overall Progress</span>
                    <span>{Math.round(((currentStepIndex + 1) / workflowSteps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentStepIndex + 1) / workflowSteps.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default WorkflowProgress;

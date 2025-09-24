"""Initial migration

Revision ID: 3be36e6b146e
Revises: 
Create Date: 2025-09-15 09:29:15.930242

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '3be36e6b146e'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create lookup tables first
    op.create_table('lu_roles',
        sa.Column('role_key', sa.String(), nullable=False),
        sa.Column('role_name', sa.String(), nullable=False),
        sa.Column('description', sa.Text()),
        sa.PrimaryKeyConstraint('role_key')
    )
    
    op.create_table('lu_status',
        sa.Column('status_key', sa.String(), nullable=False),
        sa.Column('status_name', sa.String(), nullable=False),
        sa.Column('description', sa.Text()),
        sa.PrimaryKeyConstraint('status_key')
    )
    
    op.create_table('lu_task_status',
        sa.Column('status_key', sa.String(), nullable=False),
        sa.Column('status_name', sa.String(), nullable=False),
        sa.Column('description', sa.Text()),
        sa.PrimaryKeyConstraint('status_key')
    )
    
    op.create_table('lu_energy_types',
        sa.Column('energy_type_key', sa.String(), nullable=False),
        sa.Column('energy_type_name', sa.String(), nullable=False),
        sa.Column('description', sa.Text()),
        sa.PrimaryKeyConstraint('energy_type_key')
    )
    
    op.create_table('section_definitions',
        sa.Column('section_key', sa.String(), nullable=False),
        sa.Column('section_name', sa.String(), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('required_role', sa.String(), sa.ForeignKey('lu_roles.role_key')),
        sa.Column('order_index', sa.Integer()),
        sa.PrimaryKeyConstraint('section_key')
    )
    
    # Create user table
    op.create_table('user',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('first_name', sa.String()),
        sa.Column('last_name', sa.String()),
        sa.Column('phone', sa.String()),
        sa.Column('company', sa.String()),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('user_id'),
        sa.UniqueConstraint('email')
    )
    
    op.create_table('user_roles',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('role_key', sa.String(), nullable=False),
        sa.Column('assigned_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['role_key'], ['lu_roles.role_key']),
        sa.ForeignKeyConstraint(['user_id'], ['user.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id', 'role_key')
    )
    
    # Create lands table
    op.create_table('lands',
        sa.Column('land_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('landowner_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('location_text', sa.String()),
        sa.Column('coordinates', postgresql.JSONB()),
        sa.Column('area_acres', sa.Numeric(10, 2)),
        sa.Column('land_type', sa.String()),
        sa.Column('energy_type', sa.String(), sa.ForeignKey('lu_energy_types.energy_type_key')),
        sa.Column('description', sa.Text()),
        sa.Column('status', sa.String(), sa.ForeignKey('lu_status.status_key'), nullable=False, server_default='draft'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['landowner_id'], ['user.user_id']),
        sa.PrimaryKeyConstraint('land_id')
    )
    
    op.create_table('land_sections',
        sa.Column('land_section_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('land_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('section_key', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, server_default='draft'),
        sa.Column('assigned_role', sa.String()),
        sa.Column('assigned_user', postgresql.UUID(as_uuid=True)),
        sa.Column('data', postgresql.JSONB()),
        sa.Column('reviewer_comments', sa.Text()),
        sa.Column('submitted_at', sa.DateTime(timezone=True)),
        sa.Column('reviewed_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['assigned_role'], ['lu_roles.role_key']),
        sa.ForeignKeyConstraint(['assigned_user'], ['user.user_id']),
        sa.ForeignKeyConstraint(['land_id'], ['lands.land_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['section_key'], ['section_definitions.section_key']),
        sa.ForeignKeyConstraint(['status'], ['lu_status.status_key']),
        sa.PrimaryKeyConstraint('land_section_id')
    )
    
    # Create documents table
    op.create_table('documents',
        sa.Column('document_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('land_id', postgresql.UUID(as_uuid=True)),
        sa.Column('land_section_id', postgresql.UUID(as_uuid=True)),
        sa.Column('filename', sa.String(), nullable=False),
        sa.Column('original_filename', sa.String(), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('file_size', sa.Integer()),
        sa.Column('mime_type', sa.String()),
        sa.Column('description', sa.Text()),
        sa.Column('uploaded_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['land_id'], ['lands.land_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['land_section_id'], ['land_sections.land_section_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['uploaded_by'], ['user.user_id']),
        sa.PrimaryKeyConstraint('document_id')
    )
    
    # Create tasks table
    op.create_table('tasks',
        sa.Column('task_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('land_id', postgresql.UUID(as_uuid=True)),
        sa.Column('land_section_id', postgresql.UUID(as_uuid=True)),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('assigned_role', sa.String()),
        sa.Column('assigned_to', postgresql.UUID(as_uuid=True)),
        sa.Column('status', sa.String(), nullable=False, server_default='assigned'),
        sa.Column('start_date', sa.Date()),
        sa.Column('end_date', sa.Date()),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['assigned_role'], ['lu_roles.role_key']),
        sa.ForeignKeyConstraint(['assigned_to'], ['user.user_id']),
        sa.ForeignKeyConstraint(['created_by'], ['user.user_id']),
        sa.ForeignKeyConstraint(['land_id'], ['lands.land_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['land_section_id'], ['land_sections.land_section_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['status'], ['lu_task_status.status_key']),
        sa.PrimaryKeyConstraint('task_id')
    )
    
    op.create_table('task_history',
        sa.Column('history_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('task_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('old_status', sa.String()),
        sa.Column('new_status', sa.String(), nullable=False),
        sa.Column('changed_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('comments', sa.Text()),
        sa.Column('start_ts', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('end_ts', sa.DateTime(timezone=True)),
        sa.ForeignKeyConstraint(['changed_by'], ['user.user_id']),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.task_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('history_id')
    )
    
    # Create investor interests table
    op.create_table('investor_interests',
        sa.Column('interest_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('land_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('investor_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('investment_amount', sa.Numeric(15, 2)),
        sa.Column('message', sa.Text()),
        sa.Column('status', sa.String(), server_default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['investor_id'], ['user.user_id']),
        sa.ForeignKeyConstraint(['land_id'], ['lands.land_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('interest_id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop tables in reverse order
    op.drop_table('investor_interests')
    op.drop_table('task_history')
    op.drop_table('tasks')
    op.drop_table('documents')
    op.drop_table('land_sections')
    op.drop_table('lands')
    op.drop_table('user_roles')
    op.drop_table('user')
    op.drop_table('section_definitions')
    op.drop_table('lu_energy_types')
    op.drop_table('lu_task_status')
    op.drop_table('lu_status')
    op.drop_table('lu_roles')

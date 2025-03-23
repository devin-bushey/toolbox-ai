-- Add safety standards columns to toolbox_meetings table
ALTER TABLE toolbox_meetings
ADD COLUMN IF NOT EXISTS safety_standards TEXT,
ADD COLUMN IF NOT EXISTS safety_standards_sources JSONB,
ADD COLUMN IF NOT EXISTS safety_standards_metadata JSONB; 
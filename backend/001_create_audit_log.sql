-- Migration: Create member_audit_log table
-- Version: 001
-- Date: 2025-10-24

CREATE TABLE IF NOT EXISTS member_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL,
    user_id UUID,
    
    action VARCHAR(50) NOT NULL, -- create, update, delete
    field_name VARCHAR(100), -- Campo modificado (para updates)
    old_value TEXT, -- Valor anterior
    new_value TEXT, -- Valor nuevo
    
    ip_address VARCHAR(50), -- IP del cliente
    user_agent VARCHAR(255), -- User agent del navegador
    
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Foreign keys
    CONSTRAINT fk_member 
        FOREIGN KEY (member_id) 
        REFERENCES members(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL
);

-- Índices para mejorar performance
CREATE INDEX idx_member_audit_member_id ON member_audit_log(member_id);
CREATE INDEX idx_member_audit_user_id ON member_audit_log(user_id);
CREATE INDEX idx_member_audit_changed_at ON member_audit_log(changed_at DESC);
CREATE INDEX idx_member_audit_action ON member_audit_log(action);

-- Comentarios
COMMENT ON TABLE member_audit_log IS 'Registro de auditoría de cambios en miembros';
COMMENT ON COLUMN member_audit_log.action IS 'Tipo de acción: create, update, delete';
COMMENT ON COLUMN member_audit_log.field_name IS 'Campo modificado (solo para updates)';
COMMENT ON COLUMN member_audit_log.old_value IS 'Valor anterior del campo';
COMMENT ON COLUMN member_audit_log.new_value IS 'Valor nuevo del campo';
COMMENT ON COLUMN member_audit_log.ip_address IS 'Dirección IP del cliente que hizo el cambio';
COMMENT ON COLUMN member_audit_log.user_agent IS 'User agent del navegador';

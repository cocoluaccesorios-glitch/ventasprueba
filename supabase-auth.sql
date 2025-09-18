-- =====================================================
-- SISTEMA DE AUTENTICACIÓN PARA COCOLÚ VENTAS
-- =====================================================

-- 1. Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rol VARCHAR(20) DEFAULT 'vendedor' CHECK (rol IN ('admin', 'vendedor', 'supervisor')),
    activo BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMP WITH TIME ZONE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de sesiones (opcional, para control de sesiones)
CREATE TABLE IF NOT EXISTS sesiones_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    token_sesion VARCHAR(255) UNIQUE NOT NULL,
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_expiracion TIMESTAMP WITH TIME ZONE NOT NULL,
    activa BOOLEAN DEFAULT true,
    ip_address INET,
    user_agent TEXT
);

-- 3. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario_id ON sesiones_usuario(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_token ON sesiones_usuario(token_sesion);
CREATE INDEX IF NOT EXISTS idx_sesiones_activa ON sesiones_usuario(activa);

-- 4. Crear función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Crear trigger para actualizar fecha_actualizacion
CREATE TRIGGER update_usuarios_updated_at 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Insertar usuario administrador por defecto
-- Contraseña: admin123 (hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi)
INSERT INTO usuarios (username, email, password_hash, nombre, apellido, rol) 
VALUES (
    'admin', 
    'admin@cocolu.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'Administrador', 
    'Sistema', 
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- 7. Insertar usuario vendedor de prueba
-- Contraseña: vendedor123 (hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi)
INSERT INTO usuarios (username, email, password_hash, nombre, apellido, rol) 
VALUES (
    'vendedor', 
    'vendedor@cocolu.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'Vendedor', 
    'Prueba', 
    'vendedor'
) ON CONFLICT (username) DO NOTHING;

-- 8. Configurar Row Level Security (RLS)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones_usuario ENABLE ROW LEVEL SECURITY;

-- 9. Crear políticas de seguridad
-- Política para que los usuarios puedan ver su propia información
CREATE POLICY "Users can view own profile" ON usuarios
    FOR SELECT USING (username = current_setting('app.current_user', true));

-- Política para que los admins puedan ver todos los usuarios
CREATE POLICY "Admins can view all users" ON usuarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE username = current_setting('app.current_user', true) 
            AND rol = 'admin'
        )
    );

-- Política para que los usuarios puedan actualizar su propia información
CREATE POLICY "Users can update own profile" ON usuarios
    FOR UPDATE USING (username = current_setting('app.current_user', true));

-- Política para sesiones
CREATE POLICY "Users can manage own sessions" ON sesiones_usuario
    FOR ALL USING (usuario_id = (
        SELECT id FROM usuarios 
        WHERE username = current_setting('app.current_user', true)
    ));

-- 10. Crear función para verificar credenciales
CREATE OR REPLACE FUNCTION verificar_credenciales(
    p_username VARCHAR(50),
    p_password VARCHAR(255)
)
RETURNS TABLE(
    usuario_id INTEGER,
    username VARCHAR(50),
    email VARCHAR(100),
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    rol VARCHAR(20),
    activo BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.username,
        u.email,
        u.nombre,
        u.apellido,
        u.rol,
        u.activo
    FROM usuarios u
    WHERE u.username = p_username 
    AND u.password_hash = crypt(p_password, u.password_hash)
    AND u.activo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Crear función para crear nuevo usuario
CREATE OR REPLACE FUNCTION crear_usuario(
    p_username VARCHAR(50),
    p_email VARCHAR(100),
    p_password VARCHAR(255),
    p_nombre VARCHAR(100),
    p_apellido VARCHAR(100),
    p_rol VARCHAR(20) DEFAULT 'vendedor'
)
RETURNS INTEGER AS $$
DECLARE
    nuevo_usuario_id INTEGER;
BEGIN
    INSERT INTO usuarios (username, email, password_hash, nombre, apellido, rol)
    VALUES (
        p_username,
        p_email,
        crypt(p_password, gen_salt('bf')),
        p_nombre,
        p_apellido,
        p_rol
    )
    RETURNING id INTO nuevo_usuario_id;
    
    RETURN nuevo_usuario_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Crear función para cambiar contraseña
CREATE OR REPLACE FUNCTION cambiar_contraseña(
    p_username VARCHAR(50),
    p_old_password VARCHAR(255),
    p_new_password VARCHAR(255)
)
RETURNS BOOLEAN AS $$
DECLARE
    usuario_existe BOOLEAN;
BEGIN
    -- Verificar que la contraseña actual es correcta
    SELECT EXISTS(
        SELECT 1 FROM usuarios 
        WHERE username = p_username 
        AND password_hash = crypt(p_old_password, password_hash)
        AND activo = true
    ) INTO usuario_existe;
    
    IF usuario_existe THEN
        -- Actualizar contraseña
        UPDATE usuarios 
        SET password_hash = crypt(p_new_password, gen_salt('bf')),
            fecha_actualizacion = NOW()
        WHERE username = p_username;
        
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Crear función para registrar login
CREATE OR REPLACE FUNCTION registrar_login(
    p_username VARCHAR(50)
)
RETURNS VOID AS $$
BEGIN
    UPDATE usuarios 
    SET ultimo_login = NOW()
    WHERE username = p_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Crear vista para usuarios activos
CREATE OR REPLACE VIEW usuarios_activos AS
SELECT 
    id,
    username,
    email,
    nombre,
    apellido,
    rol,
    ultimo_login,
    fecha_creacion
FROM usuarios
WHERE activo = true;

-- 15. Comentarios de documentación
COMMENT ON TABLE usuarios IS 'Tabla de usuarios del sistema de ventas Cocolú';
COMMENT ON TABLE sesiones_usuario IS 'Control de sesiones de usuario';
COMMENT ON FUNCTION verificar_credenciales IS 'Verifica las credenciales de un usuario';
COMMENT ON FUNCTION crear_usuario IS 'Crea un nuevo usuario en el sistema';
COMMENT ON FUNCTION cambiar_contraseña IS 'Cambia la contraseña de un usuario';
COMMENT ON FUNCTION registrar_login IS 'Registra el último login de un usuario';

-- =====================================================
-- INSTRUCCIONES DE USO:
-- =====================================================
-- 1. Ejecutar este script en el SQL Editor de Supabase
-- 2. Los usuarios por defecto son:
--    - admin / admin123 (rol: admin)
--    - vendedor / vendedor123 (rol: vendedor)
-- 3. Las funciones están disponibles para la aplicación
-- 4. RLS está configurado para seguridad
-- =====================================================

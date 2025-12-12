import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
class TestAuthentication:
    """Tests para endpoints de autenticación"""
    
    base_url = "http://test"
    
    async def test_register_user(self, client: AsyncClient):
        """Test: Registrar nuevo usuario"""
        response = await client.post(
            f"{self.base_url}/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "SecurePass123!",
                "full_name": "Test User",
                "phone": "+54 9 11 1234-5678"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["full_name"] == "Test User"
        assert "id" in data
        print(f"✅ Usuario registrado: {data['email']}")
    
    async def test_register_duplicate_email(self, client: AsyncClient):
        """Test: Intentar registrar email duplicado"""
        # Primer registro
        await client.post(
            f"{self.base_url}/api/v1/auth/register",
            json={
                "email": "duplicate@example.com",
                "password": "Password123!",
                "full_name": "First User"
            }
        )
        
        # Segundo intento con mismo email
        response = await client.post(
            f"{self.base_url}/api/v1/auth/register",
            json={
                "email": "duplicate@example.com",
                "password": "Password123!",
                "full_name": "Second User"
            }
        )
        assert response.status_code == 400
        print("✅ Email duplicado rechazado correctamente")
    
    async def test_login_success(self, client: AsyncClient):
        """Test: Login exitoso"""
        # Primero registrar
        await client.post(
            f"{self.base_url}/api/v1/auth/register",
            json={
                "email": "login@example.com",
                "password": "Password123!",
                "full_name": "Login User"
            }
        )
        
        # Luego login
        response = await client.post(
            f"{self.base_url}/api/v1/auth/login",
            json={
                "email": "login@example.com",
                "password": "Password123!"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        print(f"✅ Login exitoso. Token: {data['access_token'][:20]}...")
        return data["access_token"]
    
    async def test_login_wrong_password(self, client: AsyncClient):
        """Test: Login con contraseña incorrecta"""
        await client.post(
            f"{self.base_url}/api/v1/auth/register",
            json={
                "email": "wrongpass@example.com",
                "password": "CorrectPass123!",
                "full_name": "User"
            }
        )
        
        response = await client.post(
            f"{self.base_url}/api/v1/auth/login",
            json={
                "email": "wrongpass@example.com",
                "password": "WrongPassword123!"
            }
        )
        assert response.status_code == 401
        print("✅ Contraseña incorrecta rechazada")
    
    async def test_get_current_user(self, client: AsyncClient):
        """Test: Obtener usuario actual con token"""
        # Registrar y login
        await client.post(
            f"{self.base_url}/api/v1/auth/register",
            json={
                "email": "current@example.com",
                "password": "Password123!",
                "full_name": "Current User"
            }
        )
        
        login_response = await client.post(
            f"{self.base_url}/api/v1/auth/login",
            json={
                "email": "current@example.com",
                "password": "Password123!"
            }
        )
        token = login_response.json()["access_token"]
        
        # Obtener usuario actual
        response = await client.get(
            f"{self.base_url}/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "current@example.com"
        print(f"✅ Usuario actual obtenido: {data['full_name']}")
    
    async def test_logout(self, client: AsyncClient):
        """Test: Logout"""
        # Registrar y login
        await client.post(
            f"{self.base_url}/api/v1/auth/register",
            json={
                "email": "logout@example.com",
                "password": "Password123!",
                "full_name": "Logout User"
            }
        )
        
        login_response = await client.post(
            f"{self.base_url}/api/v1/auth/login",
            json={
                "email": "logout@example.com",
                "password": "Password123!"
            }
        )
        token = login_response.json()["access_token"]
        
        # Logout
        response = await client.post(
            f"{self.base_url}/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        print("✅ Logout exitoso")
    
    async def test_refresh_token(self, client: AsyncClient):
        """Test: Refrescar token de acceso"""
        # Registrar y login
        await client.post(
            f"{self.base_url}/api/v1/auth/register",
            json={
                "email": "refresh@example.com",
                "password": "Password123!",
                "full_name": "Refresh User"
            }
        )
        
        login_response = await client.post(
            f"{self.base_url}/api/v1/auth/login",
            json={
                "email": "refresh@example.com",
                "password": "Password123!"
            }
        )
        refresh_token = login_response.json()["refresh_token"]
        
        # Refrescar token
        response = await client.post(
            f"{self.base_url}/api/v1/auth/refresh",
            json={"refresh_token": refresh_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        print("✅ Token refrescado exitosamente")
    
    async def test_unauthorized_access(self, client: AsyncClient):
        """Test: Acceso sin autenticación"""
        response = await client.get(f"{self.base_url}/api/v1/auth/me")
        assert response.status_code == 401
        print("✅ Acceso no autorizado bloqueado")

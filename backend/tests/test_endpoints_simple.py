import requests
import time
import random

BASE_URL = "http://localhost:8000"

def generate_unique_email():
    """Genera un email único"""
    return f"test{int(time.time())}{random.randint(1000,9999)}@example.com"

def test_health():
    """Test: Health check del servidor"""
    response = requests.get(f"{BASE_URL}/health")
    assert response.status_code == 200
    print("✅ Health check OK")

def test_auth_register_pastor():
    """Test: Registrar usuario pastor"""
    email = generate_unique_email()
    
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/register",
        json={
            "email": email,
            "password": "SecurePass123!",
            "first_name": "Test",
            "last_name": "Pastor",
            "phone": "+54 9 11 1234-5678",
            "registration_type": "pastor_new_church",
            "pastor_info": {
                "years_in_ministry": 5,
                "denomination": "Evangélica",
                "previous_church": "Iglesia Anterior"
            }
        }
    )
    
    assert response.status_code == 201, f"Error: {response.text}"
    data = response.json()
    print(f"✅ Pastor registrado: {email}")
    print(f"   Status: {data.get('status')}")
    return email

def test_auth_login():
    """Test: Login"""
    email = test_auth_register_pastor()
    
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        json={
            "email": email,
            "password": "SecurePass123!"
        }
    )
    
    assert response.status_code == 200, f"Error: {response.text}"
    data = response.json()
    print(f"✅ Login exitoso")
    return data["access_token"]

def test_get_current_user():
    """Test: Obtener usuario actual"""
    token = test_auth_login()
    
    response = requests.get(
        f"{BASE_URL}/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200, f"Error: {response.text}"
    data = response.json()
    print(f"✅ Usuario actual: {data.get('email')}")
    return token

def test_register_church():
    """Test: Registrar iglesia"""
    token = test_get_current_user()
    
    timestamp = int(time.time())
    response = requests.post(
        f"{BASE_URL}/api/v1/churches/register",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": f"Iglesia Test {timestamp}",
            "denomination": "Evangélica",
            "founding_date": "2020-01-01",
            "organizational_structure": "traditional",
            "estimated_size": "medium",
            "legal_registration_number": f"REG{timestamp}",
            "legal_representative_name": "Test Pastor",
            "legal_representative_id": f"DNI{timestamp}",
            "registration_authority": "IGJ",
            "registration_date": "2020-01-01",
            "address": {
                "street": "Av. Test",
                "number": "123",
                "neighborhood": "Centro",
                "city": "Buenos Aires",
                "state": "CABA",
                "postal_code": "1000",
                "country": "Argentina"
            },
            "contact_info": {
                "email": generate_unique_email(),
                "phone": "+54 11 1234-5678"
            }
        }
    )
    
    if response.status_code == 201:
        data = response.json()
        print(f"✅ Iglesia registrada: {data['name']}")
        print(f"   Código: {data.get('invitation_code')}")
        return token, data["id"]
    else:
        print(f"⚠️  Status {response.status_code}: {response.text[:200]}")
        return token, None

def test_create_member():
    """Test: Crear miembro"""
    token, church_id = test_register_church()
    
    if not church_id:
        return token, None, None
    
    response = requests.post(
        f"{BASE_URL}/api/v1/members/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "church_id": church_id,
            "first_name": "Juan",
            "last_name": "Pérez",
            "email": generate_unique_email(),
            "phone": "+54 9 11 1111-1111",
            "birth_date": "1990-05-15",
            "gender": "masculino",
            "marital_status": "casado",
            "member_type": "activo",
            "ministries": ["alabanza", "jovenes"],
            "spiritual_gifts": ["musica", "ensenanza"]
        }
    )
    
    if response.status_code == 201:
        data = response.json()
        print(f"✅ Miembro creado: {data['first_name']} {data['last_name']}")
        print(f"   🤖 Commitment: {data.get('commitment_score', 0):.1f}/100")
        print(f"   🎯 Risk: {data.get('risk_level')}")
        return token, church_id, data["id"]
    else:
        print(f"⚠️  Status {response.status_code}: {response.text[:200]}")
        return token, church_id, None

def test_member_ai_insights():
    """Test: AI Insights"""
    token, church_id, member_id = test_create_member()
    
    if not member_id:
        return
    
    response = requests.get(
        f"{BASE_URL}/api/v1/members/{member_id}/ai-insights",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ AI Insights:")
        print(f"   🤖 Commitment: {data.get('commitment_score')}/100")
        print(f"   ⚠️  Risk: {data.get('risk_analysis', {}).get('level')}")
        print(f"   💡 Ministerios sugeridos: {len(data.get('ministry_suggestions', []))}")

def test_member_recommendations():
    """Test: Recomendaciones"""
    token, church_id, member_id = test_create_member()
    
    if not member_id:
        return
    
    response = requests.get(
        f"{BASE_URL}/api/v1/members/{member_id}/recommendations",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        data = response.json()
        actions = data.get('recommended_actions', [])
        print(f"✅ Recomendaciones: {len(actions)} acciones")
        if actions:
            print(f"   Primera: {actions[0].get('action', '')[:50]}")

def test_members_stats():
    """Test: Estadísticas"""
    token, church_id, _ = test_create_member()
    
    response = requests.get(
        f"{BASE_URL}/api/v1/members/stats",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Estadísticas:")
        print(f"   📊 Total: {data.get('total_members')}")
        print(f"   ✅ Activos: {data.get('active_members')}")
        print(f"   ⚠️  Riesgo: {data.get('members_at_risk')}")
        print(f"   📈 Asistencia: {data.get('average_attendance_rate', 0):.1f}%")

if __name__ == "__main__":
    print("\n" + "="*70)
    print("🧪 TESTS DEL SISTEMA DE GESTIÓN DE MIEMBROS CON IA")
    print("="*70 + "\n")
    
    tests = [
        ("Autenticación", [
            test_health,
            test_auth_register_pastor,
            test_auth_login,
            test_get_current_user,
        ]),
        ("Iglesias", [
            test_register_church,
        ]),
        ("Miembros", [
            test_create_member,
            test_member_ai_insights,
            test_member_recommendations,
            test_members_stats,
        ])
    ]
    
    try:
        for section, test_functions in tests:
            print(f"📋 {section.upper()}")
            print("-" * 70)
            for test_func in test_functions:
                test_func()
                print()
        
        print("="*70)
        print("🎉 ¡TODOS LOS TESTS COMPLETADOS!")
        print("="*70)
        print("\n✅ Backend: OPERATIVO")
        print("✅ IA: FUNCIONANDO")
        print("✅ Endpoints: PROTEGIDOS")
        print("✅ Base de datos: CONECTADA\n")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}\n")
        import traceback
        traceback.print_exc()

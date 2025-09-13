import requests
import json
from datetime import datetime

# API Configuration
API_BASE_URL = "http://localhost:8000"

def test_login(email, password, expected_role):
    """Test login credentials and return result"""
    try:
        # Prepare login data
        login_data = {
            "email": email,
            "password": password
        }
        
        # Make login request
        response = requests.post(
            f"{API_BASE_URL}/api/users/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('access_token')
            token_type = data.get('token_type')
            
            print(f"✅ SUCCESS: {email}")
            print(f"   - Token Type: {token_type}")
            print(f"   - Token: {token[:50]}..." if token else "   - No token received")
            print(f"   - Expected Role: {expected_role}")
            
            # Test token validation by calling a protected endpoint
            if token:
                headers = {"Authorization": f"Bearer {token}"}
                me_response = requests.get(f"{API_BASE_URL}/api/auth/me", headers=headers)
                if me_response.status_code == 200:
                    user_data = me_response.json()
                    actual_roles = user_data.get('roles', [])
                    print(f"   - Actual Roles: {', '.join(actual_roles)}")
                    print(f"   - Role Match: {'✅' if expected_role in actual_roles else '❌'}")
                else:
                    print(f"   - Token validation failed: {me_response.status_code}")
            
            return True
            
        else:
            print(f"❌ FAILED: {email}")
            print(f"   - Status Code: {response.status_code}")
            print(f"   - Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {email} - {str(e)}")
        return False

def main():
    """Test all demo credentials"""
    print(f"🧪 Testing Demo Login Credentials - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    # Demo credentials to test
    test_cases = [
        ("landowner@renewmart.com", "Land2024!", "landowner"),
        ("investor@renewmart.com", "Invest2024!", "investor"),
        ("admin@renewmart.com", "Admin2024!", "administrator")
    ]
    
    results = []
    
    for email, password, expected_role in test_cases:
        print(f"\n🔐 Testing: {email}")
        print("-" * 50)
        success = test_login(email, password, expected_role)
        results.append((email, success))
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 SUMMARY:")
    successful = sum(1 for _, success in results if success)
    total = len(results)
    
    for email, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"   {status}: {email}")
    
    print(f"\n🎯 Overall Result: {successful}/{total} credentials working")
    
    if successful == total:
        print("🎉 All demo credentials are working correctly!")
    else:
        print("⚠️  Some credentials failed - check the logs above")

if __name__ == "__main__":
    main()
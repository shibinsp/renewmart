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
                    return True
                else:
                    print(f"   - ❌ Token validation failed: {me_response.status_code}")
                    return False
            else:
                print("   - ❌ No token received")
                return False
        else:
            print(f"❌ FAILED: {email}")
            print(f"   - Status Code: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   - Error: {error_data.get('detail', 'Unknown error')}")
            except:
                print(f"   - Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {email}")
        print(f"   - Exception: {str(e)}")
        return False

def main():
    print(f"🧪 Testing All Demo Login Credentials - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    # All demo credentials to test
    credentials = [
        ("landowner@renewmart.com", "Land2024!", "landowner"),
        ("investor@renewmart.com", "Invest2024!", "investor"),
        ("admin@renewmart.com", "Admin2024!", "administrator"),
        ("sales@renewmart.com", "Sales2024!", "re_sales_advisor"),
        ("analyst@renewmart.com", "Analyst2024!", "re_analyst"),
        ("governance@renewmart.com", "Gov2024!", "re_governance_lead"),
        ("manager@renewmart.com", "Manager2024!", "project_manager")
    ]
    
    results = []
    
    for email, password, expected_role in credentials:
        print(f"\n🔐 Testing: {email}")
        print("-" * 50)
        success = test_login(email, password, expected_role)
        results.append((email, success))
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 SUMMARY:")
    
    passed = 0
    for email, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"   {status}: {email}")
        if success:
            passed += 1
    
    total = len(results)
    print(f"\n🎯 Overall Result: {passed}/{total} credentials working")
    
    if passed == total:
        print("🎉 All demo credentials are working correctly!")
    else:
        print(f"⚠️  {total - passed} credential(s) failed. Please check the issues above.")

if __name__ == "__main__":
    main()
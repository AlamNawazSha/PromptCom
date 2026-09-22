import urllib.request
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:3000"

def test_endpoint(name, url, method="GET", data=None):
    try:
        headers = {"Content-Type": "application/json"} if data else {}
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode("utf-8") if data else None,
            headers=headers,
            method=method
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            status = response.status
            body = response.read().decode("utf-8")
            print(f"✅ [{status}] {name}")
            return True, body
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        print(f"❌ [HTTP {e.code}] {name}: {body[:150]}")
        return False, body
    except Exception as e:
        print(f"💥 [ERROR] {name}: {str(e)}")
        return False, str(e)

print("🔍 Running Comprehensive End-to-End Endpoint Health Checks...\n")

results = []

# 1. Pages
results.append(test_endpoint("Homepage GET /", f"{BASE_URL}/")[0])
results.append(test_endpoint("Dashboard GET /dashboard", f"{BASE_URL}/dashboard")[0])
results.append(test_endpoint("History GET /history", f"{BASE_URL}/history")[0])
results.append(test_endpoint("Docs & PRD GET /docs", f"{BASE_URL}/docs")[0])
results.append(test_endpoint("Report GET /report", f"{BASE_URL}/report")[0])
results.append(test_endpoint("Security Architecture GET /security", f"{BASE_URL}/security")[0])
results.append(test_endpoint("Privacy Policy GET /privacy", f"{BASE_URL}/privacy")[0])
results.append(test_endpoint("About Page GET /about", f"{BASE_URL}/about")[0])

# 2. Demo API
results.append(test_endpoint("Demo Scenarios GET /api/demo", f"{BASE_URL}/api/demo")[0])

# 3. Scans List API
results.append(test_endpoint("Scans List GET /api/scans", f"{BASE_URL}/api/scans")[0])

# 4. Message Scan API
scan_payload = {
    "content": "Congratulations! You have been selected for the position of Software Developer. Your salary will be ₹12 LPA. To complete your onboarding, you must pay a refundable equipment and registration fee of ₹18,500 within 2 hours. Send the payment through UPI to hr.vertextech@okaxis.",
    "analysisType": "JOB_OFFER",
    "scanType": "TEXT"
}
success, body = test_endpoint("Message Scan POST /api/scan", f"{BASE_URL}/api/scan", method="POST", data=scan_payload)
results.append(success)
if success:
    data = json.loads(body)
    print(f"   ↳ Threat Index: {data.get('threatScore')}% ({data.get('riskLevel')}), Indicators: {len(data.get('findings', []))}")

# 5. URL Scan API
url_payload = {
    "url": "https://micros0ft-careers-portal.xyz/login?ref=hr-onboarding"
}
success_url, body_url = test_endpoint("URL Scan POST /api/url-scan", f"{BASE_URL}/api/url-scan", method="POST", data=url_payload)
results.append(success_url)
if success_url:
    data_url = json.loads(body_url)
    print(f"   ↳ Threat Index: {data_url.get('threatScore')}% ({data_url.get('riskLevel')}), Domain: {data_url.get('domain')}")

# 6. Malformed JSON Check (Must return clean 400 Bad Request, NOT 500)
try:
    req_bad = urllib.request.Request(
        f"{BASE_URL}/api/scan",
        data=b"invalid-json",
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    urllib.request.urlopen(req_bad, timeout=5)
    print("❌ Bad JSON test should have returned 400")
    results.append(False)
except urllib.error.HTTPError as e:
    if e.code == 400:
        print("✅ [400] Malformed JSON handled with clean 400 Bad Request")
        results.append(True)
    else:
        print(f"❌ Bad JSON returned unexpected code: {e.code}")
        results.append(False)

print("\n" + "="*50)
if all(results):
    print(f"🎉 ALL {len(results)} CHECKS PASSED PERFECTLY! ZERO CRASHES OR MALFUNCTIONS.")
    sys.exit(0)
else:
    print(f"⚠️ {results.count(False)} out of {len(results)} checks failed.")
    sys.exit(1)

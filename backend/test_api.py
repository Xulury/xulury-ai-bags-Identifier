import requests

with open("test.jpg", "wb") as f:
    f.write(b"fake image data here just to test the API")

files = {'image': ('test.jpg', open('test.jpg', 'rb'), 'image/jpeg')}
try:
    response = requests.post("http://127.0.0.1:8001/api/v1/identify", files=files)
    print("Status Code:", response.status_code)
    print("Response JSON:", response.text)
except Exception as e:
    print("Request failed:", e)

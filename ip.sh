ip="ipconfig getifaddr en0"
ipaddress=$(eval $ip)
echo $ipaddress

 echo "NEXT_PUBLIC_API_BASE_URL=$ipaddress" > ./frontend/my-app/.env.local

 echo "HOST=$ipaddress" >> ./backend/auth/.env

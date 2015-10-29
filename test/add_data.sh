#!/bin/sh
# add couch
curl -X POST http://localhost:8005/api/v1/service/1.1.1.1:8080
curl -X POST http://localhost:8005/api/v1/service/2.2.2.2:8080
curl -X POST http://localhost:8005/api/v1/service/3.3.3.3:11211

# add project
value=$(perl -MURI::Escape -e 'print uri_escape("测试项目")')
curl -X POST http://localhost:8005/api/v1/project/$value -d 'services=["1.1.1.1:8080","2.2.2.2:8080"]'

# or
curl -X POST http://localhost:8005/api/v1/project/%E6%B5%8B%E8%AF%95%E9%A1%B9%E7%9B%AE -d 'services=["1.1.1.1:8080","2.2.2.2:8080"]'

# del data
curl -X DELETE http://localhost:8005/api/v1/service/1.1.1.1:8080
curl -X DELETE http://localhost:8005/api/v1/service/2.2.2.2:8080
curl -X DELETE http://localhost:8005/api/v1/service/3.3.3.3:11211
curl -X DELETE http://localhost:8005/api/v1/project/%E6%B5%8B%E8%AF%95%E9%A1%B9%E7%9B%AE
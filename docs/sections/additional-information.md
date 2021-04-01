# Additional information

## Bulk output example
```
my_application_name.response_time:157|ms|@0.05|#method:get,route:users__user_id,status_code:200
my_application_name.response_time:182|ms|@0.05|#method:get,route:users__user_id,status_code:200
my_application_name.response_time:355|ms|@0.05|#method:post,route:users_change_email,status_code:201
my_application_name.response_time:30|ms|#method:get,route:users__user_id,status_code:500
my_application_name.response_time:157|ms|@0.05|#method:get,route:users__user_id,status_code:200
```

## Recommended MTU buffer sizes
- **By protocol**
  - IPV4: 576
  - IPV6: 1500
- **By speed**
  - Commodity Internet: 512
  - Fast Ethernet: 1432
  - Gigabit Ethernet: 8932

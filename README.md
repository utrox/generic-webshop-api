# TODO

- Test API
- when deleting a product, remove all reviews associated with it.
- Only allow certain people to add products.
- Index page -> Documentation for API
- (?) Add authorization instead of temporary secretKey:
  - create model -> username, email, password fields
  - use bcrypt for password hashing
  - use cookie-parser package
  - after successful login, attach !secure, signed, httponly! cookie
  - when accessing route where authorization is needed, read that cookie.

-- Inject a dummy employee for testing purposes
-- Since password hashes are unique, we just copy the Admin's password hash so the dummy employee has the exact same password as the admin you registered!

INSERT INTO users (company_id, email, password_hash, full_name, role)
SELECT 
    id, 
    'employee@acme.com', 
    (SELECT password_hash FROM users WHERE role = 'ADMIN' LIMIT 1), 
    'Jane Employee', 
    'EMPLOYEE'
FROM companies 
LIMIT 1;

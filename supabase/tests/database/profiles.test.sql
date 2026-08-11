begin;
select plan(4);

-- Test 1: Check profiles table existence
select has_table('public', 'profiles', 'Profiles table should exist');

-- Test 2: Check columns
select has_column('public', 'profiles', 'user_id', 'Profiles table has user_id');
select has_column('public', 'profiles', 'username', 'Profiles table has username');

-- Test 3: Check Foreign Key constraint
select fk_ok('public', 'profiles', 'user_id', 'auth', 'users', 'id');

select * from finish();
rollback;

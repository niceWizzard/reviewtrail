begin;
select plan(6);

-- Test 1: Check profiles table existence
select has_table('public', 'profiles', 'Profiles table should exist');

-- Test 2: Check columns
select has_column('public', 'profiles', 'user_id', 'Profiles table has user_id');
select has_column('public', 'profiles', 'username', 'Profiles table has username');

-- Test 3: Check Foreign Key constraint
select fk_ok('public', 'profiles', 'user_id', 'auth', 'users', 'id');

-- Test 4: Check handle_new_user function existence
select has_function('public', 'handle_new_user', 'handle_new_user function should exist');

-- Test 5: Check trigger existence on auth.users
select has_trigger('auth', 'users', 'on_auth_user_created', 'on_auth_user_created trigger should exist on auth.users');

select * from finish();
rollback;

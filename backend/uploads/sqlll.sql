create database subquery_db;
use subquery_db;
create table employees(emp_id INT PRIMARY KEY,emp_name VARCHAR(50),salary FLOAT,department VARCHAR(50));
insert into employees values
(1,"rahul",45000,"accountant"),
(2,"virat",55000,"IT"),
(3,"shreyas",40000,"accountant"),
(4,"rohit",70000,"HR"),
(5,"samson",35000,"HR"),
(6,"sky",60000,"IT");
select emp_name,salary from employees where salary >(select avg(salary) from employees);
select avg(salary) from employees;
select emp_name,department from employees where department in(select department from employees where salary>50000);
select * from employees;
select emp_name,salary from employees where salary > any(select salary from employees where department ="hr");
select emp_name,salary from employees where salary > all(select salary from employees where department ="hr");
truncate table employees;
select emp_name,salary,department from employees e1 where salary>(select avg(salary) from employees e2 where e1.department=e2.department);



# HERE WE USE THIS CONVENTION TO COMMIT

### test:

    - indicates any type of creation or change of test codes
    - i.e: create new test for ABC

### feat:

    - indicate the development of a new feature to the project
    - i.e: add X endpoint

### refactor:

    - use when there is a refactor in the code that don't impact the logic or rules of the businees core
    - i.e: change to improve performance in fetch

### style:

    - use when there is some style changes in the code witch don't affect anything in the code base
    - i.e: change style-guide, change lint convention, order indetion, remove whitespaces, remove comments etc

### fix:

    - use when there is some error fix caming from system bugs
    - i.e: apply convertion to the function X return the correct object

### chore:

    - tells changes in the project where didn't affect the system or tests files
    - i.e: add folder or files to .gitignore, change eslint rules, add prettier, etc

### docs:

    - use when change the documentation
    - i.e: add documentation to the API endpont X, improve README for this ABC, etc

### build:

    - use to indicate the changes that affect the project build process or external deps
    - i.e: add or remove some dependency

### perf:

    - indicate some changes that improve the performance.
    - i.e: change some query, remove some loop or change the way some function are called, etc

### ci:

    - use to indicate changes in the configurations of CI/CD process and files
    - i.e: add Circle remove Travis, use the own Script to publish.

### revert:

    - indicate the reversion of a past commit.

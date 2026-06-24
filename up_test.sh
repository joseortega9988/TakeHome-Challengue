docker-compose -f docker-compose-test.yml up --build --force-recreate --abort-on-container-exit --exit-code-from test_runner

docker-compose -f docker-compose-test.yml down
